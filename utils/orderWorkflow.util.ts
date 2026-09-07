export type OrderFulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * Fulfillment labels — shipment is handled by M&P Courier after payment.
 * Admin marks delivered when the parcel arrives; no manual dispatch/shipment steps.
 */
export const ORDER_STATUS_DISPLAY: Record<OrderFulfillmentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Dispatched',
  shipped: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** DB status values (includes legacy pending / confirmed). */
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
  'shipped',
  'delivered',
  'cancelled',
];

export function getOrderStatusDisplayLabel(status: string): string {
  return ORDER_STATUS_DISPLAY[status as OrderFulfillmentStatus] ?? status;
}

/** Post-payment path — M&P moves processing/confirmed → shipped automatically. */
export const ORDER_WORKFLOW_STEPS: OrderFulfillmentStatus[] = [
  'processing',
  'shipped',
  'delivered',
];

const NEXT_STATUS: Partial<Record<OrderFulfillmentStatus, OrderFulfillmentStatus>> = {
  shipped: 'delivered',
};

export function getOrderStatusLabel(status: string): string {
  return getOrderStatusDisplayLabel(status);
}

export function isOrderWorkflowLocked(status: string): boolean {
  return status === 'cancelled' || status === 'delivered';
}

export function hasMnpShipment(order: {
  mnpConsignmentNumber?: string | null;
  mnpOrderReferenceId?: string | null;
}): boolean {
  return Boolean(
    order.mnpConsignmentNumber?.trim() || order.mnpOrderReferenceId?.trim(),
  );
}

/** @deprecated Shipment is read-only from M&P — no admin actions. */
export type OrderAdminActionType = never;

export function getNextWorkflowStatus(
  current: string
): OrderFulfillmentStatus | null {
  if (isOrderWorkflowLocked(current)) return null;
  return NEXT_STATUS[current as OrderFulfillmentStatus] ?? null;
}

/** Label on the next status action (e.g. shipped → "Delivered"). */
export function getNextWorkflowActionLabel(current: string): string | null {
  const next = getNextWorkflowStatus(current);
  if (!next) return null;
  return ORDER_STATUS_DISPLAY[next];
}

/** @deprecated Manual workflow steps removed — shipment is synced from M&P. */
export function getUpcomingWorkflowSteps(current: string): Array<{
  status: OrderFulfillmentStatus;
  label: string;
  isAvailable: boolean;
}> {
  const next = getNextWorkflowStatus(current);
  if (!next) return [];

  return [
    {
      status: next,
      label: ORDER_STATUS_DISPLAY[next],
      isAvailable: true,
    },
  ];
}

/** Returns true if the requested status is the only valid forward step (or cancel). */
export function isValidWorkflowTransition(
  current: string,
  next: string
): boolean {
  // Shipment status is managed by M&P — block all manual status changes.
  if (next !== current) return false;
  return next === 'cancelled' ? !isOrderWorkflowLocked(current) : false;
}

/** Label shown in admin — prefers live M&P tracking status. */
export function getMnpShipmentDisplayStatus(order: {
  mnpTrackingStatus?: string | null;
  mnpConsignmentNumber?: string | null;
  mnpOrderReferenceId?: string | null;
  mnpBookingError?: string | null;
  mnpBookedAt?: string | Date | null;
  paymentStatus?: string;
  status?: string;
}): string {
  if (order.mnpTrackingStatus?.trim()) return order.mnpTrackingStatus.trim();
  if (hasMnpShipment(order)) return 'Booked with M&P';
  if (order.mnpBookingError?.trim()) return 'Awaiting M&P booking';
  if (order.paymentStatus === 'paid') return 'Awaiting M&P booking';
  if (order.status === 'cancelled') return 'Cancelled';
  return '—';
}
