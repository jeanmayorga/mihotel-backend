import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelAccessGuard } from '../../common/guards/hotel-access.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(HotelAccessGuard)
@Controller('hotels/:hotelUuid/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  findByHotel(@Param('hotelUuid') hotelUuid: string) {
    return this.subscriptionsService.findByHotel(hotelUuid);
  }

  @Post()
  create(
    @Param('hotelUuid') hotelUuid: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(hotelUuid, dto);
  }

  @Patch()
  changePlan(
    @Param('hotelUuid') hotelUuid: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.changePlan(hotelUuid, dto);
  }

  @Get('invoices')
  findInvoices(@Param('hotelUuid') hotelUuid: string) {
    return this.subscriptionsService.findInvoices(hotelUuid);
  }
}
