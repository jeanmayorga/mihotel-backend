import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { CreateFreHotelDto, UpdateHotelDto } from './hotels.dto';
import { PlansService } from 'src/modules/plans/plans.service';
import { startOfLocalDay } from 'src/common/helpers/billing-cycle';
import slugify from 'slugify';

type MinSubscription = Prisma.hotels_subscriptionsGetPayload<{
  include: {
    plan: true;
    _count: { select: { hotels_subscription_invoices: true } };
  };
}>;

type Hotel = Prisma.hotelsGetPayload<{
  include: {
    users_hotels: true;
  };
}> & {
  subscriptions: MinSubscription[];
};

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
  ) {}

  private readonly subscriptionsInclude = {
    include: {
      plan: true,
      _count: {
        select: {
          hotels_subscription_invoices: {
            where: { status: 'pending' },
          },
        },
      },
    },
  } as const;

  private formatSubscription(subscription: MinSubscription | undefined) {
    if (!subscription) return null;
    const { _count, ...rest } = subscription;
    const is_overdue = _count.hotels_subscription_invoices > 0;
    return { ...rest, is_overdue };
  }

  private formatHotel(hotel: Hotel) {
    const { subscriptions, ...rest } = hotel;
    return {
      ...rest,
      subscription: this.formatSubscription(subscriptions[0]),
    };
  }

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

  async findAllByUserUuid(userUuid: string) {
    const hotels = await this.prisma.hotels.findMany({
      where: { users_hotels: { some: { user_uuid: userUuid } } },
      include: {
        users_hotels: true,
        subscriptions: this.subscriptionsInclude,
      },
      orderBy: { created_at: 'asc' },
    });

    return hotels.map((hotel) => this.formatHotel(hotel));
  }

  async findOne(hotelUuid: string) {
    const hotel = await this.prisma.hotels.findUnique({
      where: { uuid: hotelUuid },
      include: {
        users_hotels: true,
        subscriptions: this.subscriptionsInclude,
      },
    });

    if (!hotel) return hotel;

    return this.formatHotel(hotel);
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
    return this.prisma.$transaction(async (tx) => {
      const hotel = await tx.hotels.findUnique({
        where: { uuid: hotelUuid },
        select: { uuid: true },
      });

      if (!hotel) {
        throw new BadRequestException('Hotel not found');
      }

      return tx.hotels.update({
        where: { uuid: hotelUuid },
        data: dto,
        include: {
          users_hotels: true,
          subscriptions: true,
        },
      });
    });
  }

  async delete(hotelUuid: string) {
    await this.prisma.hotels.delete({
      where: { uuid: hotelUuid },
    });
  }

  async validateSlug(
    slug: string,
    cityUuid: string,
  ): Promise<{ is_valid: boolean; suggested_slug: string | null }> {
    const base = slugify(slug, {
      replacement: '-',
      lower: true,
      strict: true,
      locale: 'en',
      trim: true,
    });
    console.log('HERE', slug, base, slug !== base);
    if (slug !== base) {
      return { is_valid: false, suggested_slug: base };
    }

    const taken = await this.prisma.hotels.findFirst({
      where: { slug, city_uuid: cityUuid },
    });
    if (!taken) {
      return { is_valid: true, suggested_slug: null };
    }

    let counter = 1;
    let suggested_slug: string;
    do {
      suggested_slug = `${slug}-${++counter}`;
    } while (
      await this.prisma.hotels.findFirst({
        where: { slug: suggested_slug, city_uuid: cityUuid },
      })
    );

    return { is_valid: false, suggested_slug };
  }
}
