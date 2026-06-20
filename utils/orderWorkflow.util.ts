export type OrderFulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * Single source of truth — matches Orders Management actions menu:
 * Processing → Dispatched → Shipment → Delivered (+ Cancelled).
 */
export const ORDER_STATUS_DISPLAY: Record<OrderFulfillmentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Dispatched',
  shipped: 'Shipment',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** DB status values (includes legacy pending). */
export const ORDER_FULFILLMENT_STATUSES: OrderFulfillmentStatus[] = [
  'pending',
  'processing',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

/** Active workflow statuses shown on dashboard charts. */
export const ORDER_STATUS_CHART_ORDER: OrderFulfillmentStatus[] = [
  'processing',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

export function getOrderStatusDisplayLabel(status: string): string {
  return ORDER_STATUS_DISPLAY[status as OrderFulfillmentStatus] ?? status;
}

/** Linear fulfillment path after checkout. */
export const ORDER_WORKFLOW_STEPS: OrderFulfillmentStatus[] = [
  'processing',
  'confirmed',
  'shipped',
  'delivered',
];

const NEXT_STATUS: Partial<Record<OrderFulfillmentStatus, OrderFulfillmentStatus>> = {
  pending: 'confirmed',
  processing: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

export function getOrderStatusLabel(status: string): string {
  return getOrderStatusDisplayLabel(status);
}

export function isOrderWorkflowLocked(status: string): boolean {
  return status === 'cancelled' || status === 'delivered';
}

export function getNextWorkflowStatus(
  current: string
): OrderFulfillmentStatus | null {
  if (isOrderWorkflowLocked(current)) return null;
  return NEXT_STATUS[current as OrderFulfillmentStatus] ?? null;
}

/** Label on the next action button (e.g. Processing → "Dispatched"). */
export function getNextWorkflowActionLabel(current: string): string | null {
  const next = getNextWorkflowStatus(current);
  if (!next) return null;
  return ORDER_STATUS_DISPLAY[next];
}

export function getUpcomingWorkflowSteps(current: string): Array<{
  status: OrderFulfillmentStatus;
  label: string;
  isAvailable: boolean;
}> {
  if (isOrderWorkflowLocked(current)) return [];

  const next = getNextWorkflowStatus(current);
  if (!next) return [];

  const steps: Array<{
    status: OrderFulfillmentStatus;
    label: string;
    isAvailable: boolean;
  }> = [];

  let cursor: OrderFulfillmentStatus | null = next;
  while (cursor) {
    steps.push({
      status: cursor,
      label: ORDER_STATUS_DISPLAY[cursor],
      isAvailable: cursor === next,
    });
    cursor = getNextWorkflowStatus(cursor);
  }

  return steps;
}

/** Returns true if the requested status is the only valid forward step (or cancel). */
export function isValidWorkflowTransition(
  current: string,
  next: string
): boolean {
  if (next === 'cancelled') return !isOrderWorkflowLocked(current);
  return getNextWorkflowStatus(current) === next;
}
