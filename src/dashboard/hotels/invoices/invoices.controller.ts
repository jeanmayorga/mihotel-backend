import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../../common/guards/auth-required.guard';
import { HotelRequiredGuard } from '../../../common/guards/hotel-required.guard';
import { HotelUuid } from '../../../common/decorators/hotel-uuid.decorator';
import { AuthUserUuid } from '../../../common/decorators/auth-user-uuid.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetInvoicesQueryDto } from './dto/get-invoices-query.dto';

@ApiTags('Dashboard / Invoices')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@HotelUuid() hotelUuid: string, @Query() query: GetInvoicesQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const orderBy = String(query.orderBy ?? 'created_at');
    const order = String(query.order ?? 'desc');
    const from = query.from;
    const to = query.to;
    const search = query.search;
    const status = query.status;

    return this.invoicesService.findAll({
      hotelUuid,
      page,
      limit,
      orderBy,
      order,
      from,
      to,
      search,
      status,
    });
  }

  @Get(':invoiceUuid')
  findOne(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
  ) {
    return this.invoicesService.findOne({ hotelUuid, invoiceUuid });
  }

  @Post()
  create(
    @HotelUuid() hotelUuid: string,
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(hotelUuid, authUserUuid, dto);
  }

  @Patch(':invoiceUuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.update(hotelUuid, invoiceUuid, dto);
  }

  @Delete(':invoiceUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
  ) {
    return this.invoicesService.remove(hotelUuid, invoiceUuid);
  }
}
