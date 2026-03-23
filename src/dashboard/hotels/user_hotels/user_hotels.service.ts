import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserHotelDto } from './user_hotel.dto';

@Injectable()
export class UserHotelsService {
  private readonly logger = new Logger(UserHotelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserUuid(userUuid: string) {
    return await this.prisma.users_hotels.findMany({
      where: { user_uuid: userUuid },
      include: {
        hotel: {
          include: {
            subscriptions: true,
          },
        },
      },
    });
  }

  async findAllByHotelUuid(hotelUuid: string) {
    return await this.prisma.users_hotels.findMany({
      where: { hotel_uuid: hotelUuid },
      include: {
        hotel: {
          include: {
            subscriptions: true,
          },
        },
      },
    });
  }

  async findOneActiveWithSubscription(userUuid: string, hotelUuid: string) {
    return await this.prisma.users_hotels.findFirst({
      where: { user_uuid: userUuid, hotel_uuid: hotelUuid },
      include: {
        hotel: {
          include: {
            subscriptions: {
              where: {
                status: 'active',
              },
            },
          },
        },
      },
    });
  }

  async create(dto: CreateUserHotelDto) {
    return await this.prisma.users_hotels.create({
      data: {
        user_uuid: dto.user_uuid,
        hotel_uuid: dto.hotel_uuid,
        role: dto.role,
        modules: dto.modules ?? [],
      },
    });
  }

  async getHotelContext(userUuid: string, hotelUuid: string) {
    const userHotel = await this.prisma.users_hotels.findFirst({
      where: { user_uuid: userUuid, hotel_uuid: hotelUuid },
      select: { hotel: { select: { timezone: true } } },
    });

    const hasAccess: boolean = Boolean(userHotel);
    const timezone: string = userHotel?.hotel?.timezone ?? 'America/Guayaquil';

    return { hasAccess, timezone };
  }
}
