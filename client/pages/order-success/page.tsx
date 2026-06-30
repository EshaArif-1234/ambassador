'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATALOGUE_PATH } from '@/lib/siteRoutes';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import type { CartItem } from '@/contexts/CartContext';

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
  orderData?: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
    deliveryNotes?: string;
    products?: CartItem[];
    subtotal?: number;
    deliveryCharges?: number;
    totalAmount?: number;
    orderDate?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  paidAt?: string;
  paymentId?: string;
  dbOrderId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  products?: CartItem[];
  totalAmount?: number;
  orderDate?: string;
  deliveryNotes?: string;
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
};

function normalizeOrder(raw: SavedOrderRaw): NormalizedOrder {
  const customer = raw.customerInfo ?? {};
  const nested = raw.orderData ?? {};
  const items =
    raw.orderItems ??
    nested.products ??
    raw.products ??
    [];

  const subtotal =
    nested.subtotal ??
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalPaid = raw.amount ?? nested.totalAmount ?? raw.totalAmount ?? subtotal;

  const addressParts = [
    customer.address ?? nested.address ?? raw.address,
    customer.city ?? nested.city,
  ].filter(Boolean);

  return {
    orderId: raw.orderId ?? '—',
    orderDate: raw.paidAt ?? nested.orderDate ?? raw.orderDate ?? new Date().toISOString(),
    paymentMethod: raw.paymentMethod ?? nested.paymentMethod ?? 'online',
    paymentStatus: raw.paymentStatus ?? nested.paymentStatus ?? 'paid',
    paymentId: raw.paymentId,
    customerName: customer.name ?? nested.name ?? raw.name ?? '',
    customerEmail: customer.email ?? nested.email ?? raw.email ?? '',
    customerPhone: customer.phone ?? nested.phone ?? raw.phone ?? '',
    customerAddress: addressParts.join(', '),
    deliveryNotes: nested.deliveryNotes ?? raw.deliveryNotes,
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
  if (method === 'online' || method === 'card') return 'Credit/Debit Card';
  return 'Online Payment';
}

const OrderSuccessPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [order, setOrder] = useState<NormalizedOrder | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lastOrder');
    if (!savedOrder) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(savedOrder) as SavedOrderRaw;
      setOrder(normalizeOrder(parsed));
    } catch (error) {
      console.error('Error parsing order data:', error);
      router.push('/');
    }
  }, [router]);

  const trackHref = useMemo(() => {
    if (!user) return '/login';
    if (order?.dbOrderId) return `/orders/${order.dbOrderId}`;
    return '/orders';
  }, [user, order?.dbOrderId]);

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#E36630] border-t-transparent" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-end">
          <Link
            href={CATALOGUE_PATH}
            className="flex items-center text-[#E36630] hover:text-[#cc5a2a]"
          >
            Continue Shopping
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Order Placed Successfully!
              </h1>
              <p className="mb-2 text-lg text-gray-600">
                Thank you for your order{order.customerName ? `, ${order.customerName}` : ''}!
              </p>
              <p className="text-gray-600">
                We&apos;ve received your order and will begin processing it right away.
              </p>
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
                  <p className="font-medium text-green-600">
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
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
                {order.deliveryNotes && (
                  <div>
                    <span className="text-sm text-gray-600">Delivery Notes</span>
                    <p className="font-medium text-gray-900">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>

              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                {order.items.length > 0 ? (
                  order.items.map((item, index) => (
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
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-[#E36630]">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-gray-500">No items found</p>
                )}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Product Subtotal</span>
                  <span className="text-gray-900">PKR {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="text-[#E36630]">To be calculated</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                  <span className="text-lg font-bold text-[#E36630]">
                    PKR {order.totalPaid.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href={trackHref}
                  className="block w-full rounded-lg bg-[#E36630] py-3 px-4 text-center font-medium text-white transition-colors hover:bg-[#cc5a2a]"
                >
                  {user ? 'Track Your Order' : 'Login to Track Order'}
                </Link>
                <Link
                  href={CATALOGUE_PATH}
                  className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Continue Shopping
                </Link>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                Our team will contact you within 24 hours about delivery charges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
