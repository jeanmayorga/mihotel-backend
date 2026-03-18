import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    disabled: boolean;
  }) {
    const { page, limit, sortBy, sortOrder, disabled } = options;
    const skip = (page - 1) * limit;

    this.logger.log(options);

    return this.prisma.hotels.findMany({
      orderBy: { [sortBy]: sortOrder },
      where: { disabled },
      skip,
      take: limit,
    });
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
