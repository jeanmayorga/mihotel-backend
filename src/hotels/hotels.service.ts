import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOne(hotelUuid: string) {
    return this.prisma.hotels.findUnique({
      where: { uuid: hotelUuid },
      include: {
        users_hotels: true,
      },
    });
  }
}
