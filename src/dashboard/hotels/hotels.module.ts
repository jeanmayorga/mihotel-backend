import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { AlbumsModule } from './albums/albums.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RoomsModule } from './rooms/rooms.module';
import { UserHotelsModule } from './user_hotels/user_hotels.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PlansModule } from 'src/plans/plans.module';

@Module({
  imports: [
    AlbumsModule,
    InvoicesModule,
    RoomTypesModule,
    RoomsModule,
    SubscriptionModule,
    UserHotelsModule,
    ReservationsModule,
    PlansModule,
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class DashboardHotelsModule {}
