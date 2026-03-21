import { fromZonedTime } from 'date-fns-tz';

const DEFAULT_TIMEZONE = 'America/Guayaquil';

export function firstOfMonthInTimezone(date: Date, timezone?: string): Date {
  const tz = timezone ?? DEFAULT_TIMEZONE;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;

  return fromZonedTime(
    `${year}-${String(month).padStart(2, '0')}-01T00:00:00`,
    tz,
  );
}

export function firstOfNextMonthInTimezone(
  date: Date,
  timezone?: string,
): Date {
  const tz = timezone ?? DEFAULT_TIMEZONE;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return fromZonedTime(
    `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00`,
    tz,
  );
}
