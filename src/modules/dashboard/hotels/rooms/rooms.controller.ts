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
import { AuthRequiredGuard } from '../../../../common/guards/auth-required.guard';
import { AccountRequiredGuard } from '../../../../common/guards/account-required.guard';
import { HotelUuid } from '../../../../common/decorators/hotel-uuid.decorator';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { GetRoomParamsDto } from './rooms.dto';
@ApiTags('Dashboard / Rooms')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard, AccountRequiredGuard, PermissionsGuard)
@Controller('dashboard/hotels/:hotelUuid/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(hotelUuid, dto);
  }

  @Get()
  @RequirePermissions('rooms:read')
  async findAll(
    @HotelUuid() hotelUuid: string,
    @Query() query: GetRoomsQueryDto,
  ) {
    const orderBy = String(query.orderBy ?? 'created_at');
    const order = String(query.order ?? 'desc');
    const search = query.search;

    const rooms = await this.roomsService.findAll({
      hotelUuid,
      orderBy,
      order,
      search,
    });
    return { data: rooms };
  }

  @Get(':uuid')
  @RequirePermissions('rooms:read')
  async findOne(
    @HotelUuid() hotelUuid: string,
    @Param() params: GetRoomParamsDto,
  ) {
    const room = await this.roomsService.findOne(hotelUuid, params.uuid);

    return { data: room };
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
