import Order from '@/backend/models/Order.model';
import Review from '@/backend/models/Review.model';
import mongoose from 'mongoose';

export type ReviewEligibilityResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Verify order belongs to user, is delivered, and contains the product. */
export async function getDeliveredOrderLine(
  customerEmail: string,
  orderId: string,
  productId: string
) {
  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return null;
  }

  const order = await Order.findOne({
    _id: orderId,
    customerEmail: normalizeEmail(customerEmail),
    status: 'delivered',
    items: { $elemMatch: { productId: String(productId) } },
  })
    .select('_id orderNumber status items.productId')
    .lean();

  return order;
}

/** One review per delivered order line (order + product), not per product globally. */
export async function findUserOrderProductReview(
  customerEmail: string,
  orderId: string,
  productId: string
) {
  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return null;
  }

  return Review.findOne({
    orderId,
    productId,
    reviewerEmail: normalizeEmail(customerEmail),
  })
    .select('_id status rating comment createdAt orderId productId')
    .lean();
}

export async function validateOrderProductReview(
  customerEmail: string,
  orderId: string,
  productId: string
): Promise<ReviewEligibilityResult> {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { ok: false, status: 400, message: 'Invalid order.' };
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return { ok: false, status: 400, message: 'Invalid product.' };
  }

  const order = await Order.findOne({
    _id: orderId,
    customerEmail: normalizeEmail(customerEmail),
  })
    .select('_id status items.productId')
    .lean();

  if (!order) {
    return { ok: false, status: 404, message: 'Order not found.' };
  }

  if (order.status !== 'delivered') {
    return {
      ok: false,
      status: 403,
      message: 'You can write a review after this order has been delivered.',
    };
  }

  const inOrder = (order.items ?? []).some(
    (it) => String((it as { productId?: string }).productId) === String(productId)
  );
  if (!inOrder) {
    return { ok: false, status: 400, message: 'This product is not part of this order.' };
  }

  const existing = await findUserOrderProductReview(customerEmail, orderId, productId);
  if (existing) {
    return {
      ok: false,
      status: 409,
      message: 'You have already submitted a review for this order.',
    };
  }

  return { ok: true };
}
