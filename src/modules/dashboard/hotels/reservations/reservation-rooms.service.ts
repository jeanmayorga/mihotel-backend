import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReservationsService } from './reservations.service';
import { Prisma } from '@prisma/client';
import { formatIsoDateOnly } from '../../../../common/helpers/format-iso-date-only';
import { endOfMonth, startOfMonth } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { CreateReservationRoomDto } from './reservations.dto';

@Injectable()
export class ReservationRoomsService {
  private readonly logger = new Logger(ReservationRoomsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationsService: ReservationsService,
  ) {}

  private formatReservationRoom<
    T extends { check_in_date: Date; check_out_date: Date },
  >(row: T) {
    return {
      ...row,
      check_in_date: formatIsoDateOnly(row.check_in_date),
      check_out_date: formatIsoDateOnly(row.check_out_date),
    };
  }

  async getSummary(options: {
    hotelUuid: string;
    from?: string;
    to?: string;
    orderBy?: string;
    hotelTimezone?: string;
  }) {
    const {
      hotelUuid,
      from = startOfMonth(new Date()),
      to = endOfMonth(new Date()),
      orderBy = 'check_in_date',
      hotelTimezone = 'America/Guayaquil',
    } = options;

    let rangeFilter: Prisma.hotels_reservations_rooms_v2WhereInput | undefined;
    //check in
    if (orderBy === 'check_in_date') {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const checkIn = { gte: fromDate, lte: toDate };
      rangeFilter = { check_in_date: checkIn };
    }
    //created at
    if (orderBy === 'created_at') {
      const fromDate = fromZonedTime(from, hotelTimezone);
      const toDate = fromZonedTime(to, hotelTimezone);
      const createdAt = { gte: fromDate, lte: toDate };
      rangeFilter = { created_at: createdAt };
    }

    const groupedByStatus =
      await this.prisma.hotels_reservations_rooms_v2.groupBy({
        by: ['status'],
        where: {
          reservation: { hotel_uuid: hotelUuid },
          ...rangeFilter,
        },
        _count: { _all: true },
      });

    const summary = {
      total: 0,
      pending: 0,
      confirmed: 0,
      checked_in: 0,
      checked_out: 0,
      no_show: 0,
      cancelled: 0,
    };

    for (const item of groupedByStatus) {
      const count = item._count._all;
      summary.total += count;

      if (item.status === 'pending') summary.pending = count;
      if (item.status === 'confirmed') summary.confirmed = count;
      if (item.status === 'checked_in') summary.checked_in = count;
      if (item.status === 'checked_out') summary.checked_out = count;
      if (item.status === 'no_show') summary.no_show = count;
      if (item.status === 'cancelled') summary.cancelled = count;
    }

    return { data: summary };
  }

  async findAll(options: {
    hotelUuid: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: string;
    from?: string;
    to?: string;
    search?: string;
    status?: string;
    roomUuid?: string;
    customerUuid?: string;
    hotelTimezone?: string;
  }) {
    const {
      hotelUuid,
      page = 1,
      limit = 20,
      orderBy = 'check_in_date',
      order = 'desc',
      from = startOfMonth(new Date()),
      to = endOfMonth(new Date()),
      search,
      status,
      roomUuid,
      customerUuid,
      hotelTimezone = 'America/Guayaquil',
    } = options;

    let rangeFilter: Prisma.hotels_reservations_rooms_v2WhereInput | undefined;
    //check in
    if (orderBy === 'check_in_date') {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const checkIn = { gte: fromDate, lte: toDate };
      rangeFilter = { check_in_date: checkIn };
    }
    //created at
    if (orderBy === 'created_at') {
      const fromDate = fromZonedTime(from, hotelTimezone);
      const toDate = fromZonedTime(to, hotelTimezone);
      const createdAt = { gte: fromDate, lte: toDate };
      rangeFilter = { created_at: createdAt };
    }

    const sortDirection: Prisma.SortOrder = order === 'asc' ? 'asc' : 'desc';
    const orderByFields: Prisma.hotels_reservations_rooms_v2OrderByWithRelationInput[] =
      [
        { [orderBy]: sortDirection },
        { created_at: sortDirection },
        { reservation: { reservation_number: sortDirection } },
      ];

    //customer uuid
    const customerUuidFilter = customerUuid
      ? { customer_uuid: customerUuid }
      : undefined;

    //status
    const statusFilter = status ? { status } : undefined;

    //room uuid
    const roomUuidFilter = roomUuid ? { room_uuid: roomUuid } : undefined;

    //customer search
    const searchCustomerFilter = search
      ? {
          customer: {
            is: {
              full_name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        }
      : {};

    const reservations =
      await this.prisma.hotels_reservations_rooms_v2.findMany({
        where: {
          reservation: {
            hotel_uuid: hotelUuid,
            ...customerUuidFilter,
            ...searchCustomerFilter,
          },
          ...roomUuidFilter,
          ...statusFilter,
          ...rangeFilter,
        },
        include: {
          room: true,
          reservation: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: orderByFields,
        skip: (page - 1) * limit,
        take: limit,
      });
    const hasMore = reservations.length === limit;

    return {
      data: reservations.map((row) => this.formatReservationRoom(row)),
      hasMore,
    };
  }

  async findOne(reservationRoomUuid: string) {
    const reservationRoom =
      await this.prisma.hotels_reservations_rooms_v2.findFirst({
        where: { uuid: reservationRoomUuid },
      });

    if (!reservationRoom) {
      return null;
    }
    return this.formatReservationRoom(reservationRoom);
  }

  async findOneOrThrow(reservationRoomUuid: string) {
    const reservationRoom = await this.findOne(reservationRoomUuid);
    if (!reservationRoom) {
      throw new NotFoundException(
        `Reservation room ${reservationRoomUuid} not found`,
      );
    }
    return reservationRoom;
  }

  async create(
    hotelUuid: string,
    reservationUuid: string,
    dto: CreateReservationRoomDto,
  ) {
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );
    const created = await this.prisma.hotels_reservations_rooms_v2.create({
      data: {
        reservation_uuid: reservationUuid,
        room_uuid: dto.room_uuid,
        check_in_date: dto.check_in_date,
        check_out_date: dto.check_out_date,
        adults_count: dto.adults_count,
        children_count: dto.children_count,
        babies_count: dto.babies_count,
        price_per_night: dto.price_per_night,
        number_of_nights: dto.number_of_nights,
        total_price: dto.total_price,
      },
    });

    return this.formatReservationRoom(created);
  }

  async update(
    hotelUuid: string,
    reservationUuid: string,
    reservationRoomUuid: string,
    dto: Partial<CreateReservationRoomDto>,
  ) {
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );
    const updated = await this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: reservationRoomUuid },
      data: {
        ...(dto.room_uuid !== undefined && { room_uuid: dto.room_uuid }),
        ...(dto.check_in_date !== undefined && {
          check_in_date: new Date(dto.check_in_date),
        }),
        ...(dto.check_out_date !== undefined && {
          check_out_date: new Date(dto.check_out_date),
        }),
        ...(dto.adults_count !== undefined && {
          adults_count: dto.adults_count,
        }),
        ...(dto.children_count !== undefined && {
          children_count: dto.children_count,
        }),
        ...(dto.babies_count !== undefined && {
          babies_count: dto.babies_count,
        }),
        ...(dto.price_per_night !== undefined && {
          price_per_night: dto.price_per_night,
        }),
        ...(dto.number_of_nights !== undefined && {
          number_of_nights: dto.number_of_nights,
        }),
        ...(dto.total_price !== undefined && { total_price: dto.total_price }),
      },
    });

    return this.formatReservationRoom(updated);
  }

  async remove(
    hotelUuid: string,
    reservationUuid: string,
    reservationRoomUuid: string,
  ) {
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );
    await this.prisma.hotels_reservations_rooms_v2.delete({
      where: { uuid: reservationRoomUuid },
    });
    const missingReservationRooms =
      await this.prisma.hotels_reservations_rooms_v2.findMany({
        where: { reservation_uuid: reservationUuid },
      });
    if (missingReservationRooms.length === 0) {
      await this.reservationsService.delete(hotelUuid, reservationUuid);
    }
    return { data: 'Reservation room removed successfully' };
  }

  async pending(reservationRoomUuid: string) {
    this.logger.log(
      `Marking reservation room as pending ${reservationRoomUuid}`,
    );
    await this.findOneOrThrow(reservationRoomUuid);
    const pending = await this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: reservationRoomUuid },
      data: {
        status: 'pending',
      },
    });
    return this.formatReservationRoom(pending);
  }

  async confirm(reservationRoomUuid: string) {
    this.logger.log(`Confirming reservation room ${reservationRoomUuid}`);
    await this.findOneOrThrow(reservationRoomUuid);
    const confirmed = await this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: reservationRoomUuid },
      data: {
        status: 'confirmed',
        confirmed_at: new Date(),
      },
    });

    return this.formatReservationRoom(confirmed);
  }

  async checkIn(reservationRoomUuid: string) {
    this.logger.log(`Check-in reservation room ${reservationRoomUuid}`);
    await this.findOneOrThrow(reservationRoomUuid);

    const checkedIn = await this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: reservationRoomUuid },
      data: {
        status: 'checked_in',
        checked_in_at: new Date(),
      },
    });

    return this.formatReservationRoom(checkedIn);
  }

  async checkOut(reservationRoomUuid: string) {
    this.logger.log(`Check-out reservation room ${reservationRoomUuid}`);
    await this.findOneOrThrow(reservationRoomUuid);

    const checkedOut = await this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: reservationRoomUuid },
      data: {
        status: 'checked_out',
        checked_out_at: new Date(),
      },
    });

    return this.formatReservationRoom(checkedOut);
  }

  async noShow(reservationRoomUuid: string) {
    this.logger.log(`No show reservation room ${reservationRoomUuid}`);
    await this.findOneOrThrow(reservationRoomUuid);

    const noShow = await this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: reservationRoomUuid },
      data: {
        status: 'no_show',
        no_show_at: new Date(),
      },
    });

    return this.formatReservationRoom(noShow);
  }

  async cancel(reservationRoomUuid: string) {
    this.logger.log(`Cancelling reservation room ${reservationRoomUuid}`);
    await this.findOneOrThrow(reservationRoomUuid);

    const cancelled = await this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: reservationRoomUuid },
      data: {
        status: 'cancelled',
        cancelled_at: new Date(),
      },
    });

    return this.formatReservationRoom(cancelled);
  }
}
