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
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { HotelRequiredGuard } from 'src/common/guards/hotel-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';
import { HotelTimezone } from 'src/common/decorators/hotel-timezone.decorator';
import { AuthUserUuid } from 'src/common/decorators/auth-user-uuid.decorator';
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
  findAll(
    @HotelUuid() hotelUuid: string,
    @HotelTimezone() hotelTimezone: string,
    @Query() query: GetInvoicesQueryDto,
  ) {
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
      timezone: hotelTimezone,
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

  @Get('summary')
  getSummary(
    @HotelUuid() hotelUuid: string,
    @HotelTimezone() hotelTimezone: string,
    @Query() query: GetInvoicesQueryDto,
  ) {
    const from = query.from;
    const to = query.to;

    return this.invoicesService.getSummary({
      hotelUuid,
      timezone: hotelTimezone,
      from,
      to,
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

  @Post(':invoiceUuid/cancel')
  cancel(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
  ) {
    return this.invoicesService.cancel(hotelUuid, invoiceUuid);
  }

  @Post(':invoiceUuid/reactivate')
  reactivate(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
  ) {
    return this.invoicesService.reactivate(hotelUuid, invoiceUuid);
  }
}
