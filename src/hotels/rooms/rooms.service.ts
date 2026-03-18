import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { FilterRoomsDto } from './dto/filter-rooms.dto';

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
        hotels_rooms_types: true,
        hotels_rooms_images: true,
      },
    });
  }

  async findAll(
    hotelUuid: string,
    sortBy: FilterRoomsDto['sortBy'] = 'created_at',
    sortOrder: FilterRoomsDto['sortOrder'] = 'desc',
  ) {
    this.logger.log(`Fetching rooms for hotel ${hotelUuid}`);
    return this.prisma.hotels_rooms.findMany({
      where: { hotel_uuid: hotelUuid },
      include: {
        hotels_rooms_types: true,
        hotels_rooms_images: {
          select: { url: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async findOne(hotelUuid: string, uuid: string) {
    this.logger.log(`Fetching room ${uuid} for hotel ${hotelUuid}`);
    const room = await this.prisma.hotels_rooms.findFirst({
      where: { uuid, hotel_uuid: hotelUuid },
      include: {
        hotels_rooms_types: true,
        hotels_rooms_images: true,
      },
    });

    if (!room) {
      throw new NotFoundException(`Room ${uuid} not found`);
    }

    return room;
  }

  async update(hotelUuid: string, uuid: string, dto: UpdateRoomDto) {
    this.logger.log(`Updating room ${uuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, uuid);

    return this.prisma.hotels_rooms.update({
      where: { uuid },
      data: dto,
      include: {
        hotels_rooms_types: true,
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
