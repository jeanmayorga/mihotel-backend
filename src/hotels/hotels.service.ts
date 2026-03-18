import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    this.logger.log('Fetching all hotels');
    const hotels = await this.prisma.hotels.findMany();
    this.logger.log(`Found ${hotels.length} hotels`);
    return hotels;
  }
}
