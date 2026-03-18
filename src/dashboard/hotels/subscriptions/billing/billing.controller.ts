import { Controller, ForbiddenException, Headers, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { BillingService } from './billing.service';

@ApiExcludeController()
@Controller('cron')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('billing')
  async processMonthlyBilling(@Headers('authorization') authorization: string) {
    if (
      !process.env.CRON_SECRET ||
      authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      throw new ForbiddenException('Invalid cron secret');
    }

    return this.billingService.processMonthlyBilling();
  }
}
