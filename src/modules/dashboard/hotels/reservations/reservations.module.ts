import { Module } from '@nestjs/common';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationRoomsController } from './reservation-rooms.controller';
import { ReservationRoomsService } from './reservation-rooms.service';

@Module({
  imports: [UserHotelsModule],
  controllers: [ReservationsController, ReservationRoomsController],
  providers: [ReservationsService, ReservationRoomsService],
})
export class ReservationsModule {}
