'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';
import { formatDeliveryAddress, orderMetaLine } from '@/utils/orderDisplay.util';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId?: string;
  productName: string;
  productImage?: string;
  productCode?: string;
  category?: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal?: number;
  deliveryCharges?: number;
  totalAmount: number;
  paymentStatus?: string;
  paidAt?: string;
  deliveryDate?: string;
  shippingAddress?: { city?: string; street?: string; state?: string; country?: string };
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

export default function OrdersPage() {
  const { user, isLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setOrders(
            (d.data ?? []).map((o: Order) => ({
              ...o,
              status: (o.status ?? 'pending') as OrderStatus,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isLoading]);

  const filtered = orders.filter(o => {
    if (statusFilter === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status);
    if (statusFilter === 'delivered') return o.status === 'delivered';
    if (statusFilter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const filterCounts = {
    all: orders.length,
    active: orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (isLoading) {
    return <AccountPageLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your orders.</p>
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
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all your orders</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'delivered', 'cancelled'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-[#E36630] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#E36630] hover:text-[#E36630]'
              }`}
            >
              {f === 'all' ? `All (${filterCounts.all})` : `${f} (${filterCounts[f]})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-16 text-center">
            <svg className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-500 font-medium">No orders found</p>
            <Link
              href="/products"
              className="mt-4 inline-block px-6 py-2 bg-[#E36630] text-white rounded-xl text-sm hover:bg-[#cc5a2a]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(order => {
              const deliveryLine = formatDeliveryAddress(order.shippingAddress);
              return (
              <article
                key={order._id}
                className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Order header */}
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{orderMetaLine(order)}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="text-lg font-bold text-[#E36630]">Rs. {order.totalAmount.toLocaleString()}</p>
                    <Link
                      href={`/orders/${order._id}`}
                      className="px-4 py-2 text-sm font-semibold text-white bg-[#0F4C69] rounded-lg hover:bg-[#0c3d54] transition-colors whitespace-nowrap"
                    >
                      View order
                    </Link>
                  </div>
                </div>

                {/* Line items */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, i) => (
                    <div key={i} className="px-5 sm:px-6 py-4 flex gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {item.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          {item.productId ? (
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-sm font-semibold text-gray-900 hover:text-[#E36630] line-clamp-2 transition-colors"
                            >
                              {item.productName}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.productName}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            {item.category && (
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                                {item.category}
                              </span>
                            )}
                            {item.productCode && (
                              <span>
                                Code: <span className="text-gray-700 font-medium">{item.productCode}</span>
                              </span>
                            )}
                            <span>
                              Qty: <span className="text-gray-700 font-medium">{item.quantity}</span>
                            </span>
                            <span>
                              Rs. {item.price.toLocaleString()} each
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-900 shrink-0 sm:text-right">
                          Rs. {(item.total ?? item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: address + summary */}
                <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-sm">
                  {deliveryLine && order.status !== 'cancelled' && (
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-md">
                      <span className="font-medium text-gray-700">Delivery: </span>
                      {deliveryLine}
                    </p>
                  )}
                  {order.status === 'cancelled' && (
                    <p className="text-gray-500 text-xs sm:text-sm">This order was cancelled by the store and will not be delivered.</p>
                  )}
                  <div className="text-xs text-gray-500 sm:text-right space-y-0.5 shrink-0">
                    {order.subtotal != null && (
                      <p>
                        Subtotal: <span className="text-gray-700">Rs. {order.subtotal.toLocaleString()}</span>
                      </p>
                    )}
                    {order.deliveryCharges != null && order.deliveryCharges > 0 && order.status !== 'cancelled' && (
                      <p>
                        Shipping: <span className="text-gray-700">Rs. {order.deliveryCharges.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
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
