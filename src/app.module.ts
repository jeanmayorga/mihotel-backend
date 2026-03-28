import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CronModule } from './modules/cron/cron.module';
import { PlansModule } from './modules/plans/plans.module';
import { CountriesModule } from './modules/countries/countries.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ResendModule } from './modules/resend/resend.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    AccountsModule,
    CountriesModule,
    CronModule,
    DashboardModule,
    HealthModule,
    PlansModule,
    PrismaModule,
    ResendModule,
    SupabaseModule,
    UsersModule,
  ],
  controllers: [],
  providers: [PermissionsGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
