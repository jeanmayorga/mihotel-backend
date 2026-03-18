import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserHotelsService {
  private readonly logger = new Logger(UserHotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async hasAccessToHotel(userUuid: string, hotelUuid: string) {
    this.logger.log(
      `Checking if user ${userUuid} has access to hotel ${hotelUuid}`,
    );
    const userHotel = await this.prisma.users_hotels.findFirst({
      where: { user_uuid: userUuid, hotel_uuid: hotelUuid },
    });
    return Boolean(userHotel);
  }
}
