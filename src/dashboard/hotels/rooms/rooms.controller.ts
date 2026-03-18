import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelAccessGuard } from '../../../common/guards/hotel-access.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { FilterRoomsDto } from './dto/filter-rooms.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Dashboard / Rooms')
@ApiBearerAuth()
@UseGuards(HotelAccessGuard)
@Controller('dashboard/hotels/:hotelUuid/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Param('hotelUuid') hotelUuid: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(hotelUuid, dto);
  }

  @Get()
  findAll(
    @Param('hotelUuid') hotelUuid: string,
    @Query() { sortBy, sortOrder }: FilterRoomsDto,
  ) {
    return this.roomsService.findAll(hotelUuid, sortBy, sortOrder);
  }

  @Get(':uuid')
  findOne(@Param('hotelUuid') hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomsService.findOne(hotelUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @Param('hotelUuid') hotelUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(hotelUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(@Param('hotelUuid') hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomsService.remove(hotelUuid, uuid);
  }
}
