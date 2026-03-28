/**
 * Backfill missing subscription invoices for hotels created before the billing
 * cron was in place.
 *
 * For each active subscription with a paid plan, generates one invoice per
 * billing cycle from start_at up to today. Skips periods that already have an
 * invoice. Sets created_at to billing_period_start so the history looks correct.
 * Updates next_billing_at so the cron takes over from the next cycle.
 *
 * How to run:
 *   bun run scripts/backfill-subscription-invoices.ts --dry-run
 *   bun run scripts/backfill-subscription-invoices.ts
 *
 * Required flags (one of):
 *   --hotel-uuid=<uuid>
 *   --subscription-uuid=<uuid>
 *
 * Optional flags:
 *   --dry-run
 *   --from=YYYY-MM-DD     Override the billing start date instead of using start_at
 *   --paid-to=YYYY-MM-DD  Invoices up to this date will be paid, rest will be pending
 *   --overwrite           Delete existing invoices in range and recreate them
 *   --delete-all          Delete ALL invoices for the hotel/subscription before backfill
 *
 *  bun run ./scripts/backfill-subscription-invoices.ts --hotel-uuid=f4dd7113-35ff-45c4-b6ad-e0f5d4e49657 --from=2025-04-01 --paid-to=2026-01-01 --delete-all
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import {
  localDayOfMonth,
  nextMonthlyBillingDate,
  startOfLocalDay,
} from '../src/common/helpers/billing-cycle';

const DATABASE_URL = process.env.DATABASE_URL;
const DEFAULT_TIMEZONE = 'America/Guayaquil';

if (!DATABASE_URL) {
  console.error('Missing env var: DATABASE_URL');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const overwrite = process.argv.includes('--overwrite');
const deleteAll = process.argv.includes('--delete-all');
const hotelUuid = getArgValue('--hotel-uuid');
const subscriptionUuid = getArgValue('--subscription-uuid');
const fromDate = getArgValue('--from');
const paidTo = getArgValue('--paid-to');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

function getArgValue(flag: string): string | undefined {
  const match = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return match?.slice(flag.length + 1);
}

async function main() {
  console.log(
    dryRun
      ? 'DRY RUN mode (no data will be changed)'
      : 'LIVE mode (data updates will be written)',
  );
  if (hotelUuid) console.log(`Filter: hotel_uuid=${hotelUuid}`);
  if (subscriptionUuid)
    console.log(`Filter: subscription_uuid=${subscriptionUuid}`);
  if (fromDate) console.log(`From date override: ${fromDate}`);
  if (overwrite)
    console.log(
      'Overwrite mode: existing invoices will be deleted and recreated',
    );

  const now = new Date();

  if (!hotelUuid && !subscriptionUuid) {
    console.error('--hotel-uuid or --subscription-uuid is required');
    process.exit(1);
  }

  if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
    console.error('Invalid --from date format. Use YYYY-MM-DD');
    process.exit(1);
  }

  if (paidTo && !/^\d{4}-\d{2}-\d{2}$/.test(paidTo)) {
    console.error('Invalid --paid-to date format. Use YYYY-MM-DD');
    process.exit(1);
  }

  const paidToDate = paidTo ? new Date(`${paidTo}T23:59:59`) : null;
  if (paidToDate) console.log(`Paid up to: ${paidTo}`);
  if (deleteAll)
    console.log(
      'Delete-all mode: ALL invoices will be deleted before backfill',
    );

  const subscriptions = await prisma.hotels_subscriptions.findMany({
    where: {
      status: 'active',
      start_at: { not: null },
      plan: { price: { gt: 0 } },
      ...(subscriptionUuid ? { uuid: subscriptionUuid } : {}),
      ...(hotelUuid ? { hotel_uuid: hotelUuid } : {}),
    },
    include: {
      plan: true,
      hotel: { select: { timezone: true } },
    },
    orderBy: { created_at: 'asc' },
  });

  console.log(`\nFound ${subscriptions.length} subscription(s) to inspect`);

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const sub of subscriptions) {
    const plan = sub.plan;
    if (!plan || !sub.start_at) continue;

    if (deleteAll) {
      const toDelete = await prisma.hotels_subscription_invoices.findMany({
        where: { subscription_uuid: sub.uuid },
        select: { uuid: true },
      });
      console.log(
        `\n  [${dryRun ? 'dry' : 'delete'}] deleting all ${toDelete.length} invoice(s) for subscription ${sub.uuid}`,
      );
      if (!dryRun && toDelete.length > 0) {
        await prisma.hotels_subscription_invoices.deleteMany({
          where: { subscription_uuid: sub.uuid },
        });
      }
    }

    const timezone = sub.hotel?.timezone ?? DEFAULT_TIMEZONE;
    const fromOverride = fromDate
      ? startOfLocalDay(new Date(`${fromDate}T00:00:00`), timezone)
      : null;
    const cycleStart = fromOverride ?? startOfLocalDay(sub.start_at, timezone);
    const anchorDay = fromOverride
      ? localDayOfMonth(fromOverride, timezone)
      : (sub.billing_anchor_day ?? localDayOfMonth(cycleStart, timezone));

    console.log(
      `\n- Subscription ${sub.uuid} (plan: ${plan.name}, timezone: ${timezone})`,
    );
    console.log(
      `  cycle start: ${cycleStart.toISOString()}${fromOverride ? ' (from --from flag)' : ' (from start_at)'}, anchor_day: ${anchorDay}`,
    );

    let periodStart = cycleStart;
    let created = 0;
    let skipped = 0;
    let lastPeriodEnd: Date | null = null;

    if (overwrite) {
      const toDelete = await prisma.hotels_subscription_invoices.findMany({
        where: {
          subscription_uuid: sub.uuid,
          billing_period_start: { gte: cycleStart },
        },
        select: { uuid: true, billing_period_start: true },
      });

      if (toDelete.length > 0) {
        console.log(
          `  [${dryRun ? 'dry' : 'delete'}] deleting ${toDelete.length} existing invoice(s) from ${cycleStart.toISOString()} onwards`,
        );
        toDelete.forEach((inv) =>
          console.log(
            `    - ${inv.uuid} (${inv.billing_period_start?.toISOString()})`,
          ),
        );
        if (!dryRun) {
          await prisma.hotels_subscription_invoices.deleteMany({
            where: { uuid: { in: toDelete.map((inv) => inv.uuid) } },
          });
        }
      }
    }

    while (periodStart <= now) {
      const periodEnd = nextMonthlyBillingDate(
        periodStart,
        timezone,
        anchorDay,
      );

      if (!overwrite) {
        const existing = await prisma.hotels_subscription_invoices.findFirst({
          where: {
            subscription_uuid: sub.uuid,
            billing_period_start: periodStart,
          },
        });

        if (existing) {
          console.log(
            `  [skip] period ${periodStart.toISOString()} — invoice already exists`,
          );
          skipped++;
          totalSkipped++;
          periodStart = periodEnd;
          lastPeriodEnd = periodEnd;
          continue;
        }
      }

      const invoiceStatus =
        paidToDate && periodStart <= paidToDate ? 'paid' : 'pending';
      console.log(
        `  [${dryRun ? 'dry' : 'create'}] period ${periodStart.toISOString()} → ${periodEnd.toISOString()}, amount: ${sub.plan!.price}, status: ${invoiceStatus}`,
      );

      if (!dryRun) {
        try {
          await prisma.hotels_subscription_invoices.create({
            data: {
              subscription_uuid: sub.uuid,
              amount: sub.plan!.price,
              plan_name: sub.plan!.name,
              plan_amount: sub.plan!.price,
              status: invoiceStatus,
              billing_period_start: periodStart,
              billing_period_end: periodEnd,
              created_at: periodStart,
            },
          });
          created++;
          totalCreated++;
        } catch (error) {
          console.error(
            `  [error] failed to create invoice for period ${periodStart.toISOString()}: ${error}`,
          );
          totalFailed++;
          break;
        }
      } else {
        created++;
        totalCreated++;
      }

      lastPeriodEnd = periodEnd;
      periodStart = periodEnd;
    }

    // Update next_billing_at so the cron takes over from the next cycle
    if (!dryRun && lastPeriodEnd && lastPeriodEnd !== sub.next_billing_at) {
      await prisma.hotels_subscriptions.update({
        where: { uuid: sub.uuid },
        data: {
          next_billing_at: lastPeriodEnd,
          billing_anchor_day: anchorDay,
        },
      });
      console.log(
        `  next_billing_at updated to ${lastPeriodEnd.toISOString()}`,
      );
    }

    console.log(`  summary: ${created} created, ${skipped} skipped`);
  }

  console.log('\n=== Backfill complete ===');
  console.log(`  Created: ${totalCreated}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log(`  Failed:  ${totalFailed}`);
}

void main()
  .catch((error) => {
    console.error('\nBackfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
