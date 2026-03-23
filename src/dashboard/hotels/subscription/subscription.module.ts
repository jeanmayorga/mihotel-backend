import { Module } from '@nestjs/common';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { InvoiceController } from './invoices/invoice.controller';
import { InvoiceService } from './invoices/invoice.service';

@Module({
  imports: [UserHotelsModule],
  controllers: [SubscriptionController, InvoiceController],
  providers: [SubscriptionService, InvoiceService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
