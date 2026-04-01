import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { formatIsoDateOnly } from '../../../../common/helpers/format-iso-date-only';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private formatReservation(
    reservation: Prisma.hotels_reservations_v2GetPayload<{
      include: {
        rooms: {
          include: { room: true };
        };
        customer: true;
        invoice: true;
      };
    }> | null,
  ) {
    if (!reservation) return null;

    return {
      ...reservation,
      rooms: reservation.rooms.map((r) => ({
        ...r,
        check_in_date: formatIsoDateOnly(r.check_in_date),
        check_out_date: formatIsoDateOnly(r.check_out_date),
      })),
    };
  }

  async getReservationOrThrow(hotelUuid: string, reservationUuid: string) {
    const reservation = await this.prisma.hotels_reservations_v2.findFirst({
      where: { uuid: reservationUuid, hotel_uuid: hotelUuid },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationUuid} not found`);
    }

    return reservation;
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

    return {
      data: this.formatReservation(reservation),
    };
  }

  async delete(hotelUuid: string, reservationUuid: string) {
    await this.prisma.hotels_reservations_v2.delete({
      where: { uuid: reservationUuid, hotel_uuid: hotelUuid },
    });
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
    return this.prisma.hotels_reservations_v2.update({
      where: { uuid: reservationUuid, hotel_uuid: hotelUuid },
      data: dto,
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
          reservation: { hotel_uuid: hotelUuid },
          check_in_date: { lte: new Date(to) },
          check_out_date: { gte: new Date(from) },
          ...(status && status !== 'all' ? { status } : {}),
        },
        include: {
          reservation: {
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
}
