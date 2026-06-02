'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: { city?: string; street?: string };
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const { user, isLoading } = useUser();
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    if (isLoading) return;
    if (!user) { setLoading(false); return; }
    setLoading(true);
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isLoading]);

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const filtered = orders.filter(o => {
    if (statusFilter === 'active')    return ['pending','confirmed','processing','shipped'].includes(o.status);
    if (statusFilter === 'delivered') return o.status === 'delivered';
    if (statusFilter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  if (isLoading) {
    return <AccountPageLoader />;
  }

  if (!user) return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please log in to view your orders.</p>
        <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">Login</Link>
      </div>
    </div>
  );

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all your orders</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all','active','delivered','cancelled'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                statusFilter === f ? 'bg-[#E36630] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#E36630] hover:text-[#E36630]'
              }`}>
              {f === 'all' ? `All (${orders.length})` : f}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-white animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-16 text-center">
            <svg className="w-14 h-14 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-500 font-medium">No orders found</p>
            <Link href="/products" className="mt-4 inline-block px-6 py-2 bg-[#E36630] text-white rounded-xl text-sm hover:bg-[#cc5a2a]">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order._id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', { year:'numeric', month:'long', day:'numeric' })}
                      {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-[#E36630]">PKR {order.totalAmount.toLocaleString()}</span>
                    <button onClick={() => toggle(order._id)}
                      className="text-sm text-[#0F4C69] font-medium hover:text-[#E36630] transition-colors flex items-center gap-1">
                      {expanded.has(order._id) ? 'Hide' : 'Details'}
                      <svg className={`w-4 h-4 transition-transform ${expanded.has(order._id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expanded.has(order._id) && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                        <span className="font-medium text-gray-800">PKR {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {(order.shippingAddress?.street || order.shippingAddress?.city) && (
                      <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                        📍 {[order.shippingAddress.street, order.shippingAddress.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
