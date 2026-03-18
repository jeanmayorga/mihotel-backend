import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getSubscription(hotelUuid: string) {
    const subscription = await this.prisma.hotels_subscriptions.findFirst({
      where: { hotel_uuid: hotelUuid },
      include: { hotels_plans: true },
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

    const startAt = new Date();
    const nextBillingAt =
      (plan.price ?? 0) > 0 ? this.firstOfNextMonth(startAt) : null;

    return this.prisma.hotels_subscriptions.create({
      data: {
        hotel_uuid: hotelUuid,
        plan_uuid: dto.plan_uuid,
        status: 'active',
        start_at: startAt,
        next_billing_at: nextBillingAt,
      },
      include: { hotels_plans: true },
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

    const nextBillingAt =
      (plan.price ?? 0) > 0 ? this.firstOfNextMonth(new Date()) : null;

    return this.prisma.hotels_subscriptions.update({
      where: { uuid: subscription.uuid },
      data: {
        plan_uuid: dto.plan_uuid,
        next_billing_at: nextBillingAt,
      },
      include: { hotels_plans: true },
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

  private firstOfNextMonth(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  }
}
