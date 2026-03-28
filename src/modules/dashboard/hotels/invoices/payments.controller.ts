import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AccountRequiredGuard } from 'src/common/guards/account-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';
import { AuthUserUuid } from 'src/common/decorators/auth-user-uuid.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Dashboard / Invoice Payments')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/invoices/:invoiceUuid/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  addPayment(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.addPayment(
      hotelUuid,
      invoiceUuid,
      authUserUuid,
      dto,
    );
  }

  @Patch(':paymentUuid')
  updatePayment(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('paymentUuid', ParseUUIDPipe) paymentUuid: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.updatePayment(
      hotelUuid,
      invoiceUuid,
      paymentUuid,
      dto,
    );
  }

  @Delete(':paymentUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePayment(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('paymentUuid', ParseUUIDPipe) paymentUuid: string,
  ) {
    return this.paymentsService.removePayment(
      hotelUuid,
      invoiceUuid,
      paymentUuid,
    );
  }
}
