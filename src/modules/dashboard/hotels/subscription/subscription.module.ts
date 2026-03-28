import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { InvoiceController } from './invoices/invoice.controller';
import { InvoiceService } from './invoices/invoice.service';

@Module({
  controllers: [SubscriptionController, InvoiceController],
  providers: [SubscriptionService, InvoiceService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
