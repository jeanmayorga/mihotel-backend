import { Controller, ForbiddenException, Get, Headers } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cron')
@Controller('cron/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiOperation({ summary: 'Process monthly billing' })
  @Get()
  async processMonthlyBillingGet(
    @Headers('authorization') authorization?: string,
  ) {
    if (
      !process.env.CRON_SECRET ||
      authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      throw new ForbiddenException('Invalid cron secret');
    }

    return this.billingService.processMonthlyBilling();
  }
}
