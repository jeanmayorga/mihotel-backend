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
import { CreateRoomDto } from './dto/create-room.dto';
import { FilterRoomsDto } from './dto/filter-rooms.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';
import { AuthRequiredGuard } from '../../../common/guards/auth-required.guard';
import { HotelRequiredGuard } from '../../../common/guards/hotel-required.guard';
import { HotelUuid } from '../../../common/decorators/hotel-uuid.decorator';

@ApiTags('Dashboard / Rooms')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(hotelUuid, dto);
  }

  @Get()
  findAll(
    @HotelUuid() hotelUuid: string,
    @Query() { sortBy, sortOrder }: FilterRoomsDto,
  ) {
    return this.roomsService.findAll(hotelUuid, sortBy, sortOrder);
  }

  @Get(':uuid')
  findOne(@HotelUuid() hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomsService.findOne(hotelUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(hotelUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(@HotelUuid() hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomsService.remove(hotelUuid, uuid);
  }
}
