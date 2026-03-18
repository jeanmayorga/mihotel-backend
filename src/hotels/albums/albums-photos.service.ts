import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumPhotoDto } from './dto/create-album-photo.dto';
import { UpdateAlbumPhotoDto } from './dto/update-album-photo.dto';

@Injectable()
export class AlbumsPhotosService {
  private readonly logger = new Logger(AlbumsPhotosService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async validateAlbum(hotelUuid: string, albumUuid: string) {
    const album = await this.prisma.hotels_albums.findFirst({
      where: { uuid: albumUuid, hotel_uuid: hotelUuid },
    });

    if (!album) {
      throw new NotFoundException(`Album ${albumUuid} not found`);
    }

    return album;
  }

  async create(hotelUuid: string, albumUuid: string, dto: CreateAlbumPhotoDto) {
    this.logger.log(`Creating photo for album ${albumUuid}`);
    await this.validateAlbum(hotelUuid, albumUuid);

    return this.prisma.hotels_albums_photos.create({
      data: {
        album_uuid: albumUuid,
        ...dto,
      },
    });
  }

  async findAll(hotelUuid: string, albumUuid: string) {
    this.logger.log(`Fetching photos for album ${albumUuid}`);
    await this.validateAlbum(hotelUuid, albumUuid);

    return this.prisma.hotels_albums_photos.findMany({
      where: { album_uuid: albumUuid },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(hotelUuid: string, albumUuid: string, uuid: string) {
    this.logger.log(`Fetching photo ${uuid} for album ${albumUuid}`);
    await this.validateAlbum(hotelUuid, albumUuid);

    const photo = await this.prisma.hotels_albums_photos.findFirst({
      where: { uuid, album_uuid: albumUuid },
    });

    if (!photo) {
      throw new NotFoundException(`Photo ${uuid} not found`);
    }

    return photo;
  }

  async update(
    hotelUuid: string,
    albumUuid: string,
    uuid: string,
    dto: UpdateAlbumPhotoDto,
  ) {
    this.logger.log(`Updating photo ${uuid} for album ${albumUuid}`);
    await this.findOne(hotelUuid, albumUuid, uuid);

    return this.prisma.hotels_albums_photos.update({
      where: { uuid },
      data: dto,
    });
  }

  async remove(hotelUuid: string, albumUuid: string, uuid: string) {
    this.logger.log(`Deleting photo ${uuid} for album ${albumUuid}`);
    await this.findOne(hotelUuid, albumUuid, uuid);

    return this.prisma.hotels_albums_photos.delete({
      where: { uuid },
    });
  }
}
