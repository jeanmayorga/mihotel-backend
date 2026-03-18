import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelAccessGuard } from '../common/guards/hotel-access.guard';
import { HotelsService } from './hotels.service';

@ApiTags('Hotels')
@ApiBearerAuth()
@UseGuards(HotelAccessGuard)
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get(':hotelUuid')
  findOne(@Param('hotelUuid') hotelUuid: string) {
    return this.hotelsService.findOne(hotelUuid);
  }
}
