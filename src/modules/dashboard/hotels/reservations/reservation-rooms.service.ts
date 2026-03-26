import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateReservationRoomDto } from './dto/create-reservation-room.dto';
import { ReservationsService } from './reservations.service';

@Injectable()
export class ReservationRoomsService {
  private readonly logger = new Logger(ReservationRoomsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationsService: ReservationsService,
  ) {}

  async addRoom(
    hotelUuid: string,
    reservationUuid: string,
    dto: CreateReservationRoomDto,
  ) {
    this.logger.log(`Adding room to reservation ${reservationUuid}`);
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );

    return this.prisma.hotels_reservations_rooms_v2.create({
      data: {
        reservation_uuid: reservationUuid,
        room_uuid: dto.room_uuid,
        check_in_date: new Date(dto.check_in_date),
        check_out_date: new Date(dto.check_out_date),
        adults_count: dto.adults_count ?? 1,
        children_count: dto.children_count ?? 0,
        babies_count: dto.babies_count ?? 0,
        price_per_night: dto.price_per_night,
      },
    });
  }

  async updateRoom(
    hotelUuid: string,
    reservationUuid: string,
    roomUuid: string,
    dto: Partial<CreateReservationRoomDto>,
  ) {
    this.logger.log(
      `Updating room ${roomUuid} in reservation ${reservationUuid}`,
    );
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );

    const current = await this.prisma.hotels_reservations_rooms_v2.findFirst({
      where: { uuid: roomUuid, reservation_uuid: reservationUuid },
    });

    if (!current) {
      throw new NotFoundException(`Reservation room ${roomUuid} not found`);
    }

    return this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: roomUuid },
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
      },
    });
  }

  async removeRoom(
    hotelUuid: string,
    reservationUuid: string,
    roomUuid: string,
  ) {
    this.logger.log(
      `Removing room ${roomUuid} from reservation ${reservationUuid}`,
    );
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );

    await this.prisma.hotels_reservations_rooms_v2.delete({
      where: { uuid: roomUuid, reservation_uuid: reservationUuid },
    });
  }

  async checkIn(hotelUuid: string, reservationUuid: string, roomUuid: string) {
    this.logger.log(`Check-in room ${roomUuid}`);
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );

    return this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: roomUuid, reservation_uuid: reservationUuid },
      data: {
        status: 'checked_in',
        checked_in_at: new Date(),
      },
    });
  }

  async checkOut(hotelUuid: string, reservationUuid: string, roomUuid: string) {
    this.logger.log(`Check-out room ${roomUuid}`);
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );

    return this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: roomUuid, reservation_uuid: reservationUuid },
      data: {
        status: 'checked_out',
        checked_out_at: new Date(),
      },
    });
  }

  async cancel(hotelUuid: string, reservationUuid: string, roomUuid: string) {
    this.logger.log(`Cancel room ${roomUuid}`);
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );

    return this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: roomUuid, reservation_uuid: reservationUuid },
      data: {
        status: 'cancelled',
        cancelled_at: new Date(),
      },
    });
  }

  async confirm(hotelUuid: string, reservationUuid: string, roomUuid: string) {
    this.logger.log(`Confirm room ${roomUuid}`);
    await this.reservationsService.getReservationOrThrow(
      hotelUuid,
      reservationUuid,
    );

    return this.prisma.hotels_reservations_rooms_v2.update({
      where: { uuid: roomUuid, reservation_uuid: reservationUuid },
      data: {
        status: 'confirmed',
        confirmed_at: new Date(),
      },
    });
  }
}
