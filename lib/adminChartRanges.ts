export type ChartRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DateBucket {
  label: string;
  start: Date;
  end: Date;
}

const RANGE_CONFIG: Record<ChartRange, { count: number; description: string }> = {
  daily: { count: 7, description: 'Last 7 days' },
  weekly: { count: 4, description: 'Last 4 weeks' },
  monthly: { count: 6, description: 'Last 6 months' },
  yearly: { count: 5, description: 'Last 5 years' },
};

export function parseChartRange(value: string | null, fallback: ChartRange = 'monthly'): ChartRange {
  const ranges: ChartRange[] = ['daily', 'weekly', 'monthly', 'yearly'];
  if (value && ranges.includes(value as ChartRange)) {
    return value as ChartRange;
  }
  return fallback;
}

export function getRangeDescription(range: ChartRange): string {
  return RANGE_CONFIG[range].description;
}

export function getRangeCount(range: ChartRange): number {
  return RANGE_CONFIG[range].count;
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

/** Build ordered buckets oldest → newest for the given range. */
export function buildDateBuckets(range: ChartRange, now = new Date()): DateBucket[] {
  const count = RANGE_CONFIG[range].count;
  const buckets: DateBucket[] = [];

  if (range === 'daily') {
    for (let i = count - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      buckets.push({
        label: startOfDay(day).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        start: startOfDay(day),
        end: endOfDay(day),
      });
    }
    return buckets;
  }

  if (range === 'weekly') {
    for (let i = count - 1; i >= 0; i--) {
      const end = endOfDay(now);
      end.setDate(end.getDate() - i * 7);

      const start = startOfDay(end);
      start.setDate(start.getDate() - 6);

      buckets.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        start,
        end,
      });
    }
    return buckets;
  }

  if (range === 'monthly') {
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      buckets.push({
        label: start.toLocaleDateString('en-US', { month: 'short' }),
        start,
        end,
      });
    }
    return buckets;
  }

  for (let i = count - 1; i >= 0; i--) {
    const year = now.getFullYear() - i;
    buckets.push({
      label: String(year),
      start: new Date(year, 0, 1, 0, 0, 0, 0),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
    });
  }

  return buckets;
}

export function getOverallRangeStart(buckets: DateBucket[]): Date {
  return buckets[0]?.start ?? new Date();
}

export function getOverallRangeEnd(buckets: DateBucket[]): Date {
  const last = buckets[buckets.length - 1];
  if (!last) return new Date();
  return last.end > new Date() ? new Date() : last.end;
}

/** Map a timestamp into a bucket index (daily/weekly only). */
export function getDayBucketIndex(createdAt: Date, rangeStart: Date, bucketCount: number): number {
  const daysDiff = Math.floor(
    (startOfDay(createdAt).getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (daysDiff < 0 || daysDiff >= bucketCount) return -1;
  return daysDiff;
}

export function getWeekBucketIndex(createdAt: Date, rangeStart: Date, weekCount: number): number {
  const daysDiff = Math.floor(
    (startOfDay(createdAt).getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (daysDiff < 0) return -1;
  return Math.min(Math.floor(daysDiff / 7), weekCount - 1);
}

export function getMonthBucketIndex(
  year: number,
  month: number,
  startYear: number,
  startMonth: number
): number {
  return (year - startYear) * 12 + (month - 1) - startMonth;
}

export function getYearBucketIndex(year: number, startYear: number, yearCount: number): number {
  const idx = year - startYear;
  if (idx < 0 || idx >= yearCount) return -1;
  return idx;
}

export function isWithinBucket(createdAt: Date, bucket: DateBucket): boolean {
  const time = createdAt.getTime();
  return time >= bucket.start.getTime() && time <= bucket.end.getTime();
}

export function findBucketIndex(createdAt: Date, buckets: DateBucket[]): number {
  return buckets.findIndex((bucket) => isWithinBucket(createdAt, bucket));
}
