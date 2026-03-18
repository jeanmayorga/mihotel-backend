import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Post,
} from '@nestjs/common';
// import { ApiExcludeController } from '@nestjs/swagger';
import { BillingService } from './billing.service';

// @ApiExcludeController()
@Controller('cron')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  private async processCron(authorization: string | undefined) {
    if (
      !process.env.CRON_SECRET ||
      authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      throw new ForbiddenException('Invalid cron secret');
    }

    return this.billingService.processMonthlyBilling();
  }

  @Post('billing')
  async processMonthlyBilling(
    @Headers('authorization') authorization: string | undefined,
  ) {
    return this.processCron(authorization);
  }

  @Get('billing')
  async processMonthlyBillingGet(
    @Headers('authorization') authorization: string | undefined,
  ) {
    return this.processCron(authorization);
  }
}
