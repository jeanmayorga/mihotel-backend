import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

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
        next_billing_at: { not: null },
        hotels_plans: { price: { gt: 0 } },
      },
      include: { hotels_plans: true },
    });

    this.logger.log(`Found ${subscriptions.length} subscriptions to bill`);

    if (subscriptions.length === 0) {
      return { processed: 0, failed: 0, skipped: 0, total: 0 };
    }

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const sub of subscriptions) {
      let nextBillingAt = sub.next_billing_at!;

      // Catch-up: generate invoices for completed months only
      while (true) {
        const billingPeriodStart = nextBillingAt;
        const billingPeriodEnd = this.firstOfNextMonth(billingPeriodStart);

        // Only bill if the period has fully ended
        if (billingPeriodEnd > now) break;

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
                amount: sub.hotels_plans!.price,
                status: 'pending',
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
              },
            });

            await tx.hotels_subscriptions.update({
              where: { uuid: sub.uuid },
              data: { next_billing_at: billingPeriodEnd },
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

  private firstOfNextMonth(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  }
}
