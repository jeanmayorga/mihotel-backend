import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationRoomsController } from './reservation-rooms.controller';
import { ReservationRoomsService } from './reservation-rooms.service';

@Module({
  controllers: [ReservationsController, ReservationRoomsController],
  providers: [ReservationsService, ReservationRoomsService],
})
export class ReservationsModule {}
