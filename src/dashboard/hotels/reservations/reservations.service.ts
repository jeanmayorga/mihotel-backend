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
  }) {
    const { hotelUuid, page, limit, orderBy, order } = options;

    const reservations = await this.prisma.hotels_reservations_v2.findMany({
      where: { hotel_uuid: hotelUuid },
      include: {
        rooms: {
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

  async remove(hotelUuid: string, reservationUuid: string) {
    this.logger.log(`Deleting reservation ${reservationUuid}`);
    await this.getReservationOrThrow(hotelUuid, reservationUuid);
    await this.prisma.hotels_reservations_v2.delete({
      where: { uuid: reservationUuid },
    });
  }
}
