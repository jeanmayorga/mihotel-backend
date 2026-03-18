import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processMonthlyBilling() {
    this.logger.log('Starting monthly billing process');

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscriptions = await this.prisma.hotels_subscriptions.findMany({
      where: {
        status: 'active',
        next_billing_at: { lte: now },
        hotels_plans: { price: { gt: 0 } },
      },
      include: { hotels_plans: true },
    });

    this.logger.log(`Found ${subscriptions.length} subscriptions to bill`);

    if (subscriptions.length === 0) {
      return { processed: 0, failed: 0, total: 0 };
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        this.prisma.$transaction(async (tx) => {
          await tx.hotels_subscription_invoices.create({
            data: {
              subscription_uuid: sub.uuid,
              amount: sub.hotels_plans!.price,
              status: 'pending',
              billing_period_start: now,
              billing_period_end: nextMonth,
            },
          });

          await tx.hotels_subscriptions.update({
            where: { uuid: sub.uuid },
            data: { next_billing_at: nextMonth },
          });
        }),
      ),
    );

    const processed = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.error(
          `Failed to bill subscription ${subscriptions[i].uuid}: ${r.reason}`,
        );
      }
    });

    this.logger.log(
      `Monthly billing complete: ${processed} processed, ${failed} failed`,
    );

    return { processed, failed, total: subscriptions.length };
  }
}
