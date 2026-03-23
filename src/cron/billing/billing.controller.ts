import { Controller, ForbiddenException, Get, Headers } from '@nestjs/common';
import { BillingService } from './billing.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cron / Billing')
@Controller('cron')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiOperation({ summary: 'Process monthly billing' })
  @Get('billing')
  async processMonthlyBillingGet(
    @Headers('authorization') authorization: string | undefined,
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
