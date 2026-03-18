import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelAccessGuard } from '../../../../common/guards/hotel-access.guard';
import { PlansService } from './plans.service';

@ApiTags('Dashboard / Plans')
@ApiBearerAuth()
@UseGuards(HotelAccessGuard)
@Controller('dashboard/hotels/:hotelUuid/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.plansService.findOne(uuid);
  }
}
