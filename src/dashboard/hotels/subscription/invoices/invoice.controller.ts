import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { SubscriptionUuid } from '../../../../common/decorators/subscription-uuid.decorator';
import { AuthRequiredGuard } from '../../../../common/guards/auth-required.guard';
import { UserHotelRequiredGuard } from '../../../../common/guards/user-hotel-required.guard';
import { InvoiceService } from './invoice.service';
import { GetInvoicesQueryDto } from './invoices.dto';

@ApiTags('Dashboard / Subscription')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, UserHotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/subscription/invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll(
    @SubscriptionUuid() subscriptionUuid: string,
    @Query() query: GetInvoicesQueryDto,
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    return this.invoiceService.findAll({ subscriptionUuid, page, limit });
  }
}
