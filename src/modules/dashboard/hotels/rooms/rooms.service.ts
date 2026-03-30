import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryMode } from 'generated/prisma/internal/prismaNamespace';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(hotelUuid: string, dto: CreateRoomDto) {
    this.logger.log(`Creating room for hotel ${hotelUuid}`);
    return this.prisma.hotels_rooms.create({
      data: {
        hotel_uuid: hotelUuid,
        ...dto,
      },
      include: {
        room_type: true,
        hotels_rooms_images: true,
      },
    });
  }

  async findAll(options: {
    hotelUuid: string;
    orderBy: string;
    order: string;
    search?: string;
  }) {
    const { hotelUuid, orderBy, order, search } = options;

    // search filter
    const searchFilter = search
      ? { name: { contains: search, mode: QueryMode.insensitive } }
      : {};

    const rooms = await this.prisma.hotels_rooms.findMany({
      where: {
        hotel_uuid: hotelUuid,
        ...searchFilter,
      },
      include: {
        room_type: true,
        hotels_albums: {
          include: {
            hotels_albums_photos: { orderBy: { position: 'asc' } },
          },
        },
      },
      orderBy: { [orderBy]: order },
    });
    return rooms;
  }

  async findOne(hotelUuid: string, uuid: string) {
    const room = await this.prisma.hotels_rooms.findFirst({
      where: { uuid, hotel_uuid: hotelUuid },
      include: {
        room_type: true,
        hotels_albums: {
          include: {
            hotels_albums_photos: { orderBy: { position: 'asc' } },
          },
        },
      },
    });

    return room;
  }

  async update(hotelUuid: string, uuid: string, dto: UpdateRoomDto) {
    this.logger.log(`Updating room ${uuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, uuid);

    return this.prisma.hotels_rooms.update({
      where: { uuid },
      data: dto,
      include: {
        room_type: true,
        hotels_rooms_images: true,
      },
    });
  }

  async remove(hotelUuid: string, uuid: string) {
    this.logger.log(`Deleting room ${uuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, uuid);

    return this.prisma.hotels_rooms.delete({
      where: { uuid },
    });
  }
}
