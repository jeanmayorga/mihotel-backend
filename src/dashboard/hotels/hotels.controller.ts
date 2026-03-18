import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AuthUserUuid } from 'src/common/decorators/auth-user-uuid.decorator';
import { HotelRequiredGuard } from 'src/common/guards/hotel-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';

@ApiTags('Dashboard / Hotels')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard)
@Controller('dashboard/hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(@AuthUserUuid() authUserUuid: string) {
    return this.hotelsService.findAll(authUserUuid);
  }

  @Get(':hotelUuid')
  @UseGuards(HotelRequiredGuard)
  findOne(@HotelUuid() hotelUuid: string) {
    return this.hotelsService.findOne(hotelUuid);
  }
}
