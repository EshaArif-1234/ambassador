import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import type { IOrder } from '@/backend/models/Order.model';
import {
  isMnpBookingConfigured,
  mnpGetCitiesAllCached,
  mnpInsertBooking,
  MnpCourierError,
  resolveMnpCityName,
  sanitizeMnpText,
} from '@/lib/mnpCourier';
import { computeOrderWeightKg, ShippingQuoteError } from '@/lib/shippingQuote';

export type MnpBookOrderResult = {
  orderId: string;
  orderNumber: string;
  consignmentNumber: string;
  message: string;
  weightKg: number;
};

function productDetailsFromOrder(order: IOrder): string {
  const names = order.items.map((item) => item.productName).filter(Boolean);
  const joined = names.join(', ');
  return sanitizeMnpText(joined || 'Commercial kitchen equipment', 200);
}

export function isMnpAutoBookEnabled(): boolean {
  const flag = process.env.MNP_AUTO_BOOK?.trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'no') return false;
  return isMnpBookingConfigured();
}

/** Book a paid order with M&P (online-paid — COD amount 0). */
export async function bookMnpShipmentForOrder(
  orderId: string,
  options?: { fallbackKgPerItem?: number },
): Promise<MnpBookOrderResult> {
  if (!isMnpBookingConfigured()) {
    throw new MnpCourierError(
      'M&P booking is not fully configured. Set MNP_USERNAME, MNP_PASSWORD, MNP_ACCOUNT_NO, and MNP_LOCATION_ID.',
    );
  }

  await connectDB();

  const order = await Order.findById(orderId);
  if (!order) {
    throw new MnpCourierError('Order not found.');
  }
  if (order.paymentStatus !== 'paid') {
    throw new MnpCourierError('Only paid orders can be booked with M&P.');
  }
  if (order.mnpConsignmentNumber || order.mnpOrderReferenceId) {
    throw new MnpCourierError('This order already has an M&P shipment booked.');
  }

  const weightKg = await computeOrderWeightKg(
    order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    options?.fallbackKgPerItem ? { fallbackKgPerItem: options.fallbackKgPerItem } : undefined,
  );

  const mnpCities = await mnpGetCitiesAllCached();
  const destinationCity = resolveMnpCityName(order.shippingAddress.city, mnpCities);

  const booking = await mnpInsertBooking({
    consigneeName: order.customerName,
    consigneeAddress: order.shippingAddress.street,
    consigneeMobNo: order.customerPhone,
    consigneeEmail: order.customerEmail,
    destinationCityName: destinationCity,
    pieces: 1,
    weight: Math.max(0.1, weightKg),
    codAmount: 0,
    custRefNo: order.orderNumber,
    productDetails: productDetailsFromOrder(order),
    fragile: 'NO',
    remarks: sanitizeMnpText(order.deliveryNotes ?? '', 200),
    insuranceValue: '0',
  });

  order.mnpOrderReferenceId = booking.orderReferenceId;
  order.mnpConsignmentNumber = booking.orderReferenceId;
  order.mnpBookingMessage = booking.message;
  order.mnpBookedAt = new Date();
  order.mnpTrackingStatus = 'Booked';
  order.mnpBookingError = undefined;

  if (order.status === 'processing' || order.status === 'confirmed') {
    order.status = 'shipped';
  }

  await order.save();

  return {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    consignmentNumber: booking.orderReferenceId,
    message: booking.message,
    weightKg,
  };
}

/** Auto-book after online payment — does not throw; stores error on the order. */
export async function tryAutoBookMnpShipment(orderId: string): Promise<void> {
  if (!isMnpAutoBookEnabled()) return;

  try {
    await bookMnpShipmentForOrder(orderId, { fallbackKgPerItem: 1 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'M&P booking failed.';
    await Order.findByIdAndUpdate(orderId, { $set: { mnpBookingError: message } });
    console.error('[tryAutoBookMnpShipment]', { orderId, message });
  }
}

export { MnpCourierError, ShippingQuoteError };
export { isMnpBookingConfigured } from '@/lib/mnpCourier';
