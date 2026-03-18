import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Get(':hotelUuid')
  findOne(@Param('hotelUuid') hotelUuid: string) {
    return this.hotelsService.findOne(hotelUuid);
  }
}
