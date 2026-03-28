import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../../../common/guards/auth-required.guard';
import { AccountRequiredGuard } from '../../../../common/guards/account-required.guard';
import { HotelUuid } from '../../../../common/decorators/hotel-uuid.decorator';
import { AuthUserUuid } from '../../../../common/decorators/auth-user-uuid.decorator';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@ApiTags('Dashboard / Invoice Refunds')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/invoices/:invoiceUuid/refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  addRefund(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreateRefundDto,
  ) {
    return this.refundsService.addRefund(
      hotelUuid,
      invoiceUuid,
      authUserUuid,
      dto,
    );
  }

  @Delete(':refundUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRefund(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('refundUuid', ParseUUIDPipe) refundUuid: string,
  ) {
    return this.refundsService.removeRefund(hotelUuid, invoiceUuid, refundUuid);
  }
}
