import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MeHotelsService {
  private readonly logger = new Logger(MeHotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userUuid: string) {
    const hotels = await this.prisma.hotels.findMany({
      where: { users_hotels: { some: { user_uuid: userUuid } } },
    });

    if (!hotels) {
      throw new NotFoundException(`No hotels found for user ${userUuid}`);
    }

    return hotels;
  }
}
