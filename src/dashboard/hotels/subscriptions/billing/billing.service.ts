import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  localDayOfMonth,
  nextMonthlyBillingDate,
} from '../../../../common/helpers/billing-cycle';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processMonthlyBilling() {
    this.logger.log('Starting monthly billing process');

    const now = new Date();

    const subscriptions = await this.prisma.hotels_subscriptions.findMany({
      where: {
        status: 'active',
        next_billing_at: { lte: now },
        hotels_plans: { price: { gt: 0 } },
      },
      include: {
        hotels_plans: true,
        hotels: { select: { timezone: true } },
      },
    });

    this.logger.log(`Found ${subscriptions.length} subscriptions to bill`);

    if (subscriptions.length === 0) {
      return { processed: 0, failed: 0, skipped: 0, total: 0 };
    }

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const sub of subscriptions) {
      const timezone = sub.hotels?.timezone ?? 'America/Guayaquil';
      let nextBillingAt = sub.next_billing_at!;
      const activePlanPrice = sub.hotels_plans!.price ?? 0;
      const billingAnchorDay =
        sub.billing_anchor_day ?? localDayOfMonth(nextBillingAt, timezone);

      // Catch-up: generate invoices for every due cycle.
      while (nextBillingAt <= now) {
        const billingPeriodStart = nextBillingAt;
        const billingPeriodEnd = nextMonthlyBillingDate(
          nextBillingAt,
          timezone,
          billingAnchorDay,
        );

        try {
          const existingInvoice =
            await this.prisma.hotels_subscription_invoices.findFirst({
              where: {
                subscription_uuid: sub.uuid,
                billing_period_start: billingPeriodStart,
              },
            });

          if (existingInvoice) {
            this.logger.warn(
              `Invoice already exists for subscription ${sub.uuid}, period ${billingPeriodStart.toISOString()} — skipping`,
            );
            skipped++;
            nextBillingAt = billingPeriodEnd;
            continue;
          }

          await this.prisma.$transaction(async (tx) => {
            await tx.hotels_subscription_invoices.create({
              data: {
                subscription_uuid: sub.uuid,
                amount: activePlanPrice,
                status: 'pending',
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
              },
            });

            const updateData: {
              next_billing_at: Date | null;
              billing_anchor_day?: number | null;
            } = {
              next_billing_at: billingPeriodEnd,
              billing_anchor_day: billingAnchorDay,
            };

            await tx.hotels_subscriptions.update({
              where: { uuid: sub.uuid },
              data: updateData,
            });
          });

          processed++;
          this.logger.log(
            `Billed subscription ${sub.uuid}, period ${billingPeriodStart.toISOString()}`,
          );
        } catch (error) {
          failed++;
          this.logger.error(
            `Failed to bill subscription ${sub.uuid}, period ${billingPeriodStart.toISOString()}: ${error}`,
          );
          break; // Stop catch-up for this sub if a period fails
        }

        nextBillingAt = billingPeriodEnd;
      }
    }

    this.logger.log(
      `Monthly billing complete: ${processed} processed, ${failed} failed, ${skipped} skipped`,
    );

    return { processed, failed, skipped, total: subscriptions.length };
  }
}
