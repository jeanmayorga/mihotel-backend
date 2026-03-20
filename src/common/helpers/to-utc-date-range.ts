import { fromZonedTime } from 'date-fns-tz';

/**
 * Converts local date strings (YYYY-MM-DD) into a UTC date range
 * suitable for filtering a `timestamptz` column in the database.
 *
 * Returns `{ gte, lt }` where:
 *  - `gte` = start of `from` day in the given timezone, as UTC
 *  - `lt`  = start of the day **after** `to` in the given timezone, as UTC
 *
 * Either `from` or `to` can be omitted independently.
 */
export function toUtcDateRange(
  from: string | undefined,
  to: string | undefined,
  timezone: string,
): { gte?: Date; lt?: Date } | undefined {
  if (!from && !to) return undefined;

  return {
    ...(from ? { gte: fromZonedTime(`${from}T00:00:00`, timezone) } : {}),
    ...(to
      ? {
          lt: fromZonedTime(`${nextDay(to)}T00:00:00`, timezone),
        }
      : {}),
  };
}

/** Returns the next calendar day as YYYY-MM-DD. */
function nextDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`); // noon to avoid DST edge cases
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
