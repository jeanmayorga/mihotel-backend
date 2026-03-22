import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  localDayOfMonth,
  nextMonthlyBillingDate,
  startOfLocalDay,
} from '../../../common/helpers/billing-cycle';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getSubscription(hotelUuid: string) {
    const subscription = await this.prisma.hotels_subscriptions.findFirst({
      where: { hotel_uuid: hotelUuid },
      include: { hotels_plans: true, hotels: { select: { timezone: true } } },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for hotel ${hotelUuid}`,
      );
    }

    return subscription;
  }

  async findByHotel(hotelUuid: string) {
    this.logger.log(`Fetching subscription for hotel ${hotelUuid}`);
    return this.getSubscription(hotelUuid);
  }

  async create(hotelUuid: string, dto: CreateSubscriptionDto) {
    this.logger.log(`Creating subscription for hotel ${hotelUuid}`);

    const existing = await this.prisma.hotels_subscriptions.findFirst({
      where: { hotel_uuid: hotelUuid },
    });

    if (existing) {
      throw new ConflictException(
        `Hotel ${hotelUuid} already has a subscription`,
      );
    }

    const plan = await this.prisma.hotels_plans.findUnique({
      where: { uuid: dto.plan_uuid },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.plan_uuid} not found`);
    }

    const hotel = await this.prisma.hotels.findUnique({
      where: { uuid: hotelUuid },
      select: { timezone: true },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel ${hotelUuid} not found`);
    }

    const timezone = hotel.timezone ?? 'America/Guayaquil';
    const cycleStart = startOfLocalDay(new Date(), timezone);
    const billingAnchorDay = localDayOfMonth(cycleStart, timezone);
    const nextBillingAt =
      (plan.price ?? 0) > 0
        ? nextMonthlyBillingDate(cycleStart, timezone, billingAnchorDay)
        : null;

    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.hotels_subscriptions.create({
        data: {
          hotel_uuid: hotelUuid,
          plan_uuid: dto.plan_uuid,
          status: 'active',
          start_at: cycleStart,
          next_billing_at: nextBillingAt,
          billing_anchor_day: billingAnchorDay,
        },
        include: { hotels_plans: true },
      });

      if ((plan.price ?? 0) > 0 && nextBillingAt) {
        await tx.hotels_subscription_invoices.create({
          data: {
            subscription_uuid: subscription.uuid,
            amount: plan.price,
            status: 'pending',
            billing_period_start: cycleStart,
            billing_period_end: nextBillingAt,
          },
        });
      }

      return subscription;
    });
  }

  async changePlan(hotelUuid: string, dto: UpdateSubscriptionDto) {
    this.logger.log(`Changing plan for hotel ${hotelUuid}`);

    const subscription = await this.getSubscription(hotelUuid);

    if (subscription.plan_uuid === dto.plan_uuid) {
      throw new ConflictException('Hotel is already on this plan');
    }

    const plan = await this.prisma.hotels_plans.findUnique({
      where: { uuid: dto.plan_uuid },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.plan_uuid} not found`);
    }

    const timezone = subscription.hotels?.timezone ?? 'America/Guayaquil';
    const nextPlanPrice = plan.price ?? 0;

    return this.prisma.$transaction(async (tx) => {
      let nextBillingAt = subscription.next_billing_at;
      let billingAnchorDay = subscription.billing_anchor_day;

      if (nextPlanPrice > 0) {
        if (!nextBillingAt || !billingAnchorDay) {
          const cycleStart = startOfLocalDay(new Date(), timezone);
          billingAnchorDay = localDayOfMonth(cycleStart, timezone);
          nextBillingAt = nextMonthlyBillingDate(
            cycleStart,
            timezone,
            billingAnchorDay,
          );

          const existingInvoice = await tx.hotels_subscription_invoices.findFirst({
            where: {
              subscription_uuid: subscription.uuid,
              billing_period_start: cycleStart,
            },
          });

          if (!existingInvoice) {
            await tx.hotels_subscription_invoices.create({
              data: {
                subscription_uuid: subscription.uuid,
                amount: nextPlanPrice,
                status: 'pending',
                billing_period_start: cycleStart,
                billing_period_end: nextBillingAt,
              },
            });
          }
        }
      } else {
        nextBillingAt = null;
        billingAnchorDay = null;
      }

      return tx.hotels_subscriptions.update({
        where: { uuid: subscription.uuid },
        data: {
          plan_uuid: dto.plan_uuid,
          next_billing_at: nextBillingAt,
          billing_anchor_day: billingAnchorDay,
        },
        include: { hotels_plans: true, hotels: { select: { timezone: true } } },
      });
    });
  }

  async findInvoices(hotelUuid: string) {
    this.logger.log(`Fetching invoices for hotel ${hotelUuid}`);

    const subscription = await this.getSubscription(hotelUuid);

    return this.prisma.hotels_subscription_invoices.findMany({
      where: { subscription_uuid: subscription.uuid },
      orderBy: { created_at: 'desc' },
    });
  }
}
