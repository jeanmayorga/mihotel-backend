import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';
import { HotelRequiredGuard } from 'src/common/guards/hotel-required.guard';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';

@ApiTags('Dashboard / Subscriptions')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  findByHotel(@HotelUuid() hotelUuid: string) {
    return this.subscriptionsService.findByHotel(hotelUuid);
  }

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(hotelUuid, dto);
  }

  @Patch()
  changePlan(
    @HotelUuid() hotelUuid: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.changePlan(hotelUuid, dto);
  }

  @Get('invoices')
  findInvoices(@HotelUuid() hotelUuid: string) {
    return this.subscriptionsService.findInvoices(hotelUuid);
  }
}
