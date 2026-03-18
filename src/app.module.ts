import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MeModule } from './me/me.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { HotelsModule } from './hotels/hotels.module';
import { RoomTypesModule } from './hotels/room-types/room-types.module';
import { RoomsModule } from './hotels/rooms/rooms.module';
import { SubscriptionsModule } from './hotels/subscriptions/subscriptions.module';
import { AlbumsModule } from './hotels/albums/albums.module';

@Module({
  imports: [
    PrismaModule,
    MeModule,
    HotelsModule,
    RoomsModule,
    RoomTypesModule,
    SubscriptionsModule,
    AlbumsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
