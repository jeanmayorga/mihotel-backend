import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getReservationOrThrow(hotelUuid: string, reservationUuid: string) {
    const reservation = await this.prisma.hotels_reservations_v2.findFirst({
      where: { uuid: reservationUuid, hotel_uuid: hotelUuid },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationUuid} not found`);
    }

    return reservation;
  }

  async findAll(options: {
    hotelUuid: string;
    page: number;
    limit: number;
    orderBy: string;
    order: string;
    status?: string;
    roomUuid?: string;
    customerUuid?: string;
  }) {
    const {
      hotelUuid,
      page,
      limit,
      orderBy,
      order,
      status,
      roomUuid,
      customerUuid,
    } = options;
    const roomsFilter = {
      ...(status ? { status } : {}),
      ...(roomUuid ? { room_uuid: roomUuid } : {}),
    };
    const hasRoomsFilter = Object.keys(roomsFilter).length > 0;

    const reservations = await this.prisma.hotels_reservations_v2.findMany({
      where: {
        hotel_uuid: hotelUuid,
        ...(customerUuid ? { customer_uuid: customerUuid } : {}),
        ...(hasRoomsFilter ? { rooms: { some: roomsFilter } } : {}),
      },
      include: {
        rooms: {
          ...(hasRoomsFilter ? { where: roomsFilter } : {}),
          include: { room: true },
          orderBy: { created_at: 'asc' },
        },
        customer: true,
      },
      orderBy: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
    const hasMore = reservations.length === limit;

    return { data: reservations, hasMore };
  }

  async findOne(hotelUuid: string, reservationUuid: string) {
    const reservation = await this.prisma.hotels_reservations_v2.findFirst({
      where: { uuid: reservationUuid, hotel_uuid: hotelUuid },
      include: {
        rooms: {
          include: { room: true },
          orderBy: { created_at: 'asc' },
        },
        customer: true,
        invoice: true,
      },
    });

    return { data: reservation };
  }

  async create(
    hotelUuid: string,
    authUserUuid: string,
    dto: CreateReservationDto,
  ) {
    this.logger.log(`Creating reservation for hotel ${hotelUuid}`);

    return this.prisma.hotels_reservations_v2.create({
      data: {
        hotel_uuid: hotelUuid,
        customer_uuid: dto.customer_uuid,
        invoice_uuid: dto.invoice_uuid,
        source: dto.source ?? 'direct',
        notes: dto.notes,
        created_by: authUserUuid,
      },
    });
  }

  async update(
    hotelUuid: string,
    reservationUuid: string,
    dto: CreateReservationDto,
  ) {
    this.logger.log(`Updating reservation ${reservationUuid}`);
    await this.getReservationOrThrow(hotelUuid, reservationUuid);

    return this.prisma.hotels_reservations_v2.update({
      where: { uuid: reservationUuid },
      data: {
        ...(dto.customer_uuid !== undefined && {
          customer_uuid: dto.customer_uuid,
        }),
        ...(dto.invoice_uuid !== undefined && {
          invoice_uuid: dto.invoice_uuid,
        }),
        ...(dto.source !== undefined && { source: dto.source }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async calendar(options: {
    hotelUuid: string;
    from: string;
    to: string;
    status?: string;
  }) {
    const { hotelUuid, from, to, status } = options;

    // Todas las rooms del hotel
    const rooms = await this.prisma.hotels_rooms.findMany({
      where: { hotel_uuid: hotelUuid },
      orderBy: { created_at: 'asc' },
    });

    if (rooms.length === 0) return { data: [] };

    // Reservation rooms que se solapan con el rango de fechas
    const reservationRooms =
      await this.prisma.hotels_reservations_rooms_v2.findMany({
        where: {
          reservations: { hotel_uuid: hotelUuid },
          check_in_date: { lte: new Date(to) },
          check_out_date: { gte: new Date(from) },
          ...(status && status !== 'all' ? { status } : {}),
        },
        include: {
          reservations: {
            include: { customer: true },
          },
        },
        orderBy: { check_in_date: 'asc' },
      });

    // Agrupar por room
    const roomsMap = new Map(
      rooms.map((room) => [
        room.uuid,
        { ...room, reservations: [] as typeof reservationRooms },
      ]),
    );

    for (const rr of reservationRooms) {
      const room = roomsMap.get(rr.room_uuid);
      if (room) {
        room.reservations.push(rr);
      }
    }

    return { data: Array.from(roomsMap.values()) };
  }

  async remove(hotelUuid: string, reservationUuid: string) {
    this.logger.log(`Deleting reservation ${reservationUuid}`);
    await this.getReservationOrThrow(hotelUuid, reservationUuid);
    await this.prisma.hotels_reservations_v2.delete({
      where: { uuid: reservationUuid },
    });
  }
}
