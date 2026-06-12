export type OrderFulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

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

const NEXT_ACTION_LABEL: Partial<Record<OrderFulfillmentStatus, string>> = {
  pending: 'Dispatched',
  processing: 'Dispatched',
  confirmed: 'Shipment',
  shipped: 'Delivered',
};

const WORKFLOW_STEP_LABELS: Partial<Record<OrderFulfillmentStatus, string>> = {
  confirmed: 'Dispatched',
  shipped: 'Shipment',
  delivered: 'Delivered',
};

export function getOrderStatusLabel(status: string): string {
  if (status === 'confirmed') return 'dispatched';
  return status;
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

export function getNextWorkflowActionLabel(current: string): string | null {
  if (isOrderWorkflowLocked(current)) return null;
  return NEXT_ACTION_LABEL[current as OrderFulfillmentStatus] ?? null;
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
      label: WORKFLOW_STEP_LABELS[cursor] ?? cursor,
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
