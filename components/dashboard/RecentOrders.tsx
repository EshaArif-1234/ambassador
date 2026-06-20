'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fmtOrderDate, totalItemQuantity } from '@/utils/orderDisplay.util';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
}

interface RecentOrdersProps {
  title: string;
  filter?: 'pending' | 'all';
  limit?: number;
}

interface ApiOrderRow {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  status?: OrderStatus;
  createdAt?: string;
  items?: Array<{ quantity?: number }>;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({
  title,
  filter = 'all',
  limit = 8,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (filter === 'pending') params.set('status', 'pending');

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load recent orders.');
        }

        if (cancelled) return;

        const mapped: Order[] = (json.data as ApiOrderRow[]).map((o) => ({
          id: String(o._id),
          orderNumber: o.orderNumber?.trim() || String(o._id).slice(-8).toUpperCase(),
          customerName: o.customerName?.trim() || 'Guest',
          email: o.customerEmail?.trim() || '—',
          total: Number(o.totalAmount) || 0,
          status: o.status ?? 'pending',
          date: o.createdAt ? fmtOrderDate(o.createdAt) : '—',
          items: totalItemQuantity(o.items ?? []),
        }));

        setOrders(mapped);
      } catch (err) {
        if (!cancelled) {
          setOrders([]);
          setError(err instanceof Error ? err.message : 'Failed to load recent orders.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => { cancelled = true; };
  }, [filter, limit]);

  const getStatusBadge = (status: OrderStatus) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap';

    switch (status) {
      case 'pending':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'confirmed':
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'shipped':
        return `${baseClasses} bg-cyan-100 text-cyan-800`;
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatStatusLabel = (status: OrderStatus) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse grid grid-cols-5 gap-4">
              <div className="col-span-2 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Link
          href="/orders-management"
          className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          View All →
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">No orders yet</p>
          <p className="text-gray-400 text-sm">
            {filter === 'pending'
              ? 'No pending orders at the moment'
              : 'When orders are placed, they will appear here'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[36rem]">
            <div>Customer</div>
            <div>Order ID</div>
            <div>Date</div>
            <div>Amount</div>
            <div>Status</div>
          </div>

          <div className="divide-y divide-gray-100 min-w-[36rem]">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-5 gap-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{order.customerName}</p>
                  <p className="text-sm text-gray-500 truncate">{order.email}</p>
                </div>

                <div className="min-w-0">
                  <p className="font-mono text-sm text-gray-900">#{order.orderNumber}</p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    PKR {order.total.toLocaleString('en-PK')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items} item{order.items !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="min-w-0">
                  <span className={getStatusBadge(order.status)}>
                    {formatStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
