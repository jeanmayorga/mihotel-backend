import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { AlbumsModule } from './albums/albums.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RoomsModule } from './rooms/rooms.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PlansModule } from '../../plans/plans.module';
import { ProductsModule } from './products/products.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [
    AccountsModule,
    AlbumsModule,
    InvoicesModule,
    RoomTypesModule,
    RoomsModule,
    SubscriptionModule,
    ReservationsModule,
    PlansModule,
    ProductsModule,
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class DashboardHotelsModule {}
