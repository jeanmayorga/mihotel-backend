import { Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';

@ApiTags('Dashboard / Subscriptions')
@Controller('cron')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('billing')
  async processMonthlyBilling() {
    // console.log(process.env.CRON_SECRET, authorization);
    // if (
    //   !process.env.CRON_SECRET ||
    //   authorization !== `Bearer ${process.env.CRON_SECRET}`
    // ) {
    //   throw new ForbiddenException('Invalid cron secret');
    // }

    return this.billingService.processMonthlyBilling();
  }
}
