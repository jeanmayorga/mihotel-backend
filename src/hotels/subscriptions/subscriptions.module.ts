import { Module } from '@nestjs/common';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PlansController } from './plans/plans.controller';
import { PlansService } from './plans/plans.service';
import { BillingService } from './billing/billing.service';
import { BillingController } from './billing/billing.controller';

@Module({
  imports: [UserHotelsModule],
  controllers: [SubscriptionsController, PlansController, BillingController],
  providers: [SubscriptionsService, PlansService, BillingService],
})
export class SubscriptionsModule {}
