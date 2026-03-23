import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFreHotelDto } from './hotels.dto';
import { PlansService } from 'src/plans/plans.service';
import { startOfLocalDay } from 'src/common/helpers/billing-cycle';
import slugify from 'slugify';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
  ) {}

  async create(authUserUuid: string, dto: CreateFreHotelDto) {
    const hotel = await this.prisma.$transaction(async (tx) => {
      const name = dto.name.trim();
      const slugName = slugify(name, {
        replacement: '-',
        lower: true,
        strict: true,
        locale: 'en',
        trim: true,
      });
      //TODO:REFACTOR THIS TO USE UNIQUE SLUG USING COUNTRY-CITY-NAME FORMAT
      // const slug = `${country}-${city}-${slugName}`;
      const slugExists = await tx.hotels.findFirst({
        where: { slug: slugName },
      });
      if (slugExists) {
        throw new BadRequestException('Hotel with this slug already exists');
      }

      const hotel = await tx.hotels.create({
        data: {
          title: dto.name,
          slug: slugName,
          timezone: dto.timezone ?? 'America/Guayaquil',
        },
      });
      const freePlan = await this.plansService.findOneByCode('free');
      const timezone = hotel.timezone;
      const cycleStart = startOfLocalDay(new Date(), timezone);

      await tx.hotels_subscriptions.create({
        data: {
          hotel_uuid: hotel.uuid,
          plan_uuid: freePlan.uuid,
          status: 'active',
          start_at: cycleStart,
        },
      });

      return await tx.users_hotels.create({
        data: {
          user_uuid: authUserUuid,
          hotel_uuid: hotel.uuid,
          role: 'admin',
          modules: [],
        },
        include: { hotel: { include: { subscriptions: true } } },
      });
    });

    return hotel;
  }

  async delete(hotelUuid: string) {
    await this.prisma.hotels.delete({
      where: { uuid: hotelUuid },
    });
  }
}
