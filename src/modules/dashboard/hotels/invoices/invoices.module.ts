import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';
import { TaxesController } from './taxes.controller';
import { TaxesService } from './taxes.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  controllers: [
    InvoicesController,
    ItemsController,
    DiscountsController,
    TaxesController,
    PaymentsController,
    RefundsController,
  ],
  providers: [
    InvoicesService,
    ItemsService,
    DiscountsService,
    TaxesService,
    PaymentsService,
    RefundsService,
  ],
})
export class InvoicesModule {}
