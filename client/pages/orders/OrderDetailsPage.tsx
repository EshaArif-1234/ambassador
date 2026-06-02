'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId?: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  gatewayMethod?: string;
  paidAt?: string;
  deliveryDate?: string;
  shippingAddress: { street: string; city: string; state?: string; zipCode?: string; country?: string };
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—';

export default function OrderDetailsPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');

  const [order, setOrder]     = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    if (authLoading) return;
    if (!user || !id) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/orders/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setOrder(d.data); else setError(d.message || 'Order not found.'); })
      .catch(() => setError('Failed to load order.'))
      .finally(() => setLoading(false));
  }, [user, id, authLoading]);

  useEffect(() => { load(); }, [load]);

  const cancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const d = await res.json();
      if (d.success) setOrder(d.data);
      else setError(d.message);
    } catch {
      setError('Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading) {
    return <AccountPageLoader />;
  }

  if (!user) return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please log in to view this order.</p>
        <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">Login</Link>
      </div>
    </div>
  );

  const handlingFee = order ? Math.max(order.totalAmount - order.subtotal - order.deliveryCharges, 0) : 0;
  const canCancel = order && ['pending', 'confirmed', 'processing'].includes(order.status);
  const isDelivered = order?.status === 'delivered';

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
          <button onClick={() => router.back()} className="text-sm text-[#0F4C69] hover:text-[#E36630] font-medium">
            ← Back
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-white animate-pulse" />)}
          </div>
        ) : error || !order ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 py-16 text-center">
            <p className="text-gray-500">{error || 'Order not found.'}</p>
            <Link href="/orders" className="mt-4 inline-block px-6 py-2 bg-[#E36630] text-white rounded-xl text-sm hover:bg-[#cc5a2a]">
              Back to My Orders
            </Link>
          </div>
        ) : (
          <>
            {/* Status header card */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#0F4C69] flex items-center justify-center text-white text-xs font-bold">A</span>
                <span className="font-semibold text-gray-800 text-sm">Ambassador Store</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </div>

            {/* Delivery banner */}
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM9 17h6m4 0a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0" />
                  </svg>
                  <span className="font-medium text-gray-700">Standard Delivery</span>
                  <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {order.status === 'delivered'
                    ? `Package delivered! ${fmtDate(order.deliveryDate || order.updatedAt)}`
                    : order.status === 'cancelled'
                    ? 'Order cancelled'
                    : 'Your package is on the way'}
                </p>
              </div>
              {order.status !== 'cancelled' && !isDelivered && (
                <button className="px-5 py-2 bg-[#0F4C69] text-white text-sm font-medium rounded-lg hover:bg-[#0c3d54] transition-colors">
                  Track Package
                </button>
              )}
            </div>

            {/* Items */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 divide-y divide-gray-100">
              {order.items.map((item, i) => (
                <div key={i} className="px-6 py-5 flex flex-col sm:flex-row gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                    {item.sku && <p className="text-xs text-gray-400 mt-1">SKU: {item.sku}</p>}
                  </div>
                  <div className="text-sm text-gray-700 sm:text-right space-y-1 shrink-0">
                    <p className="font-semibold text-gray-900">Rs. {item.price.toLocaleString()}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="sm:text-right shrink-0 flex sm:flex-col gap-3 sm:gap-1">
                    {canCancel && (
                      <button onClick={cancelOrder} disabled={cancelling} className="text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50">
                        {cancelling ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                    {isDelivered && item.productId && (
                      <Link href={`/products/${item.productId}`} className="text-xs font-semibold text-[#0F4C69] hover:text-[#E36630] uppercase tracking-wide">
                        Write a Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">Order {order.orderNumber}</p>
              <div className="space-y-1.5 text-sm text-gray-500">
                <p>Placed on {fmtDateTime(order.createdAt)}</p>
                {order.paidAt && <p>Paid on {fmtDateTime(order.paidAt)}</p>}
                {isDelivered && <p>Delivered on {fmtDateTime(order.deliveryDate || order.updatedAt)}</p>}
              </div>
              <p className="text-sm font-medium text-gray-700 mt-3">
                Paid by {order.gatewayMethod || order.paymentMethod}
              </p>
            </div>

            {/* Address + Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Address */}
              <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                  <span className="px-2 py-0.5 rounded-full bg-[#E36630]/10 text-[#E36630] text-[10px] font-bold uppercase tracking-wide">Home</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.country]
                    .filter(Boolean).join(', ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">{order.customerPhone}</p>
              </div>

              {/* Total Summary */}
              <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Total Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({order.items.length} Item{order.items.length !== 1 ? 's' : ''})</span>
                    <span>Rs. {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee</span>
                    <span>Rs. {order.deliveryCharges.toLocaleString()}</span>
                  </div>
                  {handlingFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>COD Handling Fee</span>
                      <span>Rs. {handlingFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 mt-2 border-t border-gray-100">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">Rs. {order.totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-1">Paid by {order.gatewayMethod || order.paymentMethod}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AccountLayout>
  );
}
