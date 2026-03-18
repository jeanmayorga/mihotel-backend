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
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumsService } from './albums.service';

@ApiTags('Dashboard / Albums')
@ApiBearerAuth()
@UseGuards(HotelAccessGuard)
@Controller('dashboard/hotels/:hotelUuid/albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  create(@Param('hotelUuid') hotelUuid: string, @Body() dto: CreateAlbumDto) {
    return this.albumsService.create(hotelUuid, dto);
  }

  @Get()
  findAll(@Param('hotelUuid') hotelUuid: string) {
    return this.albumsService.findAll(hotelUuid);
  }

  @Get(':uuid')
  findOne(@Param('hotelUuid') hotelUuid: string, @Param('uuid') uuid: string) {
    return this.albumsService.findOne(hotelUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @Param('hotelUuid') hotelUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(hotelUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(@Param('hotelUuid') hotelUuid: string, @Param('uuid') uuid: string) {
    return this.albumsService.remove(hotelUuid, uuid);
  }
}
