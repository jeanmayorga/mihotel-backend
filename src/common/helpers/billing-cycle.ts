import { fromZonedTime } from 'date-fns-tz';

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
};

function getLocalDateParts(date: Date, timezone: string): LocalDateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function shiftMonth(year: number, month: number, amount: number) {
  const absoluteMonth = month - 1 + amount;
  const nextYear = year + Math.floor(absoluteMonth / 12);
  const nextMonth = ((absoluteMonth % 12) + 12) % 12 + 1;
  return { year: nextYear, month: nextMonth };
}

export function startOfLocalDay(date: Date, timezone: string): Date {
  const { year, month, day } = getLocalDateParts(date, timezone);
  return fromZonedTime(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`,
    timezone,
  );
}

export function localDayOfMonth(date: Date, timezone: string): number {
  return getLocalDateParts(date, timezone).day;
}

export function nextMonthlyBillingDate(
  cycleStart: Date,
  timezone: string,
  anchorDay: number,
): Date {
  const { year, month } = getLocalDateParts(cycleStart, timezone);
  const next = shiftMonth(year, month, 1);
  const day = Math.min(anchorDay, daysInMonth(next.year, next.month));

  return fromZonedTime(
    `${next.year}-${String(next.month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`,
    timezone,
  );
}
