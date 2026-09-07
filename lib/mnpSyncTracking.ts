import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import type { IOrder } from '@/backend/models/Order.model';
import {
  isMnpConfigured,
  mnpTrackConsignment,
  type MnpTrackingResult,
} from '@/lib/mnpCourier';

export type MnpTrackingSyncPatch = {
  mnpTrackingStatus?: string;
  status?: IOrder['status'];
  deliveryDate?: Date;
};

function mapMnpStatusToOrderStatus(mnpStatus: string): IOrder['status'] | null {
  const normalized = mnpStatus.toLowerCase();
  if (normalized.includes('deliver')) return 'delivered';
  if (
    normalized.includes('transit') ||
    normalized.includes('dispatch') ||
    normalized.includes('out for') ||
    normalized.includes('book')
  ) {
    return 'shipped';
  }
  return null;
}

/** Fetch latest tracking from M&P and persist status on the order. */
export async function syncMnpTrackingForOrder(
  orderId: string,
): Promise<{ tracking: MnpTrackingResult | null; patch: MnpTrackingSyncPatch }> {
  if (!isMnpConfigured()) {
    return { tracking: null, patch: {} };
  }

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) {
    return { tracking: null, patch: {} };
  }

  const consignment = order.mnpConsignmentNumber ?? order.mnpOrderReferenceId;
  if (!consignment) {
    return { tracking: null, patch: {} };
  }

  const tracking = await mnpTrackConsignment(consignment);
  const patch: MnpTrackingSyncPatch = {};

  if (tracking.trackingStatus) {
    patch.mnpTrackingStatus = tracking.trackingStatus;
  }

  const mappedStatus = tracking.trackingStatus
    ? mapMnpStatusToOrderStatus(tracking.trackingStatus)
    : null;

  if (mappedStatus === 'delivered' && order.status !== 'cancelled') {
    patch.status = 'delivered';
    patch.deliveryDate = new Date();
  } else if (
    mappedStatus === 'shipped' &&
    (order.status === 'processing' || order.status === 'confirmed' || order.status === 'pending')
  ) {
    patch.status = 'shipped';
  }

  if (Object.keys(patch).length > 0) {
    await Order.findByIdAndUpdate(orderId, { $set: patch });
  }

  return { tracking, patch };
}

/** Sync M&P tracking for multiple orders (best-effort, parallel). */
export async function syncMnpTrackingForOrders(
  orderIds: string[],
  concurrency = 5,
): Promise<void> {
  if (!isMnpConfigured() || orderIds.length === 0) return;

  for (let i = 0; i < orderIds.length; i += concurrency) {
    const batch = orderIds.slice(i, i + concurrency);
    await Promise.allSettled(batch.map((id) => syncMnpTrackingForOrder(id)));
  }
}
