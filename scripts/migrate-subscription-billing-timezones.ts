/**
 * Fix legacy subscription billing dates that were stored at 00:00:00Z.
 *
 * Why:
 * - Legacy logic stored month boundaries in UTC midnight.
 * - Hotels in negative UTC offsets (for example America/Guayaquil) see those
 *   timestamps as the previous day in local time.
 *
 * What it updates:
 * - hotels_subscription_invoices.billing_period_start
 * - hotels_subscription_invoices.billing_period_end
 *
 * Optional:
 * - hotels_subscriptions.start_at
 * - hotels_subscriptions.next_billing_at
 *
 * How to run:
 *   bun run scripts/migrate-subscription-billing-timezones.ts --dry-run
 *   bun run scripts/migrate-subscription-billing-timezones.ts
 *
 * Optional flags:
 *   --dry-run
 *   --hotel-uuid=<uuid>
 *   --subscription-uuid=<uuid>
 *   --include-subscription-dates
 *   --include-next-billing (legacy alias; same as --include-subscription-dates)
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { fromZonedTime } from 'date-fns-tz';

const DATABASE_URL = process.env.DATABASE_URL;
const DEFAULT_TIMEZONE = 'America/Guayaquil';

if (!DATABASE_URL) {
  console.error('Missing env var: DATABASE_URL');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const includeSubscriptionDates =
  process.argv.includes('--include-subscription-dates') ||
  process.argv.includes('--include-next-billing');
const hotelUuid = getArgValue('--hotel-uuid');
const subscriptionUuid = getArgValue('--subscription-uuid');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});
const hotelTimezoneCache = new Map<string, string>();
const subscriptionHotelUuidCache = new Map<string, string | null>();

type HotelTimezoneResult = { timezone: string | null };
type SubscriptionHotelUuidResult = { hotel_uuid: string | null };

function hotelsDelegate(client: PrismaClient) {
  return (
    client as unknown as {
      hotels: {
        findUnique: (args: {
          where: { uuid: string };
          select: { timezone: true };
        }) => Promise<HotelTimezoneResult | null>;
      };
    }
  ).hotels;
}

function subscriptionsDelegate(client: PrismaClient) {
  return (
    client as unknown as {
      hotels_subscriptions: {
        findUnique: (args: {
          where: { uuid: string };
          select: { hotel_uuid: true };
        }) => Promise<SubscriptionHotelUuidResult | null>;
      };
    }
  ).hotels_subscriptions;
}

function getArgValue(flag: string): string | undefined {
  const match = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return match?.slice(flag.length + 1);
}

function yyyyMmDdFromUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function alignUtcDateToLocalMidnight(date: Date, timezone: string): Date {
  return fromZonedTime(`${yyyyMmDdFromUtc(date)}T00:00:00`, timezone);
}

function hasDateChanged(a: Date, b: Date): boolean {
  return a.getTime() !== b.getTime();
}

async function getHotelTimezone(
  hotelUuidValue: string | null,
): Promise<string> {
  if (!hotelUuidValue) return DEFAULT_TIMEZONE;

  const cached = hotelTimezoneCache.get(hotelUuidValue);
  if (cached) return cached;

  const hotel = await hotelsDelegate(prisma).findUnique({
    where: { uuid: hotelUuidValue },
    select: { timezone: true },
  });

  const timezone = hotel?.timezone ?? DEFAULT_TIMEZONE;
  hotelTimezoneCache.set(hotelUuidValue, timezone);
  return timezone;
}

async function getSubscriptionTimezone(
  subscriptionUuidValue: string | null,
): Promise<string> {
  if (!subscriptionUuidValue) return DEFAULT_TIMEZONE;

  let cachedHotelUuid = subscriptionHotelUuidCache.get(subscriptionUuidValue);
  if (cachedHotelUuid === undefined) {
    const subscription = await subscriptionsDelegate(prisma).findUnique({
      where: { uuid: subscriptionUuidValue },
      select: { hotel_uuid: true },
    });
    cachedHotelUuid = subscription?.hotel_uuid ?? null;
    subscriptionHotelUuidCache.set(subscriptionUuidValue, cachedHotelUuid);
  }

  return getHotelTimezone(cachedHotelUuid);
}

async function migrateInvoicePeriods() {
  console.log('\n=== Migrating subscription invoices ===');

  const invoices = await prisma.hotels_subscription_invoices.findMany({
    where: {
      ...(subscriptionUuid ? { subscription_uuid: subscriptionUuid } : {}),
      ...(hotelUuid ? { hotels_subscriptions: { hotel_uuid: hotelUuid } } : {}),
      billing_period_start: { not: null },
      billing_period_end: { not: null },
    },
    orderBy: { created_at: 'asc' },
  });

  console.log(`Found ${invoices.length} invoice(s) to inspect`);

  let changed = 0;
  let unchanged = 0;

  for (const invoice of invoices) {
    const timezone = await getSubscriptionTimezone(invoice.subscription_uuid);

    const currentStart = invoice.billing_period_start!;
    const currentEnd = invoice.billing_period_end!;

    const newStart = alignUtcDateToLocalMidnight(currentStart, timezone);
    const newEnd = alignUtcDateToLocalMidnight(currentEnd, timezone);

    const startChanged = hasDateChanged(currentStart, newStart);
    const endChanged = hasDateChanged(currentEnd, newEnd);

    if (!startChanged && !endChanged) {
      unchanged++;
      continue;
    }

    changed++;

    console.log(
      [
        `- Invoice ${invoice.uuid}`,
        `  timezone: ${timezone}`,
        `  start: ${currentStart.toISOString()} -> ${newStart.toISOString()}`,
        `  end:   ${currentEnd.toISOString()} -> ${newEnd.toISOString()}`,
      ].join('\n'),
    );

    if (!dryRun) {
      await prisma.hotels_subscription_invoices.update({
        where: { uuid: invoice.uuid },
        data: {
          billing_period_start: newStart,
          billing_period_end: newEnd,
        },
      });
    }
  }

  console.log('\nInvoice migration summary:');
  console.log(`  Changed: ${changed}`);
  console.log(`  Unchanged: ${unchanged}`);
}

async function migrateSubscriptionDates() {
  console.log('\n=== Migrating subscriptions.start_at and next_billing_at ===');

  const subscriptions = await prisma.hotels_subscriptions.findMany({
    where: {
      ...(subscriptionUuid ? { uuid: subscriptionUuid } : {}),
      ...(hotelUuid ? { hotel_uuid: hotelUuid } : {}),
      OR: [{ start_at: { not: null } }, { next_billing_at: { not: null } }],
    },
    orderBy: { created_at: 'asc' },
  });

  console.log(`Found ${subscriptions.length} subscription(s) to inspect`);

  let changed = 0;
  let unchanged = 0;

  for (const subscription of subscriptions) {
    const timezone = await getHotelTimezone(subscription.hotel_uuid);
    const currentStartAt = subscription.start_at;
    const currentNextBillingAt = subscription.next_billing_at;
    const newStartAt = currentStartAt
      ? alignUtcDateToLocalMidnight(currentStartAt, timezone)
      : null;
    const newNextBillingAt = currentNextBillingAt
      ? alignUtcDateToLocalMidnight(currentNextBillingAt, timezone)
      : null;

    const startAtChanged =
      !!currentStartAt &&
      !!newStartAt &&
      hasDateChanged(currentStartAt, newStartAt);
    const nextBillingChanged =
      !!currentNextBillingAt &&
      !!newNextBillingAt &&
      hasDateChanged(currentNextBillingAt, newNextBillingAt);

    if (!startAtChanged && !nextBillingChanged) {
      unchanged++;
      continue;
    }

    changed++;

    console.log(
      [
        `- Subscription ${subscription.uuid}`,
        `  timezone: ${timezone}`,
        currentStartAt && newStartAt
          ? `  start_at: ${currentStartAt.toISOString()} -> ${newStartAt.toISOString()}`
          : '  start_at: unchanged/null',
        currentNextBillingAt && newNextBillingAt
          ? `  next_billing_at: ${currentNextBillingAt.toISOString()} -> ${newNextBillingAt.toISOString()}`
          : '  next_billing_at: unchanged/null',
      ].join('\n'),
    );

    if (!dryRun) {
      await prisma.hotels_subscriptions.update({
        where: { uuid: subscription.uuid },
        data: {
          ...(startAtChanged ? { start_at: newStartAt } : {}),
          ...(nextBillingChanged ? { next_billing_at: newNextBillingAt } : {}),
        },
      });
    }
  }

  console.log('\nSubscription dates migration summary:');
  console.log(`  Changed: ${changed}`);
  console.log(`  Unchanged: ${unchanged}`);
}

async function main() {
  console.log(
    dryRun
      ? 'DRY RUN mode (no data will be changed)'
      : 'LIVE mode (data updates will be written)',
  );
  if (hotelUuid) console.log(`Filter: hotel_uuid=${hotelUuid}`);
  if (subscriptionUuid) {
    console.log(`Filter: subscription_uuid=${subscriptionUuid}`);
  }

  await migrateInvoicePeriods();

  if (includeSubscriptionDates) {
    await migrateSubscriptionDates();
  } else {
    console.log(
      '\nSkipping subscriptions.start_at/next_billing_at migration. Use --include-subscription-dates to enable.',
    );
  }
}

void main()
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
