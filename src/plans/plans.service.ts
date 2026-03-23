import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.hotels_plans.findMany();
  }

  async findOneByCode(code: string) {
    const plan = await this.prisma.hotels_plans.findFirst({
      where: { code },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }
}
