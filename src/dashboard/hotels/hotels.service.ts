import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(authUserUuid: string) {
    const hotels = await this.prisma.hotels.findMany({
      where: {
        users_hotels: {
          some: { user_uuid: authUserUuid },
        },
      },
    });
    return hotels;
  }

  async findOne(hotelUuid: string) {
    const hotel = await this.prisma.hotels.findUnique({
      where: { uuid: hotelUuid },
    });

    return hotel;
  }
}
