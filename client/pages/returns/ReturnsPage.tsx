'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';
import { orderMetaLine } from '@/utils/orderDisplay.util';
import { fmtCancellationDate, getCancellationReason } from '@/utils/orderCancellation.util';

interface OrderItem {
  productId?: string;
  productName: string;
  productImage?: string;
  productCode?: string;
  quantity: number;
  price: number;
  total: number;
}

interface CancelledOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt?: string;
  status: 'cancelled';
  items: OrderItem[];
  subtotal?: number;
  deliveryCharges?: number;
  totalAmount: number;
  paymentStatus?: string;
  notes?: string;
  failedReason?: string;
}

export default function ReturnsPage() {
  const { user, isLoading: authLoading } = useUser();
  const [orders, setOrders] = useState<CancelledOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?status=cancelled', {
        credentials: 'include',
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success) {
        setOrders(
          (json.data ?? []).filter((o: CancelledOrder) => o.status === 'cancelled')
        );
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    load();
  }, [user, authLoading, load]);

  if (authLoading) {
    return <AccountPageLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your cancellations.</p>
          <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Cancellations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Orders cancelled by our team. Customers cannot cancel orders from their account.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-0.5">No return service</p>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                We do not offer product returns through the website. If an order is cancelled here, it was
                processed by Ambassador Store admin. For questions, contact{' '}
                <a href="mailto:support@ambassador.pk" className="underline font-medium">
                  support@ambassador.pk
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No cancelled orders</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              You have no orders cancelled by the store. Active and delivered orders are listed under My Orders.
            </p>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E36630] text-white text-sm font-medium rounded-xl hover:bg-[#cc5a2a] transition-colors"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const reason = getCancellationReason(order);
              const cancelledOn = fmtCancellationDate(order.updatedAt ?? order.createdAt);
              return (
                <article
                  key={order._id}
                  className="rounded-2xl bg-white shadow-sm border border-red-100 overflow-hidden"
                >
                  <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50/50">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{orderMetaLine(order)}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Cancelled by store on:</span> {cancelledOn}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-lg font-bold text-gray-700 line-through decoration-red-400/80">
                        Rs. {order.totalAmount.toLocaleString()}
                      </p>
                      <Link
                        href={`/orders/${order._id}`}
                        className="px-4 py-2 text-sm font-semibold text-[#0F4C69] border border-[#0F4C69] rounded-lg hover:bg-[#0F4C69] hover:text-white transition-colors whitespace-nowrap"
                      >
                        View order
                      </Link>
                    </div>
                  </div>

                  {reason && (
                    <div className="px-5 sm:px-6 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                        Cancellation reason
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">{reason}</p>
                    </div>
                  )}

                  {order.paymentStatus && (
                    <div className="px-5 sm:px-6 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-500">
                        Payment status:{' '}
                        <span className="font-medium text-gray-700 capitalize">{order.paymentStatus}</span>
                      </p>
                    </div>
                  )}

                  <div className="divide-y divide-gray-100">
                    {order.items.map((item, i) => (
                      <div key={i} className="px-5 sm:px-6 py-3 flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                          {item.productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover opacity-75"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty {item.quantity}
                            {item.productCode ? ` · ${item.productCode}` : ''}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-500 shrink-0">
                          Rs. {(item.total ?? item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
