import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { AlbumsModule } from './albums/albums.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RoomsModule } from './rooms/rooms.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UserHotelsModule } from './user_hotels/user_hotels.module';

@Module({
  imports: [
    AlbumsModule,
    RoomTypesModule,
    RoomsModule,
    SubscriptionsModule,
    UserHotelsModule,
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class DashboardHotelsModule {}
