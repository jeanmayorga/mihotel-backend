import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(authUserUuid: string) {
    const dashboard = await this.prisma.public_users.findUnique({
      where: { uuid: authUserUuid },
      include: {
        users_hotels: {
          include: {
            hotels: true,
          },
        },
      },
    });

    return dashboard;
  }
}
