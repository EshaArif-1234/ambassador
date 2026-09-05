import type { NextRequest } from 'next/server';
import connectDB from '@/backend/config/db';
import Order from '@/backend/models/Order.model';
import CheckoutSession from '@/backend/models/CheckoutSession.model';
import type { IOrderItem } from '@/backend/models/Order.model';
import { verifyAlfalahPaymentAmount } from '@/lib/alfaPayment';
import { formatAlfalahGatewayMethod } from '@/lib/alfalahPaymentMethods';
import {
  enrichOrderItemsList,
  finalizeOrderLineItems,
  mapRawOrderItem,
  mergePreservedOrderItem,
  normalizeStoredOrderItem,
  resolveCheckoutLineItems,
} from '@/utils/orderItems.util';
import { syncUserContactFromCheckout } from '@/utils/syncUserContact.util';
import { sendOrderConfirmationEmail } from '@/utils/email.util';
import { getUserIdFromRequest } from '@/utils/authSession.util';
import mongoose from 'mongoose';

export type CheckoutPaymentPayload = {
  orderId: string;
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    city?: string;
    address?: string;
  };
  orderItems: Record<string, unknown>[];
  orderData?: {
    subtotal?: number;
    deliveryCharges?: number;
    totalAmount?: number;
    address?: string;
    city?: string;
    deliveryNotes?: string;
    products?: Record<string, unknown>[];
  };
};

export type CheckoutPrepareResult = {
  orderNumber: string;
  totalAmount: number;
  alreadyPaid: boolean;
  dbOrderId?: string;
};

export type OrderPaymentUpdateResult = {
  updated: boolean;
  orderNumber: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  dbOrderId?: string;
};

const CHECKOUT_SESSION_TTL_MS = 48 * 60 * 60 * 1000;

function isMongoDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function buildOrderItems(rawItems: Record<string, unknown>[]): Promise<IOrderItem[]> {
  if (!rawItems.length) return [];
  const items: IOrderItem[] = rawItems.map((item) => mapRawOrderItem(item));
  return enrichOrderItemsList(items);
}

function resolveLinkedUserId(req: NextRequest): mongoose.Types.ObjectId | undefined {
  const linkedUserId = getUserIdFromRequest(req);
  return linkedUserId && mongoose.Types.ObjectId.isValid(linkedUserId)
    ? new mongoose.Types.ObjectId(linkedUserId)
    : undefined;
}

export type MarkOrderPaidOptions = {
  /** Production requires Alfalah amount to match session total; dev RC fallback may relax this. */
  strictAmountCheck?: boolean;
};

async function buildCheckoutDraft(req: NextRequest, payload: CheckoutPaymentPayload) {
  const { customerInfo, orderData } = payload;
  const rawLineItems = resolveCheckoutLineItems(payload);
  const items = await buildOrderItems(rawLineItems);

  const subtotal = orderData?.subtotal ?? items.reduce((s, i) => s + i.total, 0);
  const deliveryCharges = orderData?.deliveryCharges ?? 0;
  const totalAmount = orderData?.totalAmount ?? payload.amount ?? subtotal + deliveryCharges;

  const rawAddress = orderData?.address ?? customerInfo.address ?? '';
  const city = orderData?.city ?? customerInfo.city ?? '';
  const street = rawAddress.includes(',') ? rawAddress.split(',')[0].trim() : rawAddress;
  const normalizedEmail = normalizeEmail(customerInfo.email);

  void syncUserContactFromCheckout(req, normalizedEmail, {
    phone: customerInfo.phone ?? '',
    city,
    address: street,
  }).catch((err) => {
    console.error('[prepareCheckoutForPayment] contact sync failed:', err);
  });

  return {
    userId: resolveLinkedUserId(req),
    customerName: customerInfo.name,
    customerEmail: normalizedEmail,
    customerPhone: customerInfo.phone,
    items,
    subtotal,
    deliveryCharges,
    totalAmount,
    deliveryNotes: orderData?.deliveryNotes ?? '',
    shippingAddress: {
      street: street || customerInfo.address || 'N/A',
      city: city || 'N/A',
      state: '',
      zipCode: '',
      country: 'Pakistan',
    },
  };
}

/** Store checkout details temporarily — no Order record until payment succeeds. */
export async function prepareCheckoutForPayment(
  req: NextRequest,
  payload: CheckoutPaymentPayload,
): Promise<CheckoutPrepareResult> {
  await connectDB();

  const existingOrder = await Order.findOne({ orderNumber: payload.orderId }).lean();
  if (existingOrder?.paymentStatus === 'paid') {
    return {
      orderNumber: existingOrder.orderNumber,
      totalAmount: existingOrder.totalAmount,
      alreadyPaid: true,
      dbOrderId: String(existingOrder._id),
    };
  }

  if (existingOrder) {
    await Order.deleteOne({ _id: existingOrder._id });
  }

  const draft = await buildCheckoutDraft(req, payload);

  await CheckoutSession.findOneAndUpdate(
    { orderNumber: payload.orderId },
    {
      orderNumber: payload.orderId,
      ...draft,
      expiresAt: new Date(Date.now() + CHECKOUT_SESSION_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return {
    orderNumber: payload.orderId,
    totalAmount: draft.totalAmount,
    alreadyPaid: false,
  };
}

/** @deprecated Use prepareCheckoutForPayment — orders are no longer created before payment. */
export async function createPendingOrder(
  req: NextRequest,
  payload: CheckoutPaymentPayload,
): Promise<CheckoutPrepareResult & { dbOrderId: string }> {
  const result = await prepareCheckoutForPayment(req, payload);
  return {
    ...result,
    dbOrderId: result.dbOrderId ?? '',
  };
}

async function createPaidOrderFromSession(
  orderRef: string,
  ipnRaw: Record<string, unknown>,
  options?: MarkOrderPaidOptions,
): Promise<OrderPaymentUpdateResult> {
  const session = await CheckoutSession.findOne({ orderNumber: orderRef });
  if (!session) {
    console.error('[createPaidOrderFromSession] checkout session missing after successful payment', {
      orderRef,
    });
    return { updated: false, orderNumber: orderRef, paymentStatus: 'pending' };
  }

  const strictAmountCheck =
    options?.strictAmountCheck ?? process.env.NODE_ENV === 'production';
  const amountCheck = verifyAlfalahPaymentAmount(session.totalAmount, ipnRaw, {
    strict: strictAmountCheck,
  });

  if (!amountCheck.ok) {
    console.error('[createPaidOrderFromSession] amount verification failed', {
      orderRef,
      reason: amountCheck.reason,
      expectedTotal: session.totalAmount,
      ipnAmount: ipnRaw.TransactionAmount ?? ipnRaw.Amount,
    });
    return { updated: false, orderNumber: orderRef, paymentStatus: 'pending' };
  }

  const transactionId =
    typeof ipnRaw.TransactionId === 'string'
      ? ipnRaw.TransactionId
      : typeof ipnRaw.TransactionID === 'string'
        ? ipnRaw.TransactionID
        : typeof ipnRaw.AuthCode === 'string'
          ? ipnRaw.AuthCode
          : `ALFA-${Date.now()}`;

  const paymentId = `PAY-${orderRef}`;
  const gatewayMethod = formatAlfalahGatewayMethod(ipnRaw);
  const paidAt = new Date();
  const sessionItems = session.items.map((item) => normalizeStoredOrderItem(item));
  const enrichedItems = await enrichOrderItemsList(sessionItems);
  const mergedItems = sessionItems.map((original, index) =>
    mergePreservedOrderItem(original, enrichedItems[index] ?? original),
  );
  const items = finalizeOrderLineItems(mergedItems, session.subtotal);

  try {
    const order = await Order.create({
      orderNumber: session.orderNumber,
      userId: session.userId,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      customerPhone: session.customerPhone,
      items,
      subtotal: session.subtotal,
      deliveryCharges: session.deliveryCharges,
      totalAmount: session.totalAmount,
      currency: 'PKR',
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      gatewayMethod,
      paymentId,
      transactionId,
      paidAt,
      shippingAddress: session.shippingAddress,
      deliveryNotes: session.deliveryNotes,
    });

    await CheckoutSession.deleteOne({ _id: session._id });

    if (order.customerEmail) {
      try {
        await sendOrderConfirmationEmail({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          orderNumber: order.orderNumber,
          paymentId,
          paidAt: paidAt.toISOString(),
          items: order.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          subtotal: order.subtotal,
          deliveryCharges: order.deliveryCharges,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          deliveryNotes: order.deliveryNotes ?? '',
          paymentMethod: gatewayMethod,
        });
      } catch (emailErr) {
        console.error('[createPaidOrderFromSession] confirmation email failed:', emailErr);
      }
    }

    return {
      updated: true,
      orderNumber: order.orderNumber,
      paymentStatus: 'paid',
      dbOrderId: String(order._id),
    };
  } catch (err) {
    if (isMongoDuplicateKeyError(err)) {
      await CheckoutSession.deleteOne({ _id: session._id });
      const paid = await Order.findOne({ orderNumber: orderRef, paymentStatus: 'paid' });
      if (paid) {
        return {
          updated: false,
          orderNumber: paid.orderNumber,
          paymentStatus: 'paid',
          dbOrderId: String(paid._id),
        };
      }
    }
    throw err;
  }
}

/** Create the order only after Alfalah confirms successful payment (idempotent). */
export async function markOrderPaidFromAlfa(
  orderRef: string,
  ipnRaw: Record<string, unknown>,
  options?: MarkOrderPaidOptions,
): Promise<OrderPaymentUpdateResult> {
  await connectDB();

  const existingOrder = await Order.findOne({ orderNumber: orderRef });
  if (existingOrder?.paymentStatus === 'paid') {
    return {
      updated: false,
      orderNumber: existingOrder.orderNumber,
      paymentStatus: 'paid',
      dbOrderId: String(existingOrder._id),
    };
  }

  if (existingOrder) {
    await Order.deleteOne({ _id: existingOrder._id });
  }

  return createPaidOrderFromSession(orderRef, ipnRaw, options);
}

/** Drop checkout session on failure — no Order record should remain. */
export async function markOrderFailedFromAlfa(
  orderRef: string,
  reason: string,
): Promise<OrderPaymentUpdateResult> {
  await connectDB();

  const existingOrder = await Order.findOne({ orderNumber: orderRef });
  if (existingOrder?.paymentStatus === 'paid') {
    return {
      updated: false,
      orderNumber: existingOrder.orderNumber,
      paymentStatus: 'paid',
      dbOrderId: String(existingOrder._id),
    };
  }

  await CheckoutSession.deleteOne({ orderNumber: orderRef });

  if (existingOrder) {
    await Order.deleteOne({ _id: existingOrder._id });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[markOrderFailedFromAlfa] cleared unpaid checkout', { orderRef, reason });
  }

  return {
    updated: true,
    orderNumber: orderRef,
    paymentStatus: 'failed',
  };
}

/** Public-safe order summary for the success page (paid orders only). */
export async function getPublicOrderSummary(orderNumber: string) {
  await connectDB();
  const order = await Order.findOne({ orderNumber, paymentStatus: 'paid' }).lean();
  if (!order) return null;

  const sessionItems = order.items.map((item) => normalizeStoredOrderItem(item));
  const enrichedItems = await enrichOrderItemsList(sessionItems);
  const mergedItems = sessionItems.map((original, index) =>
    mergePreservedOrderItem(original, enrichedItems[index] ?? original),
  );
  const displayItems = finalizeOrderLineItems(mergedItems, order.subtotal);

  return {
    orderId: order.orderNumber,
    dbOrderId: String(order._id),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    transactionId: order.transactionId,
    paidAt: order.paidAt?.toISOString(),
    amount: order.totalAmount,
    subtotal: order.subtotal,
    deliveryCharges: order.deliveryCharges,
    customerInfo: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      city: order.shippingAddress?.city,
      address: order.shippingAddress?.street,
    },
    orderItems: displayItems.map((item) => ({
      id: item.productId ?? item.productName,
      title: item.productName,
      image: item.productImage,
      price: item.price,
      quantity: item.quantity,
    })),
    deliveryNotes: order.deliveryNotes,
    failedReason: order.failedReason,
  };
}
