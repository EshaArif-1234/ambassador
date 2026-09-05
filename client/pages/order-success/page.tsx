'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useCart, type CartItem } from '@/contexts/CartContext';

type SavedOrderRaw = {
  orderId?: string;
  amount?: number;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
  orderItems?: CartItem[];
  orderData?: Record<string, unknown>;
  paymentMethod?: string;
  paymentStatus?: string;
  paidAt?: string;
  paymentId?: string;
  dbOrderId?: string;
};

type NormalizedOrder = {
  orderId: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  deliveryNotes?: string;
  items: CartItem[];
  subtotal: number;
  totalPaid: number;
  dbOrderId?: string;
  failedReason?: string;
};

type ApiOrderSummary = {
  orderId: string;
  dbOrderId?: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentId?: string;
  paidAt?: string;
  amount?: number;
  subtotal?: number;
  deliveryCharges?: number;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    city?: string;
    address?: string;
  };
  orderItems?: CartItem[];
  deliveryNotes?: string;
  failedReason?: string;
};

function normalizeFromApi(data: ApiOrderSummary): NormalizedOrder {
  const customer = data.customerInfo ?? {
    name: '',
    email: '',
    phone: '',
  };
  const addressParts = [customer.address, customer.city].filter(Boolean);
  return {
    orderId: data.orderId,
    orderDate: data.paidAt ?? new Date().toISOString(),
    paymentMethod: data.paymentMethod ?? 'online',
    paymentStatus: data.paymentStatus,
    paymentId: data.paymentId,
    customerName: customer.name ?? '',
    customerEmail: customer.email ?? '',
    customerPhone: customer.phone ?? '',
    customerAddress: addressParts.join(', '),
    deliveryNotes: data.deliveryNotes,
    items: data.orderItems ?? [],
    subtotal: data.subtotal ?? 0,
    totalPaid: data.amount ?? 0,
    dbOrderId: data.dbOrderId,
    failedReason: data.failedReason,
  };
}

function normalizeOrder(raw: SavedOrderRaw): NormalizedOrder {
  const customer = raw.customerInfo ?? {};
  const nested = raw.orderData ?? {};
  const items = raw.orderItems ?? [];
  const subtotal =
    typeof nested.subtotal === 'number'
      ? nested.subtotal
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPaid = raw.amount ?? subtotal;
  const addressParts = [customer.address, customer.city].filter(Boolean);

  return {
    orderId: raw.orderId ?? '—',
    orderDate: raw.paidAt ?? new Date().toISOString(),
    paymentMethod: raw.paymentMethod ?? 'online',
    paymentStatus: raw.paymentStatus ?? 'paid',
    paymentId: raw.paymentId,
    customerName: customer.name ?? '',
    customerEmail: customer.email ?? '',
    customerPhone: customer.phone ?? '',
    customerAddress: addressParts.join(', '),
    items,
    subtotal,
    totalPaid,
    dbOrderId: raw.dbOrderId,
  };
}

function formatOrderDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function paymentMethodLabel(method: string) {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'online' || method === 'card') return 'Online Payment (Alfalah APG)';
  return 'Online Payment';
}

function readStoredPendingOrderId(): string {
  if (typeof window === 'undefined') return '';

  const fromSession = sessionStorage.getItem('pendingPaymentOrderId')?.trim();
  if (fromSession) return fromSession;

  try {
    const paymentData = localStorage.getItem('paymentData');
    if (paymentData) {
      const parsed = JSON.parse(paymentData) as { orderId?: string };
      return parsed.orderId?.trim() ?? '';
    }
  } catch {
    /* ignore */
  }

  return '';
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<NormalizedOrder | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const orderParam =
    searchParams.get('order')?.trim() ??
    searchParams.get('O')?.trim() ??
    searchParams.get('o')?.trim() ??
    searchParams.get('TransactionReferenceNumber')?.trim() ??
    '';
  const rcParam =
    searchParams.get('RC')?.trim() ??
    searchParams.get('rc')?.trim() ??
    '';
  const statusParam = searchParams.get('status')?.trim() ?? '';

  useEffect(() => {
    const load = async () => {
      const resolvedOrderId = orderParam || readStoredPendingOrderId();

      if (resolvedOrderId) {
        try {
          const rcQuery = rcParam ? `&rc=${encodeURIComponent(rcParam)}` : '';
          const res = await fetch(
            `/api/payment/status?order=${encodeURIComponent(resolvedOrderId)}&sync=1${rcQuery}`,
            { cache: 'no-store' },
          );
          const json = await res.json();
          if (res.ok && json.success && json.data) {
            const normalized = normalizeFromApi(json.data as ApiOrderSummary);
            setOrder(normalized);
            if (normalized.paymentStatus === 'paid') {
              localStorage.removeItem('paymentData');
              sessionStorage.removeItem('pendingPaymentOrderId');
              clearCart();
            }
            return normalized;
          }

          if (statusParam === 'failed' && resolvedOrderId) {
            setOrder({
              orderId: resolvedOrderId,
              orderDate: new Date().toISOString(),
              paymentMethod: 'online',
              paymentStatus: 'failed',
              customerName: '',
              customerEmail: '',
              customerPhone: '',
              customerAddress: '',
              items: [],
              subtotal: 0,
              totalPaid: 0,
              failedReason: json.message ?? 'Payment was not completed.',
            });
            return null;
          }

          setLoadError(json.message ?? 'Order not found.');
        } catch {
          setLoadError('Could not load order details.');
        }
        return null;
      }

      if (statusParam === 'pending') {
        setLoadError('Payment received — confirming your order. Please wait a moment and refresh.');
        return null;
      }

      const savedOrder = localStorage.getItem('lastOrder');
      if (!savedOrder) {
        setLoadError('We could not find your order details. Check your email for confirmation or contact support.');
        return null;
      }

      try {
        const parsed = JSON.parse(savedOrder) as SavedOrderRaw;
        setOrder(normalizeOrder(parsed));
        localStorage.removeItem('paymentData');
        sessionStorage.removeItem('pendingPaymentOrderId');
        clearCart();
      } catch {
        setLoadError('We could not load your order details.');
      }
    };

    void load();
  }, [orderParam, rcParam, statusParam, clearCart]);

  useEffect(() => {
    const resolvedOrderId = orderParam || readStoredPendingOrderId();
    if (!resolvedOrderId || order?.paymentStatus !== 'pending') return;

    let attempts = 0;
    const maxAttempts = 8;
    const intervalMs = 3000;

    const timer = window.setInterval(async () => {
      attempts += 1;
      try {
        const rcQuery = rcParam ? `&rc=${encodeURIComponent(rcParam)}` : '';
        const res = await fetch(
          `/api/payment/status?order=${encodeURIComponent(resolvedOrderId)}&sync=1${rcQuery}`,
          { cache: 'no-store' },
        );
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const normalized = normalizeFromApi(json.data as ApiOrderSummary);
          setOrder(normalized);
          if (normalized.paymentStatus === 'paid') {
            localStorage.removeItem('paymentData');
            sessionStorage.removeItem('pendingPaymentOrderId');
            clearCart();
            window.clearInterval(timer);
          } else if (normalized.paymentStatus === 'failed' || attempts >= maxAttempts) {
            window.clearInterval(timer);
          }
        }
      } catch {
        if (attempts >= maxAttempts) window.clearInterval(timer);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [orderParam, rcParam, order?.paymentStatus, clearCart]);

  const trackHref = useMemo(() => {
    if (order?.dbOrderId) {
      const orderTrackPath = `/orders/${order.dbOrderId}`;
      if (user) return orderTrackPath;

      const params = new URLSearchParams();
      params.set('redirect', orderTrackPath);
      if (order.customerEmail) params.set('email', order.customerEmail);
      return `/login?${params.toString()}`;
    }

    if (user) return '/orders';
    return '/login?redirect=/orders';
  }, [user, order?.dbOrderId, order?.customerEmail]);

  const signupHref = useMemo(() => {
    const redirectTarget =
      order?.dbOrderId ? `/orders/${order.dbOrderId}` : '/orders';
    const params = new URLSearchParams();
    params.set('redirect', redirectTarget);
    if (order?.customerEmail) params.set('email', order.customerEmail);
    return `/signup?${params.toString()}`;
  }, [order?.dbOrderId, order?.customerEmail]);

  const isFailed =
    statusParam === 'failed' ||
    order?.paymentStatus === 'failed';
  const isPending =
    statusParam === 'pending' ||
    order?.paymentStatus === 'pending';

  if (loadError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <h1 className="text-xl font-semibold text-gray-900">Order not found</h1>
          <p className="mt-2 text-gray-600">{loadError}</p>
          <Link href={PRODUCTS_PATH} className="mt-6 inline-block text-[#E36630] hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#E36630] border-t-transparent" />
          <p className="text-gray-600">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
          <p className="mt-2 text-gray-600">
            Your order <strong>{order.orderId}</strong> was not paid.
          </p>
          {order.failedReason && (
            <p className="mt-2 text-sm text-red-600">{order.failedReason}</p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/checkout"
              className="rounded-lg bg-[#E36630] px-6 py-3 font-medium text-white hover:bg-[#cc5a2a]"
            >
              Try again
            </Link>
            <Link
              href={PRODUCTS_PATH}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-end">
          <Link href={PRODUCTS_PATH} className="flex items-center text-[#E36630] hover:text-[#cc5a2a]">
            Continue Shopping
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isPending && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Payment is still being confirmed. Refresh this page in a moment or check your email.
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                {order.paymentStatus === 'paid' ? 'Order Placed Successfully!' : 'Order Received'}
              </h1>
              <p className="mb-2 text-lg text-gray-600">
                Thank you{order.customerName ? `, ${order.customerName}` : ''}!
              </p>
              {!user && order.paymentStatus === 'paid' && (
                <p className="mx-auto max-w-xl text-sm text-gray-600">
                  Sign in with{' '}
                  <span className="font-medium text-gray-900">{order.customerEmail || 'your checkout email'}</span>{' '}
                  to track delivery status and order updates.
                </p>
              )}
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Order Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm text-gray-600">Order Number</span>
                  <p className="font-medium text-gray-900">{order.orderId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Order Date</span>
                  <p className="font-medium text-gray-900">{formatOrderDate(order.orderDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <p className="font-medium text-gray-900">{paymentMethodLabel(order.paymentMethod)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <p
                    className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}
                  >
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Pending confirmation'}
                  </p>
                </div>
                {order.paymentId && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-600">Payment Reference</span>
                    <p className="font-medium text-gray-900">{order.paymentId}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Name</span>
                  <p className="font-medium text-gray-900">{order.customerName || '—'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email</span>
                  <p className="font-medium text-gray-900">{order.customerEmail || '—'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone</span>
                  <p className="font-medium text-gray-900">{order.customerPhone || '—'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Delivery Address</span>
                  <p className="font-medium text-gray-900">{order.customerAddress || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>
              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-start gap-3 border-b pb-3 last:border-b-0"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-[#E36630]">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Product Subtotal</span>
                  <span>PKR {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-semibold">Total Paid</span>
                  <span className="text-lg font-bold text-[#E36630]">
                    PKR {order.totalPaid.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Link
                  href={trackHref}
                  className="block w-full rounded-lg bg-[#E36630] py-3 text-center font-medium text-white hover:bg-[#cc5a2a]"
                >
                  {user ? 'Track Your Order' : 'Login to Track Order'}
                </Link>
                {!user && (
                  <Link
                    href={signupHref}
                    className="block w-full rounded-lg border border-gray-300 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const OrderSuccessPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E36630] border-t-transparent" />
      </div>
    }
  >
    <OrderSuccessContent />
  </Suspense>
);

export default OrderSuccessPage;
