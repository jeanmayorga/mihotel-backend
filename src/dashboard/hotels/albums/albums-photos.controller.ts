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
import { CreateAlbumPhotoDto } from './dto/create-album-photo.dto';
import { UpdateAlbumPhotoDto } from './dto/update-album-photo.dto';
import { AlbumsPhotosService } from './albums-photos.service';

@ApiTags('Dashboard / Albums Photos')
@ApiBearerAuth()
@UseGuards(HotelAccessGuard)
@Controller('dashboard/hotels/:hotelUuid/albums/:albumUuid/photos')
export class AlbumsPhotosController {
  constructor(private readonly albumsPhotosService: AlbumsPhotosService) {}

  @Post()
  create(
    @Param('hotelUuid') hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Body() dto: CreateAlbumPhotoDto,
  ) {
    return this.albumsPhotosService.create(hotelUuid, albumUuid, dto);
  }

  @Get()
  findAll(
    @Param('hotelUuid') hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
  ) {
    return this.albumsPhotosService.findAll(hotelUuid, albumUuid);
  }

  @Get(':uuid')
  findOne(
    @Param('hotelUuid') hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Param('uuid') uuid: string,
  ) {
    return this.albumsPhotosService.findOne(hotelUuid, albumUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @Param('hotelUuid') hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateAlbumPhotoDto,
  ) {
    return this.albumsPhotosService.update(hotelUuid, albumUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(
    @Param('hotelUuid') hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Param('uuid') uuid: string,
  ) {
    return this.albumsPhotosService.remove(hotelUuid, albumUuid, uuid);
  }
}
