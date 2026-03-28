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
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AlbumsService } from './albums.service';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AccountRequiredGuard } from 'src/common/guards/account-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';

@ApiTags('Dashboard / Albums')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateAlbumDto) {
    return this.albumsService.create(hotelUuid, dto);
  }

  @Get()
  findAll(@HotelUuid() hotelUuid: string) {
    return this.albumsService.findAll(hotelUuid);
  }

  @Get(':uuid')
  findOne(@HotelUuid() hotelUuid: string, @Param('uuid') uuid: string) {
    return this.albumsService.findOne(hotelUuid, uuid);
  }

  @Patch(':uuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(hotelUuid, uuid, dto);
  }

  @Delete(':uuid')
  remove(@HotelUuid() hotelUuid: string, @Param('uuid') uuid: string) {
    return this.albumsService.remove(hotelUuid, uuid);
  }
}
