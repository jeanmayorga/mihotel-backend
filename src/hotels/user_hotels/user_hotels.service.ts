import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserHotelsService {
  private readonly logger = new Logger(UserHotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userUuid: string) {
    return this.prisma.users_hotels.findMany({
      where: { user_uuid: userUuid },
      include: {
        hotels: true,
      },
    });
  }
}
