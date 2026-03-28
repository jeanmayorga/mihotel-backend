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
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { RoomTypesService } from './room-types.service';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AccountRequiredGuard } from 'src/common/guards/account-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';

@ApiTags('Dashboard / Room Types')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/rooms/:roomUuid/types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateRoomTypeDto) {
    return this.roomTypesService.create(hotelUuid, dto);
  }

  @Get()
  findAll(@HotelUuid() hotelUuid: string) {
    return this.roomTypesService.findAll(hotelUuid);
  }

  @Get(':uuid')
  findOne(@HotelUuid() hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomTypesService.findOne(hotelUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRoomTypeDto,
  ) {
    return this.roomTypesService.update(hotelUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(@HotelUuid() hotelUuid: string, @Param('uuid') uuid: string) {
    return this.roomTypesService.remove(hotelUuid, uuid);
  }
}
