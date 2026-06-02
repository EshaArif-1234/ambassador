'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';
import { formatDeliveryAddress, totalItemQuantity } from '@/utils/orderDisplay.util';

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

type ReviewItemStatus = { hasReview: boolean; reviewId?: string };

function OrderReviewButton({
  orderId,
  productId,
  reviewStatus,
  show,
  className = '',
}: {
  orderId: string;
  productId: string;
  reviewStatus?: ReviewItemStatus;
  show: boolean;
  className?: string;
}) {
  const router = useRouter();

  if (!show) return null;

  const go = () => {
    if (reviewStatus?.hasReview) {
      router.push('/my-reviews');
      return;
    }
    router.push(`/orders/${orderId}/review/${productId}`);
  };

  return (
    <button
      type="button"
      onClick={go}
      className={`px-4 py-2 text-sm font-semibold text-[#E36630] hover:text-[#cc5a2a] text-center whitespace-nowrap transition-colors ${className}`}
    >
      {reviewStatus?.hasReview ? 'View your review' : 'Write a review'}
    </button>
  );
}

export default function OrderDetailsPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');

  const [order, setOrder]     = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [reviewByProduct, setReviewByProduct] = useState<Record<string, ReviewItemStatus>>({});

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

  useEffect(() => {
    if (!order || order.status !== 'delivered' || !id) return;
    fetch(`/api/orders/${id}/review-status`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.items) setReviewByProduct(d.data.items);
      })
      .catch(() => {});
  }, [order, id]);

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
  const isDelivered = order?.status === 'delivered';
  const showReviewButton = (productId?: string) =>
    Boolean(isDelivered && productId);

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
                    ? 'This order was cancelled by the store'
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
                <div key={i} className="px-5 sm:px-6 py-5">
                  <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[88px_1fr_auto] gap-4 sm:gap-6 sm:items-center">
                    {/* Thumbnail */}
                    <div className="w-[88px] h-[88px] rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                      {item.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No image</div>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="min-w-0 flex flex-col justify-center gap-1.5 col-span-1">
                      {item.productId ? (
                        <Link
                          href={`/products/${item.productId}`}
                          className="text-base font-semibold text-gray-900 hover:text-[#E36630] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">{item.productName}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        {item.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                            {item.category}
                          </span>
                        )}
                        {item.productCode && (
                          <span>
                            Product Code: <span className="text-gray-700 font-medium">{item.productCode}</span>
                          </span>
                        )}
                        <span>
                          Qty: <span className="text-gray-700 font-medium">{item.quantity}</span>
                        </span>
                        <span>
                          Unit: <span className="text-gray-700 font-medium">Rs. {item.price.toLocaleString()}</span>
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 sm:hidden">
                        Line total: <span className="font-semibold text-gray-900">Rs. {item.total.toLocaleString()}</span>
                      </p>
                    </div>

                    {/* Price & actions — desktop */}
                    <div className="hidden sm:flex flex-col items-end justify-center gap-3 shrink-0 min-w-[148px]">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 leading-tight">Rs. {item.total.toLocaleString()}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.quantity} × Rs. {item.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-stretch gap-2 w-full">
                        {item.productId && (
                          <OrderReviewButton
                            orderId={order._id}
                            productId={item.productId}
                            reviewStatus={reviewByProduct[item.productId]}
                            show={showReviewButton(item.productId)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Price & actions — mobile (full width below) */}
                    <div className="col-span-2 sm:hidden flex items-center justify-between gap-4 pt-1 border-t border-gray-50">
                      <div>
                        <p className="text-lg font-bold text-gray-900">Rs. {item.total.toLocaleString()}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">{item.quantity} × Rs. {item.price.toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {item.productId && (
                          <OrderReviewButton
                            orderId={order._id}
                            productId={item.productId}
                            reviewStatus={reviewByProduct[item.productId]}
                            show={showReviewButton(item.productId)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">Order {order.orderNumber}</p>
              <div className="space-y-1.5 text-sm text-gray-500">
                {order.status === 'cancelled' ? (
                  <>
                    <p>Cancelled on {fmtDateTime(order.updatedAt ?? order.createdAt)}</p>
                    <p>Originally ordered on {fmtDateTime(order.createdAt)}</p>
                  </>
                ) : (
                  <>
                    <p>Ordered on {fmtDateTime(order.createdAt)}</p>
                    {order.paidAt && order.paymentStatus === 'paid' && (
                      <p>Paid on {fmtDateTime(order.paidAt)}</p>
                    )}
                    {isDelivered && (
                      <p>Delivered on {fmtDateTime(order.deliveryDate || order.updatedAt)}</p>
                    )}
                  </>
                )}
              </div>
              {order.status !== 'cancelled' && (
                <p className="text-sm font-medium text-gray-700 mt-3">
                  Paid by {order.gatewayMethod || order.paymentMethod}
                </p>
              )}
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
                  {formatDeliveryAddress(order.shippingAddress) ?? 'Address not available'}
                </p>
                <p className="text-sm text-gray-600 mt-1">{order.customerPhone}</p>
              </div>

              {/* Total Summary */}
              <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Total Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItemQuantity(order.items)} item{totalItemQuantity(order.items) !== 1 ? 's' : ''})</span>
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
