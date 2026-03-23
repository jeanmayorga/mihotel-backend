import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFreHotelDto, UpdateHotelDto } from './hotels.dto';
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

  private async generateUniqueSlug(
    tx: any,
    name: string,
    cityUuid: string,
  ): Promise<string> {
    const base = slugify(name, {
      replacement: '-',
      lower: true,
      strict: true,
      locale: 'en',
      trim: true,
    });

    let slug = base;
    let counter = 1;

    while (
      await tx.hotels.findFirst({ where: { slug, city_uuid: cityUuid } })
    ) {
      slug = `${base}-${++counter}`;
    }

    return slug;
  }

  async create(authUserUuid: string, dto: CreateFreHotelDto) {
    const hotel = await this.prisma.$transaction(async (tx) => {
      const city = await tx.cities.findUnique({
        where: { uuid: dto.city_uuid },
      });

      if (!city) {
        throw new BadRequestException('City not found');
      }

      if (city.country_uuid !== dto.country_uuid) {
        throw new BadRequestException(
          'City does not belong to the selected country',
        );
      }

      const name = dto.name.trim();
      const slug = await this.generateUniqueSlug(tx, name, dto.city_uuid);

      const hotel = await tx.hotels.create({
        data: {
          name,
          title: name,
          slug,
          country_uuid: dto.country_uuid,
          city_uuid: dto.city_uuid,
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

  async update(hotelUuid: string, dto: UpdateHotelDto) {
    const hotel = await this.prisma.hotels.findUnique({
      where: { uuid: hotelUuid },
      select: { city_uuid: true, country_uuid: true },
    });

    if (!hotel) {
      throw new BadRequestException('Hotel not found');
    }

    const cityUuid = dto.city_uuid ?? hotel.city_uuid ?? undefined;
    let countryUuid = dto.country_uuid ?? hotel.country_uuid ?? undefined;

    if (dto.city_uuid) {
      const city = await this.prisma.cities.findUnique({
        where: { uuid: dto.city_uuid },
      });

      if (!city) {
        throw new BadRequestException('City not found');
      }

      if (dto.country_uuid && city.country_uuid !== dto.country_uuid) {
        throw new BadRequestException(
          'City does not belong to the selected country',
        );
      }

      if (!dto.country_uuid) {
        countryUuid = city.country_uuid;
      }
    }

    if (dto.country_uuid && !dto.city_uuid && hotel.city_uuid) {
      const city = await this.prisma.cities.findUnique({
        where: { uuid: hotel.city_uuid },
      });

      if (!city) {
        throw new BadRequestException('City not found');
      }

      if (city.country_uuid !== dto.country_uuid) {
        throw new BadRequestException(
          'Current city does not belong to the selected country. Update city_uuid too.',
        );
      }
    }

    return this.prisma.hotels.update({
      where: { uuid: hotelUuid },
      data: {
        ...dto,
        city_uuid: cityUuid,
        country_uuid: countryUuid,
      },
    });
  }

  async delete(hotelUuid: string) {
    await this.prisma.hotels.delete({
      where: { uuid: hotelUuid },
    });
  }
}
