import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumsService {
  private readonly logger = new Logger(AlbumsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(hotelUuid: string, dto: CreateAlbumDto) {
    this.logger.log(`Creating album for hotel ${hotelUuid}`);
    return this.prisma.hotels_albums.create({
      data: {
        hotel_uuid: hotelUuid,
        ...dto,
      },
      include: { hotels_albums_photos: true },
    });
  }

  async findAll(hotelUuid: string) {
    this.logger.log(`Fetching albums for hotel ${hotelUuid}`);
    return this.prisma.hotels_albums.findMany({
      where: { hotel_uuid: hotelUuid },
      include: { hotels_albums_photos: { orderBy: { position: 'asc' } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(hotelUuid: string, uuid: string) {
    this.logger.log(`Fetching album ${uuid} for hotel ${hotelUuid}`);
    const album = await this.prisma.hotels_albums.findFirst({
      where: { uuid, hotel_uuid: hotelUuid },
      include: { hotels_albums_photos: { orderBy: { position: 'asc' } } },
    });

    if (!album) {
      throw new NotFoundException(`Album ${uuid} not found`);
    }

    return album;
  }

  async update(hotelUuid: string, uuid: string, dto: UpdateAlbumDto) {
    this.logger.log(`Updating album ${uuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, uuid);

    return this.prisma.hotels_albums.update({
      where: { uuid },
      data: dto,
      include: { hotels_albums_photos: { orderBy: { position: 'asc' } } },
    });
  }

  async remove(hotelUuid: string, uuid: string) {
    this.logger.log(`Deleting album ${uuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, uuid);

    return this.prisma.hotels_albums.delete({
      where: { uuid },
    });
  }
}
