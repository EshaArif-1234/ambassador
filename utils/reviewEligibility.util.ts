import Order from '@/backend/models/Order.model';
import Review from '@/backend/models/Review.model';
import mongoose from 'mongoose';

/** User may submit a review only after a delivered order includes this product. */
export async function userHasDeliveredProduct(
  customerEmail: string,
  productId: string
): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(productId)) return false;

  const order = await Order.findOne({
    customerEmail: customerEmail.toLowerCase(),
    status: 'delivered',
    items: { $elemMatch: { productId: String(productId) } },
  })
    .select('_id')
    .lean();

  return Boolean(order);
}

export async function findUserProductReview(customerEmail: string, productId: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) return null;

  return Review.findOne({
    productId,
    reviewerEmail: customerEmail.toLowerCase(),
  })
    .select('_id status rating comment createdAt')
    .lean();
}
