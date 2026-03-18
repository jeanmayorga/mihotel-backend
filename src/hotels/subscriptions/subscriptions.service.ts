import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByHotel(hotelUuid: string) {
    this.logger.log(`Fetching active subscription for hotel ${hotelUuid}`);
    const subscription = await this.prisma.hotels_subscriptions.findFirst({
      where: { hotel_uuid: hotelUuid, status: 'active' },
      include: { hotels_plans: true },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No active subscription found for hotel ${hotelUuid}`,
      );
    }

    return subscription;
  }

  async create(hotelUuid: string, dto: CreateSubscriptionDto) {
    this.logger.log(`Creating subscription for hotel ${hotelUuid}`);

    const plan = await this.prisma.hotels_plans.findUnique({
      where: { uuid: dto.plan_uuid },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.plan_uuid} not found`);
    }

    const nextBillingAt =
      (plan.price ?? 0) > 0
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

    return this.prisma.hotels_subscriptions.create({
      data: {
        hotel_uuid: hotelUuid,
        plan_uuid: dto.plan_uuid,
        status: 'active',
        start_at: new Date(),
        next_billing_at: nextBillingAt,
      },
      include: { hotels_plans: true },
    });
  }

  async changePlan(
    hotelUuid: string,
    uuid: string,
    dto: UpdateSubscriptionDto,
  ) {
    this.logger.log(`Changing plan for subscription ${uuid}`);

    const subscription = await this.prisma.hotels_subscriptions.findFirst({
      where: { uuid, hotel_uuid: hotelUuid },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${uuid} not found`);
    }

    const plan = await this.prisma.hotels_plans.findUnique({
      where: { uuid: dto.plan_uuid },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.plan_uuid} not found`);
    }

    const nextBillingAt =
      (plan.price ?? 0) > 0
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

    return this.prisma.hotels_subscriptions.update({
      where: { uuid },
      data: {
        plan_uuid: dto.plan_uuid,
        next_billing_at: nextBillingAt,
      },
      include: { hotels_plans: true },
    });
  }

  async findInvoices(hotelUuid: string, subscriptionUuid: string) {
    this.logger.log(`Fetching invoices for subscription ${subscriptionUuid}`);

    const subscription = await this.prisma.hotels_subscriptions.findFirst({
      where: { uuid: subscriptionUuid, hotel_uuid: hotelUuid },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionUuid} not found`);
    }

    return this.prisma.hotels_subscription_invoices.findMany({
      where: { subscription_uuid: subscriptionUuid },
      orderBy: { created_at: 'desc' },
    });
  }
}
