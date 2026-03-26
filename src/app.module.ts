import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UserHotelsService } from './modules/dashboard/hotels/user_hotels/user_hotels.service';
import { CronModule } from './modules/cron/cron.module';
import { PlansModule } from './modules/plans/plans.module';
import { CountriesModule } from './modules/countries/countries.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    CountriesModule,
    CronModule,
    DashboardModule,
    HealthModule,
    PlansModule,
    PrismaModule,
    SupabaseModule,
    UsersModule,
  ],
  controllers: [],
  providers: [UserHotelsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
