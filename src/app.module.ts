import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MeModule } from './dashboard/me/me.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { HotelsModule } from './hotels/hotels.module';
import { RoomTypesModule } from './dashboard/hotels/room-types/room-types.module';
import { RoomsModule } from './dashboard/hotels/rooms/rooms.module';
import { SubscriptionsModule } from './dashboard/hotels/subscriptions/subscriptions.module';
import { AlbumsModule } from './dashboard/hotels/albums/albums.module';
import { MeAccessGuard } from './common/guards/me-access.guard';

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
  providers: [AppService, { provide: APP_GUARD, useClass: MeAccessGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
