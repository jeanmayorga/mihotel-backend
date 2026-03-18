import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicModule } from './public/public.module';
import { UserHotelsService } from './dashboard/hotels/user_hotels/user_hotels.service';

@Module({
  imports: [PrismaModule, DashboardModule, PublicModule],
  controllers: [],
  providers: [
    UserHotelsService,
    // { provide: APP_GUARD, useClass: MeAccessGuard },
    // { provide: APP_GUARD, useClass: HotelAccessGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
