export type ChartRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DateBucket {
  label: string;
  start: Date;
  end: Date;
}

const PERIOD_BUTTON_LABELS: Record<ChartRange, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export function parseChartRange(value: string | null, fallback: ChartRange = 'monthly'): ChartRange {
  const ranges: ChartRange[] = ['daily', 'weekly', 'monthly', 'yearly'];
  if (value && ranges.includes(value as ChartRange)) {
    return value as ChartRange;
  }
  return fallback;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Monday 00:00:00 of the week containing `date` (week starts Monday). */
function getMondayOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysFromMonday);
  return d;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

/**
 * Calendar-based chart windows:
 * - daily:   current day, split by hour (midnight → now)
 * - weekly:  Monday of this week → today
 * - monthly: 1st of this month → today
 * - yearly:  January → current month (this year)
 */
export function buildDateBuckets(range: ChartRange, now = new Date()): DateBucket[] {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (range === 'daily') {
    const buckets: DateBucket[] = [];
    const currentHour = now.getHours();

    for (let hour = 0; hour <= currentHour; hour++) {
      const start = new Date(todayStart);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(todayStart);
      end.setHours(hour, 59, 59, 999);

      buckets.push({
        label: formatHourLabel(hour),
        start,
        end,
      });
    }

    return buckets;
  }

  if (range === 'weekly') {
    const buckets: DateBucket[] = [];
    const monday = getMondayOfWeek(now);
    const cursor = new Date(monday);

    while (cursor.getTime() <= todayStart.getTime()) {
      buckets.push({
        label: cursor.toLocaleDateString('en-US', { weekday: 'short' }),
        start: startOfDay(cursor),
        end: endOfDay(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return buckets;
  }

  if (range === 'monthly') {
    const buckets: DateBucket[] = [];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cursor = new Date(monthStart);

    while (cursor.getTime() <= todayStart.getTime()) {
      buckets.push({
        label: String(cursor.getDate()),
        start: startOfDay(cursor),
        end: endOfDay(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return buckets;
  }

  const buckets: DateBucket[] = [];
  for (let month = 0; month <= now.getMonth(); month++) {
    const start = new Date(now.getFullYear(), month, 1, 0, 0, 0, 0);
    const end =
      month === now.getMonth()
        ? todayEnd
        : new Date(now.getFullYear(), month + 1, 0, 23, 59, 59, 999);

    buckets.push({
      label: start.toLocaleDateString('en-US', { month: 'short' }),
      start,
      end,
    });
  }

  return buckets;
}

export function getRangeDescription(range: ChartRange, now = new Date()): string {
  const buckets = buildDateBuckets(range, now);

  switch (range) {
    case 'daily':
      return `Today · ${formatShortDate(now)}`;
    case 'weekly':
      return `This week · ${getRangeLabel(buckets)}`;
    case 'monthly':
      return `This month · ${formatShortDate(buckets[0]?.start ?? now)} – ${formatShortDate(now)}`;
    case 'yearly':
      return `This year · ${getRangeLabel(buckets)}`;
    default:
      return getRangeLabel(buckets);
  }
}

export function getRangeLabel(buckets: DateBucket[]): string {
  if (buckets.length === 0) return '';
  if (buckets.length === 1) return buckets[0].label;
  return `${buckets[0].label} – ${buckets[buckets.length - 1].label}`;
}

export function getChartPeriodOptions(now = new Date()) {
  return (['daily', 'weekly', 'monthly', 'yearly'] as ChartRange[]).map((value) => ({
    value,
    label: PERIOD_BUTTON_LABELS[value],
    description: getRangeDescription(value, now),
  }));
}

export function getOverallRangeStart(buckets: DateBucket[]): Date {
  return buckets[0]?.start ?? new Date();
}

export function getOverallRangeEnd(buckets: DateBucket[], now = new Date()): Date {
  return now;
}

export function getMonthBucketIndex(
  year: number,
  month: number,
  startYear: number,
  startMonth: number
): number {
  if (year !== startYear) return -1;
  const idx = month - 1 - startMonth;
  return idx >= 0 ? idx : -1;
}

export function isWithinBucket(createdAt: Date, bucket: DateBucket): boolean {
  const time = createdAt.getTime();
  return time >= bucket.start.getTime() && time <= bucket.end.getTime();
}

export function findBucketIndex(createdAt: Date, buckets: DateBucket[]): number {
  return buckets.findIndex((bucket) => isWithinBucket(createdAt, bucket));
}
