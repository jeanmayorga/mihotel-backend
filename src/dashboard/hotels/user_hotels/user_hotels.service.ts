import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserHotelsService {
  private readonly logger = new Logger(UserHotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHotelContext(userUuid: string, hotelUuid: string) {
    const userHotel = await this.prisma.users_hotels.findFirst({
      where: { user_uuid: userUuid, hotel_uuid: hotelUuid },
      select: { hotels: { select: { timezone: true } } },
    });

    const hasAccess = Boolean(userHotel);
    const timezone = userHotel?.hotels?.timezone ?? 'America/Guayaquil';

    return { hasAccess, timezone };
  }
}
