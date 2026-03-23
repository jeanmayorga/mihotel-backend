import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateSubscriptionDto } from './subscription.dto';
import {
  localDayOfMonth,
  nextMonthlyBillingDate,
  startOfLocalDay,
} from '../../../common/helpers/billing-cycle';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findOne(subscriptionUuid: string) {
    const subscription = await this.prisma.hotels_subscriptions.findUnique({
      where: { uuid: subscriptionUuid },
      include: {
        plan: true,
        _count: {
          select: {
            hotels_subscription_invoices: { where: { status: 'pending' } },
          },
        },
      },
    });

    if (!subscription) return null;

    const { _count, ...rest } = subscription;
    return {
      ...rest,
      is_overdue: _count.hotels_subscription_invoices > 0,
    };
  }

  async change(subscriptionUuid: string, dto: UpdateSubscriptionDto) {
    this.logger.log(`Changing plan for subscription ${subscriptionUuid}`);

    const subscription =
      await this.prisma.hotels_subscriptions.findFirstOrThrow({
        where: { uuid: subscriptionUuid },
        include: { plan: true, hotel: { select: { timezone: true } } },
      });

    if (subscription.plan_uuid === dto.plan_uuid) {
      throw new ConflictException('Hotel is already on this plan');
    }

    const plan = await this.prisma.hotels_plans.findUnique({
      where: { uuid: dto.plan_uuid },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.plan_uuid} not found`);
    }

    const timezone = subscription.hotel?.timezone ?? 'America/Guayaquil';
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

          const existingInvoice =
            await tx.hotels_subscription_invoices.findFirst({
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
                plan_name: plan.name,
                plan_amount: nextPlanPrice,
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
        include: { plan: true, hotel: { select: { timezone: true } } },
      });
    });
  }
}
