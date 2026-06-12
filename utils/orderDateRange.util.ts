export type OrderDateRange = 'all' | 'today' | 'week' | 'month' | 'recent';

export function parseOrderDate(value: string | Date | undefined | null): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Local-time range bounds for admin order filters. */
export function getDateRangeBounds(
  range: OrderDateRange,
  now = new Date()
): { from: Date | null; to: Date | null } {
  if (range === 'all') return { from: null, to: null };

  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  if (range === 'today') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from, to };
  }

  if (range === 'recent') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
    return { from, to };
  }

  if (range === 'week') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = from.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    from.setDate(from.getDate() - daysFromMonday);
    return { from, to };
  }

  if (range === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to };
  }

  return { from: null, to: null };
}

export function isOrderInDateRange(
  orderDate: string | Date | undefined | null,
  range: OrderDateRange,
  now = new Date()
): boolean {
  if (range === 'all') return true;

  const parsed = parseOrderDate(orderDate);
  if (!parsed) return false;

  const { from, to } = getDateRangeBounds(range, now);
  if (!from || !to) return true;

  return parsed >= from && parsed <= to;
}
