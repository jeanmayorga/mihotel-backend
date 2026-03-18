import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelAccessGuard } from '../../../common/guards/hotel-access.guard';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { RoomTypesService } from './room-types.service';

@ApiTags('Dashboard / Room Types')
@ApiBearerAuth()
@UseGuards(HotelAccessGuard)
@Controller('dashboard/hotels/:hotelUuid/rooms/:roomUuid/types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  create(
    @Param('hotelUuid') hotelUuid: string,
    @Body() dto: CreateRoomTypeDto,
  ) {
    return this.roomTypesService.create(hotelUuid, dto);
  }

  @Get()
  findAll(@Param('hotelUuid') hotelUuid: string) {
    return this.roomTypesService.findAll(hotelUuid);
  }

  @Get(':uuid')
  findOne(@Param('hotelUuid') hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomTypesService.findOne(hotelUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @Param('hotelUuid') hotelUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRoomTypeDto,
  ) {
    return this.roomTypesService.update(hotelUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(@Param('hotelUuid') hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomTypesService.remove(hotelUuid, uuid);
  }
}
