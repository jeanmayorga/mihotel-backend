import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(authUserUuid: string) {
    this.logger.log(`Fetching hotels for user ${authUserUuid}`);
    return this.prisma.hotels.findMany({
      where: {
        users_hotels: {
          some: { user_uuid: authUserUuid },
        },
      },
    });
  }
}
