import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypesService {
  private readonly logger = new Logger(RoomTypesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(hotelUuid: string, dto: CreateRoomTypeDto) {
    this.logger.log(`Creating room type for hotel ${hotelUuid}`);
    return this.prisma.hotels_rooms_types.create({
      data: {
        hotel_uuid: hotelUuid,
        ...dto,
      },
    });
  }

  async findAll(hotelUuid: string) {
    this.logger.log(`Fetching room types for hotel ${hotelUuid}`);
    return this.prisma.hotels_rooms_types.findMany({
      where: { hotel_uuid: hotelUuid },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(hotelUuid: string, uuid: string) {
    this.logger.log(`Fetching room type ${uuid} for hotel ${hotelUuid}`);
    const roomType = await this.prisma.hotels_rooms_types.findFirst({
      where: { uuid, hotel_uuid: hotelUuid },
    });

    if (!roomType) {
      throw new NotFoundException(`Room type ${uuid} not found`);
    }

    return roomType;
  }

  async update(hotelUuid: string, uuid: string, dto: UpdateRoomTypeDto) {
    this.logger.log(`Updating room type ${uuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, uuid);

    return this.prisma.hotels_rooms_types.update({
      where: { uuid },
      data: dto,
    });
  }

  async remove(hotelUuid: string, uuid: string) {
    this.logger.log(`Deleting room type ${uuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, uuid);

    return this.prisma.hotels_rooms_types.delete({
      where: { uuid },
    });
  }
}
