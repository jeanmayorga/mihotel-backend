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
import { AuthRequiredGuard } from '../../../common/guards/auth-required.guard';
import { HotelRequiredGuard } from '../../../common/guards/hotel-required.guard';
import { HotelUuid } from '../../../common/decorators/hotel-uuid.decorator';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';

@ApiTags('Dashboard / Invoice Items')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/invoices/:invoiceUuid/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  addItem(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemsService.addItem(hotelUuid, invoiceUuid, dto);
  }

  @Patch(':itemUuid')
  updateItem(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('itemUuid', ParseUUIDPipe) itemUuid: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemsService.updateItem(hotelUuid, invoiceUuid, itemUuid, dto);
  }

  @Delete(':itemUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(
    @HotelUuid() hotelUuid: string,
    @Param('invoiceUuid', ParseUUIDPipe) invoiceUuid: string,
    @Param('itemUuid', ParseUUIDPipe) itemUuid: string,
  ) {
    return this.itemsService.removeItem(hotelUuid, invoiceUuid, itemUuid);
  }
}
