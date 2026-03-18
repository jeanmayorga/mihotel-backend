import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.hotels.findMany();
  }

  async findOne(uuid: string) {
    const hotel = await this.prisma.hotels.findUnique({
      where: { uuid },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel ${uuid} not found`);
    }

    return hotel;
  }
}
