import { Module } from '@nestjs/common';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { BillingService } from './billing/billing.service';
import { BillingController } from './billing/billing.controller';

@Module({
  imports: [UserHotelsModule],
  controllers: [SubscriptionsController, BillingController],
  providers: [SubscriptionsService, BillingService],
})
export class SubscriptionsModule {}
