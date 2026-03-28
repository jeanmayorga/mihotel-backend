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
import { AuthRequiredGuard } from '../../../../common/guards/auth-required.guard';
import { AccountRequiredGuard } from '../../../../common/guards/account-required.guard';
import { HotelUuid } from '../../../../common/decorators/hotel-uuid.decorator';
import { AuthUserUuid } from '../../../../common/decorators/auth-user-uuid.decorator';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';

@ApiTags('Dashboard / Invoice Discounts')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/invoices/:invoiceUuid/discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  addDiscount(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreateDiscountDto,
  ) {
    return this.discountsService.addDiscount(
      hotelUuid,
      invoiceUuid,
      authUserUuid,
      dto,
    );
  }

  @Patch(':discountUuid')
  updateDiscount(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('discountUuid', ParseUUIDPipe) discountUuid: string,
    @Body() dto: CreateDiscountDto,
  ) {
    return this.discountsService.updateDiscount(
      hotelUuid,
      invoiceUuid,
      discountUuid,
      dto,
    );
  }

  @Delete(':discountUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDiscount(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('discountUuid', ParseUUIDPipe) discountUuid: string,
  ) {
    return this.discountsService.removeDiscount(
      hotelUuid,
      invoiceUuid,
      discountUuid,
    );
  }
}
