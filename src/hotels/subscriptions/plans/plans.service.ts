import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    this.logger.log('Fetching all plans');
    return this.prisma.hotels_plans.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async findOne(uuid: string) {
    this.logger.log(`Fetching plan ${uuid}`);
    const plan = await this.prisma.hotels_plans.findUnique({
      where: { uuid },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${uuid} not found`);
    }

    return plan;
  }
}
