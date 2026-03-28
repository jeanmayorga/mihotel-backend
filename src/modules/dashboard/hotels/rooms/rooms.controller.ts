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
import { GetRoomsQueryDto } from './dto/get-rooms-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AccountRequiredGuard } from 'src/common/guards/account-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';

@ApiTags('Dashboard / Rooms')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(hotelUuid, dto);
  }

  @Get()
  findAll(@HotelUuid() hotelUuid: string, @Query() query: GetRoomsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const orderBy = String(query.orderBy ?? 'created_at');
    const order = String(query.order ?? 'desc');
    const search = query.search;

    return this.roomsService.findAll({
      hotelUuid,
      page,
      limit,
      orderBy,
      order,
      search,
    });
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
