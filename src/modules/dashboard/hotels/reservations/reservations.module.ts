import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationRoomsService } from './reservation-rooms.service';

@Module({
  imports: [],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationRoomsService],
})
export class ReservationsModule {}
