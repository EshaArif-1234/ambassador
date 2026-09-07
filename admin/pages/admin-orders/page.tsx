'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import { adminIconActionBtn } from '@/admin/lib/adminTableActionStyles';
import { downloadOrdersPdf } from '@/utils/generateOrdersPdf';
import { isOrderInDateRange, type OrderDateRange } from '@/utils/orderDateRange.util';
import {
  displayText,
  formatFullShippingAddress,
  formatOrderDateTime,
  formatPaymentMethodLabel,
  normalizeLineItemTotal,
  quantityLabel,
} from '@/utils/orderDisplay.util';
import {
  getMnpShipmentDisplayStatus,
  hasMnpShipment,
} from '@/utils/orderWorkflow.util';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  orderDate: string;
  updatedAt?: string;
  deliveryDate?: string;
  deliveryNotes?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  failedReason?: string;
  /** Matches `Payment.id` on the Payments dashboard */
  paymentId: string;
  transactionId: string;
  gatewayMethod: string;
  paidAt?: string;
  mnpConsignmentNumber?: string;
  mnpOrderReferenceId?: string;
  mnpTrackingStatus?: string;
  mnpBookingMessage?: string;
  mnpBookedAt?: string;
  mnpBookingError?: string;
}

interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
}

/** Amounts are shown in Pakistani Rupees only (no USD/EUR/etc. in UI). */
const ORDER_CURRENCY_LABEL = 'PKR';

function formatOrderMoney(amount: number): string {
  return `${ORDER_CURRENCY_LABEL} ${amount.toLocaleString('en-PK')}`;
}

function hasText(value?: string | null): value is string {
  return Boolean(value?.trim());
}

const OrdersPage = () => {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  >('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'paid' | 'refunded'>('all');
  const [dateRange, setDateRange] = useState<OrderDateRange>('all');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [mnpTrackingLoading, setMnpTrackingLoading] = useState(false);
  const [mnpTrackingEvents, setMnpTrackingEvents] = useState<
    { status: string; narration: string; location?: string; time?: string }[]
  >([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders?syncMnp=1', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load orders.');
      // Map MongoDB _id to id and normalise fields
      const mapped: Order[] = (data.data as any[]).map((o: any) => {
        const items = (o.items ?? []).map((item: any, idx: number) => ({
          id: item._id ?? String(idx),
          productId: item.productId,
          productName: item.productName ?? 'Unknown product',
          productImage: item.productImage ?? '',
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          total: Number(item.total) || (Number(item.price) || 0) * (Number(item.quantity) || 0),
          sku: item.sku,
        }));
        const subtotal =
          typeof o.subtotal === 'number' && !Number.isNaN(o.subtotal)
            ? o.subtotal
            : items.reduce((sum: number, item: OrderItem) => sum + item.total, 0);
        const deliveryCharges =
          typeof o.deliveryCharges === 'number' && !Number.isNaN(o.deliveryCharges)
            ? o.deliveryCharges
            : 0;
        const totalAmount =
          typeof o.totalAmount === 'number' && !Number.isNaN(o.totalAmount)
            ? o.totalAmount
            : subtotal + deliveryCharges;

        return {
        id: o._id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        items,
        subtotal,
        deliveryCharges,
        totalAmount,
        currency: o.currency ?? 'PKR',
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod ?? o.gatewayMethod ?? '',
        orderDate: o.createdAt ?? o.orderDate ?? '',
        updatedAt: o.updatedAt,
        deliveryDate: o.deliveryDate,
        deliveryNotes: o.deliveryNotes ?? '',
        shippingAddress: {
          street: o.shippingAddress?.street ?? '',
          city: o.shippingAddress?.city ?? '',
          state: o.shippingAddress?.state ?? '',
          zipCode: o.shippingAddress?.zipCode ?? '',
          country: o.shippingAddress?.country ?? 'Pakistan',
        },
        notes: o.notes ?? '',
        failedReason: o.failedReason,
        paymentId: o.paymentId ?? '',
        transactionId: o.transactionId ?? '',
        gatewayMethod: o.gatewayMethod ?? '',
        paidAt: o.paidAt,
        mnpConsignmentNumber: o.mnpConsignmentNumber ?? '',
        mnpOrderReferenceId: o.mnpOrderReferenceId ?? '',
        mnpTrackingStatus: o.mnpTrackingStatus ?? '',
        mnpBookingMessage: o.mnpBookingMessage ?? '',
        mnpBookedAt: o.mnpBookedAt,
        mnpBookingError: o.mnpBookingError ?? '',
      };
      });
      setOrders(mapped);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMnpTrackingEvents([]);
  }, [selectedOrder?.id, showViewModal]);

  useEffect(() => {
    if (!showViewModal || !selectedOrder?.id || !hasMnpShipment(selectedOrder)) return;

    let cancelled = false;
    const orderId = selectedOrder.id;

    (async () => {
      setMnpTrackingLoading(true);
      try {
        const res = await fetch(`/api/shipping/mnp/track?orderId=${encodeURIComponent(orderId)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (cancelled || !data.success) return;

        const events = Array.isArray(data.data?.events) ? data.data.events : [];
        setMnpTrackingEvents(events);

        const trackingStatus = data.data?.trackingStatus?.trim();
        if (trackingStatus) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, mnpTrackingStatus: trackingStatus } : o)),
          );
          setSelectedOrder((sel) =>
            sel?.id === orderId ? { ...sel, mnpTrackingStatus: trackingStatus } : sel,
          );
        }
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setMnpTrackingLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showViewModal, selectedOrder?.id]);

  useEffect(() => {
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const paymentId = searchParams.get('paymentId')?.trim();
    const targetOrderNumber =
      orderNumber ||
      (paymentId?.startsWith('PAY-') ? paymentId.slice(4) : undefined);

    if (!targetOrderNumber && !paymentId) return;
    if (loading) return;

    const order = orders.find(
      (o) =>
        (targetOrderNumber && o.orderNumber === targetOrderNumber) ||
        (paymentId && o.paymentId === paymentId),
    );

    if (!order) return;

    setSearchTerm(order.orderNumber);
    setSelectedOrder(order);
    setShowViewModal(true);
  }, [searchParams, orders, loading]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term) ||
        order.paymentId.toLowerCase().includes(term) ||
        order.transactionId.toLowerCase().includes(term) ||
        order.items.some((item) => item.productName.toLowerCase().includes(term));
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesPaymentStatus = filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus;
      
      const matchesDate = isOrderInDateRange(order.orderDate, dateRange);
      
      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
    });
  };

  const filteredOrders = getFilteredOrders();

  const handleDownloadOrdersPdf = () => {
    setPdfLoading(true);
    try {
      downloadOrdersPdf(
        filteredOrders.map((order) => ({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          itemsCount: order.items.length,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          orderDate: order.orderDate,
        })),
        {
          dateRange,
          orderStatus: filterStatus,
          paymentStatus: filterPaymentStatus,
          search: searchTerm,
        }
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const getMnpStatusBadgeColor = (order: Order) => {
    const label = getMnpShipmentDisplayStatus(order).toLowerCase();
    if (label.includes('deliver')) return 'bg-green-100 text-green-800';
    if (label.includes('transit') || label.includes('dispatch') || label.includes('book')) {
      return 'bg-cyan-100 text-cyan-800';
    }
    if (label.includes('await') || label.includes('fail')) return 'bg-amber-100 text-amber-800';
    if (order.status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">
              Shipment status is synced from M&P Courier automatically. Open an order to view live tracking details.
            </p>
          </div>
          <Link
            href={PRODUCTS_PATH}
            title="Browse products and checkout"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0F4C69] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0d3f59]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Shop &amp; checkout
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOrders.filter(o => o.status === 'delivered').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In transit (M&P)</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOrders.filter(o => o.status === 'shipped').length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'paid');
                    if (paidOrders.length === 0) return '—';
                    const sum = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
                    return formatOrderMoney(sum);
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order, customer, payment, or product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">M&P Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="processing">Awaiting M&P</option>
                <option value="shipped">In transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Payment</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none text-gray-900 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="recent">Recent Orders (Last 3 Days)</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              PDF export uses the current search, status, payment, and date range filters.
            </p>
            <button
              type="button"
              onClick={handleDownloadOrdersPdf}
              disabled={pdfLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0F4C69]/30 bg-[#0F4C69]/5 px-4 py-2 text-sm font-medium text-[#0F4C69] transition-colors hover:bg-[#0F4C69]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pdfLoading ? 'Generating PDF…' : 'Download Orders PDF'}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M&P Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items.length} items</div>
                      <div className="text-xs text-gray-500">
                        {order.items.slice(0, 2).map(item => item.productName).join(', ')}
                        {order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatOrderMoney(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMnpStatusBadgeColor(order)}`}>
                          {getMnpShipmentDisplayStatus(order)}
                        </span>
                        {hasMnpShipment(order) && (
                          <p className="text-[10px] font-mono text-indigo-700">
                            {order.mnpConsignmentNumber || order.mnpOrderReferenceId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(order)}
                          className={adminIconActionBtn}
                          title="View order"
                          aria-label="View order details"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm ? `No orders found matching "${searchTerm}"` : 'No orders available'}
            </p>
          </div>
        )}

        {/* View Order Modal */}
        {showViewModal && selectedOrder && (() => {
          const hasPaymentRecord = hasText(selectedOrder.paymentId);
          const hasSku = selectedOrder.items.some((item) => hasText(item.sku));
          const paymentMethodLabel = formatPaymentMethodLabel(
            selectedOrder.gatewayMethod || selectedOrder.paymentMethod
          );

          return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order {displayText(selectedOrder.orderNumber)}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed {formatOrderDateTime(selectedOrder.orderDate)} · {quantityLabel(selectedOrder.items)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {hasPaymentRecord && (
                  <Link
                    href={`/payments-management?paymentId=${encodeURIComponent(selectedOrder.paymentId)}`}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
                  >
                    View payment
                  </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary row */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getMnpStatusBadgeColor(selectedOrder)}`}>
                    M&P: {getMnpShipmentDisplayStatus(selectedOrder)}
                  </span>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadgeColor(selectedOrder.paymentStatus)}`}>
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatOrderMoney(selectedOrder.totalAmount)} total
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Order</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Order number</dt>
                        <dd className="font-medium text-gray-900 text-right">{displayText(selectedOrder.orderNumber)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Ordered on</dt>
                        <dd className="font-medium text-gray-900 text-right">
                          {formatOrderDateTime(selectedOrder.orderDate)}
                        </dd>
                      </div>
                      {selectedOrder.updatedAt && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">Last updated</dt>
                          <dd className="font-medium text-gray-900 text-right">
                            {formatOrderDateTime(selectedOrder.updatedAt)}
                          </dd>
                        </div>
                      )}
                      {selectedOrder.deliveryDate && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-gray-500">Delivered on</dt>
                          <dd className="font-medium text-gray-900 text-right">
                            {formatOrderDateTime(selectedOrder.deliveryDate)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Customer</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="font-medium text-gray-900 text-right">{displayText(selectedOrder.customerName)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Email</dt>
                        <dd className="font-medium text-gray-900 text-right break-all">{displayText(selectedOrder.customerEmail)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Phone</dt>
                        <dd className="font-medium text-gray-900 text-right">{displayText(selectedOrder.customerPhone)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Payment</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {hasPaymentRecord && (
                      <div className="flex justify-between gap-4 sm:col-span-2">
                        <dt className="text-gray-500">Payment ID</dt>
                        <dd className="font-mono text-xs text-gray-900">{selectedOrder.paymentId}</dd>
                      </div>
                    )}
                    {hasText(selectedOrder.transactionId) && (
                      <div className="flex justify-between gap-4 sm:col-span-2">
                        <dt className="text-gray-500">Transaction ID</dt>
                        <dd className="font-mono text-xs text-gray-900 truncate max-w-[12rem] sm:max-w-none" title={selectedOrder.transactionId}>
                          {selectedOrder.transactionId}
                        </dd>
                      </div>
                    )}
                    {paymentMethodLabel !== '—' && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Payment method</dt>
                        <dd className="font-medium text-gray-900 text-right">{paymentMethodLabel}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Payment status</dt>
                      <dd className="font-medium text-gray-900 text-right capitalize">{selectedOrder.paymentStatus}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Currency</dt>
                      <dd className="font-medium text-gray-900 text-right">{selectedOrder.currency}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Total amount</dt>
                      <dd className="font-semibold text-gray-900">{formatOrderMoney(selectedOrder.totalAmount)}</dd>
                    </div>
                    {selectedOrder.paidAt && (
                      <div className="flex justify-between gap-4 sm:col-span-2">
                        <dt className="text-gray-500">Paid at</dt>
                        <dd className="text-gray-900 text-right">{formatOrderDateTime(selectedOrder.paidAt)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Shipping address</h3>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {formatFullShippingAddress(selectedOrder.shippingAddress)}
                  </p>
                  {hasText(selectedOrder.deliveryNotes) && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Delivery notes</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedOrder.deliveryNotes}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">M&P Courier</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Status and tracking are fetched live from M&P. Shipment cannot be changed from this dashboard.
                    </p>
                  </div>

                  {hasText(selectedOrder.mnpBookingError) && (
                    <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      M&P booking note: {selectedOrder.mnpBookingError}
                    </p>
                  )}

                  {mnpTrackingLoading && (
                    <p className="mb-3 text-xs text-indigo-700">Loading latest status from M&P…</p>
                  )}

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Current status</dt>
                      <dd className="font-medium text-gray-900 text-right">
                        {getMnpShipmentDisplayStatus(selectedOrder)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Consignment #</dt>
                      <dd className="font-mono text-xs text-gray-900 text-right">
                        {displayText(
                          selectedOrder.mnpConsignmentNumber ||
                            selectedOrder.mnpOrderReferenceId ||
                            '—',
                        )}
                      </dd>
                    </div>
                    {selectedOrder.mnpBookedAt && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Booked at</dt>
                        <dd className="text-gray-900 text-right">
                          {formatOrderDateTime(selectedOrder.mnpBookedAt)}
                        </dd>
                      </div>
                    )}
                    {hasText(selectedOrder.mnpBookingMessage) && (
                      <div>
                        <dt className="text-gray-500 mb-1">M&P message</dt>
                        <dd className="text-gray-900 text-sm">{selectedOrder.mnpBookingMessage}</dd>
                      </div>
                    )}
                  </dl>

                  {mnpTrackingEvents.length > 0 && (
                    <div className="mt-4 border-t border-indigo-100 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                        M&P tracking history
                      </p>
                      <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {mnpTrackingEvents.map((event, index) => (
                          <li key={`${event.time ?? index}-${event.status}`} className="text-xs text-gray-700">
                            <span className="font-medium text-gray-900">{event.status || 'Update'}</span>
                            {event.location ? ` · ${event.location}` : ''}
                            {event.time ? ` · ${formatOrderDateTime(event.time)}` : ''}
                            {event.narration ? (
                              <p className="text-gray-600 mt-0.5">{event.narration}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Line items</h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          {hasSku && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          )}
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Line total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => {
                          const lineTotal = normalizeLineItemTotal(item);
                          return (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden border shrink-0">
                                  {item.productImage ? (
                                    <Image
                                      src={item.productImage}
                                      alt={item.productName}
                                      width={44}
                                      height={44}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <span className="text-[10px] text-gray-400">No img</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate block">{displayText(item.productName)}</span>
                              </div>
                            </td>
                            {hasSku && (
                              <td className="px-4 py-3 text-xs font-mono text-gray-600">
                                {hasText(item.sku) ? item.sku : '—'}
                              </td>
                            )}
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatOrderMoney(item.price)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {formatOrderMoney(lineTotal)}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={hasSku ? 4 : 3} className="px-4 py-3 text-sm text-gray-600 text-right">Subtotal</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatOrderMoney(selectedOrder.subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={hasSku ? 4 : 3} className="px-4 py-3 text-sm text-gray-600 text-right">Delivery charges</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {formatOrderMoney(selectedOrder.deliveryCharges)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={hasSku ? 4 : 3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total amount</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            {formatOrderMoney(selectedOrder.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selectedOrder.failedReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">Failure reason</h3>
                    <p className="text-sm text-red-800">{selectedOrder.failedReason}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Notes</h3>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          );
        })()}

      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
