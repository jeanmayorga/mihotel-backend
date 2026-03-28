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
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';

@ApiTags('Dashboard / Invoice Taxes')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/invoices/:invoiceUuid/taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  addTax(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreateTaxDto,
  ) {
    return this.taxesService.addTax(hotelUuid, invoiceUuid, authUserUuid, dto);
  }

  @Patch(':taxUuid')
  updateTax(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('taxUuid', ParseUUIDPipe) taxUuid: string,
    @Body() dto: CreateTaxDto,
  ) {
    return this.taxesService.updateTax(hotelUuid, invoiceUuid, taxUuid, dto);
  }

  @Delete(':taxUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTax(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('taxUuid', ParseUUIDPipe) taxUuid: string,
  ) {
    return this.taxesService.removeTax(hotelUuid, invoiceUuid, taxUuid);
  }
}
