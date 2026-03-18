import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processMonthlyBilling() {
    this.logger.log('Starting monthly billing process');

    const subscriptions = await this.prisma.hotels_subscriptions.findMany({
      where: {
        status: 'active',
        next_billing_at: { lte: new Date() },
        hotels_plans: { price: { gt: 0 } },
      },
      include: { hotels_plans: true },
    });

    this.logger.log(`Found ${subscriptions.length} subscriptions to bill`);

    let processed = 0;

    for (const subscription of subscriptions) {
      try {
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await this.prisma.$transaction(async (tx) => {
          await tx.hotels_subscription_invoices.create({
            data: {
              subscription_uuid: subscription.uuid,
              amount: subscription.hotels_plans!.price,
              status: 'pending',
              billing_period_start: now,
              billing_period_end: nextMonth,
            },
          });

          await tx.hotels_subscriptions.update({
            where: { uuid: subscription.uuid },
            data: { next_billing_at: nextMonth },
          });
        });

        processed++;
      } catch (error) {
        this.logger.error(
          `Failed to bill subscription ${subscription.uuid}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Monthly billing complete: ${processed}/${subscriptions.length} processed`,
    );

    return { processed, total: subscriptions.length };
  }
}
