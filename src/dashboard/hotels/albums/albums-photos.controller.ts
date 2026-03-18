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
import { CreateAlbumPhotoDto } from './dto/create-album-photo.dto';
import { UpdateAlbumPhotoDto } from './dto/update-album-photo.dto';
import { AlbumsPhotosService } from './albums-photos.service';
import { AuthRequiredGuard } from '../../../common/guards/auth-required.guard';
import { HotelRequiredGuard } from '../../../common/guards/hotel-required.guard';
import { HotelUuid } from '../../../common/decorators/hotel-uuid.decorator';

@ApiTags('Dashboard / Albums')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/albums/:albumUuid/photos')
export class AlbumsPhotosController {
  constructor(private readonly albumsPhotosService: AlbumsPhotosService) {}

  @Post()
  create(
    @HotelUuid() hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Body() dto: CreateAlbumPhotoDto,
  ) {
    return this.albumsPhotosService.create(hotelUuid, albumUuid, dto);
  }

  @Get()
  findAll(
    @HotelUuid() hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
  ) {
    return this.albumsPhotosService.findAll(hotelUuid, albumUuid);
  }

  @Get(':uuid')
  findOne(
    @HotelUuid() hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Param('uuid') uuid: string,
  ) {
    return this.albumsPhotosService.findOne(hotelUuid, albumUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateAlbumPhotoDto,
  ) {
    return this.albumsPhotosService.update(hotelUuid, albumUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(
    @HotelUuid() hotelUuid: string,
    @Param('albumUuid') albumUuid: string,
    @Param('uuid') uuid: string,
  ) {
    return this.albumsPhotosService.remove(hotelUuid, albumUuid, uuid);
  }
}
