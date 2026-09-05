'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { adminIconActionBtn } from '@/admin/lib/adminTableActionStyles';
import { CHECKOUT_ENABLED } from '@/lib/checkoutEnabled';
import { isOrderInDateRange, type OrderDateRange } from '@/utils/orderDateRange.util';
import {
  displayText,
  formatOrderDateTime,
  formatPaymentMethodLabel,
  quantityLabel,
} from '@/utils/orderDisplay.util';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

import {
  ALFALAH_GATEWAY_CHANNELS,
  resolveAlfalahGatewayChannel,
  type AlfalahGatewayChannel,
} from '@/lib/alfalahPaymentMethods';

interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  gatewayMethod: string;
  gatewayChannel: AlfalahGatewayChannel;
  paymentId: string;
  transactionId: string;
  orderSummary: string;
  itemCount: number;
  createdAt: string;
  paidAt?: string;
  failedReason?: string;
}

const CURRENCY_LABEL = 'PKR';

const GATEWAY_CHANNELS = ALFALAH_GATEWAY_CHANNELS;

function formatMoney(amount: number): string {
  return `${CURRENCY_LABEL} ${amount.toLocaleString('en-PK')}`;
}

function resolveGatewayChannel(gatewayMethod: string, paymentMethod: string): AlfalahGatewayChannel {
  return resolveAlfalahGatewayChannel(gatewayMethod, paymentMethod);
}

function gatewayDisplayLabel(tx: PaymentTransaction): string {
  const label = formatPaymentMethodLabel(tx.gatewayMethod || tx.paymentMethod);
  if (label !== '—') return label;
  return tx.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online';
}

function mapOrderToTransaction(o: Record<string, unknown>): PaymentTransaction {
  const items = (o.items as Record<string, unknown>[] | undefined) ?? [];
  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const firstName = typeof items[0]?.productName === 'string' ? items[0].productName : 'Order items';
  const orderSummary =
    items.length > 1 ? `${firstName} +${items.length - 1} more` : firstName;

  const gatewayMethod = typeof o.gatewayMethod === 'string' ? o.gatewayMethod : '';
  const paymentMethod = typeof o.paymentMethod === 'string' ? o.paymentMethod : '';
  const paymentId = typeof o.paymentId === 'string' ? o.paymentId : '';
  const transactionId =
    typeof o.transactionId === 'string' && o.transactionId.trim()
      ? o.transactionId
      : paymentId || String(o._id ?? '');

  return {
    id: paymentId || String(o._id ?? ''),
    orderId: String(o._id ?? ''),
    orderNumber: typeof o.orderNumber === 'string' ? o.orderNumber : '—',
    customerName: typeof o.customerName === 'string' ? o.customerName : '—',
    customerEmail: typeof o.customerEmail === 'string' ? o.customerEmail : '—',
    customerPhone: typeof o.customerPhone === 'string' ? o.customerPhone : '—',
    amount:
      typeof o.totalAmount === 'number' && !Number.isNaN(o.totalAmount)
        ? o.totalAmount
        : 0,
    currency: typeof o.currency === 'string' ? o.currency : CURRENCY_LABEL,
    paymentStatus: (o.paymentStatus as PaymentStatus) ?? 'pending',
    paymentMethod,
    gatewayMethod,
    gatewayChannel: resolveGatewayChannel(gatewayMethod, paymentMethod),
    paymentId,
    transactionId,
    orderSummary,
    itemCount,
    createdAt:
      typeof o.createdAt === 'string'
        ? o.createdAt
        : typeof o.orderDate === 'string'
          ? o.orderDate
          : new Date().toISOString(),
    paidAt: typeof o.paidAt === 'string' ? o.paidAt : undefined,
    failedReason: typeof o.failedReason === 'string' ? o.failedReason : undefined,
  };
}

function getStatusStyles(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
}

function orderManagementHref(orderNumber: string): string {
  if (!orderNumber || orderNumber === '—') return '/orders-management';
  return `/orders-management?orderNumber=${encodeURIComponent(orderNumber)}`;
}

function getChannelStyles(channel: AlfalahGatewayChannel): string {
  switch (channel) {
    case 'alfa_wallet':
      return 'bg-purple-50 text-purple-800 ring-1 ring-purple-100';
    case 'bank_account':
      return 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100';
    case 'card':
      return 'bg-blue-50 text-blue-800 ring-1 ring-blue-100';
    case 'card_on_delivery':
      return 'bg-teal-50 text-teal-800 ring-1 ring-teal-100';
    case 'jazzcash':
      return 'bg-red-50 text-red-800 ring-1 ring-red-100';
    case 'raast':
      return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100';
    default:
      return 'bg-gray-50 text-gray-700 ring-1 ring-gray-100';
  }
}

const PaymentsPage = () => {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [highlightPaymentId, setHighlightPaymentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
  const [filterChannel, setFilterChannel] = useState<AlfalahGatewayChannel>('all');
  const [dateRange, setDateRange] = useState<OrderDateRange>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load payment transactions.');
      const mapped = ((data.data as Record<string, unknown>[]) ?? []).map(mapOrderToTransaction);
      setTransactions(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load payment transactions.';
      setFetchError(message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const pid = searchParams.get('paymentId');
    if (pid) {
      setSearchTerm(pid);
      setHighlightPaymentId(pid);
    }
  }, [searchParams]);

  const filteredTransactions = useMemo(() => {
    const phrase = searchTerm.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesSearch =
        !phrase ||
        tx.id.toLowerCase().includes(phrase) ||
        tx.paymentId.toLowerCase().includes(phrase) ||
        tx.transactionId.toLowerCase().includes(phrase) ||
        tx.orderNumber.toLowerCase().includes(phrase) ||
        tx.customerName.toLowerCase().includes(phrase) ||
        tx.customerEmail.toLowerCase().includes(phrase) ||
        tx.orderSummary.toLowerCase().includes(phrase) ||
        gatewayDisplayLabel(tx).toLowerCase().includes(phrase);

      const matchesStatus = filterStatus === 'all' || tx.paymentStatus === filterStatus;
      const matchesChannel = filterChannel === 'all' || tx.gatewayChannel === filterChannel;
      const matchesDate = isOrderInDateRange(tx.paidAt ?? tx.createdAt, dateRange);

      return matchesSearch && matchesStatus && matchesChannel && matchesDate;
    });
  }, [transactions, searchTerm, filterStatus, filterChannel, dateRange]);

  const paidTransactions = filteredTransactions.filter((tx) => tx.paymentStatus === 'paid');
  const totalCollected = paidTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const channelCounts = useMemo(() => {
    const counts: Record<AlfalahGatewayChannel, number> = {
      all: 0,
      alfa_wallet: 0,
      bank_account: 0,
      card: 0,
      card_on_delivery: 0,
      jazzcash: 0,
      raast: 0,
      other: 0,
    };
    for (const tx of filteredTransactions) {
      counts[tx.gatewayChannel] += 1;
    }
    return counts;
  }, [filteredTransactions]);

  useEffect(() => {
    if (!highlightPaymentId || loading) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(`payment-row-${highlightPaymentId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    return () => clearTimeout(t);
  }, [highlightPaymentId, loading, transactions]);

  const handleViewDetails = (tx: PaymentTransaction) => {
    setSelectedTransaction(tx);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#0F4C69]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Payment Gateway</h1>
            <p className="text-gray-600">
              Successful Bank Alfalah APG payments only. Failed or incomplete checkouts are not listed here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchTransactions()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-[#0F4C69]/35 hover:bg-[#0F4C69]/5 hover:text-[#0F4C69]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Gateway status */}
        <div
          className={`mb-6 rounded-xl border p-5 ${
            CHECKOUT_ENABLED
              ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white'
              : 'border-amber-200 bg-gradient-to-r from-amber-50 to-white'
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  CHECKOUT_ENABLED ? 'bg-emerald-100' : 'bg-amber-100'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    CHECKOUT_ENABLED ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Bank Alfalah APG
                  <span
                    className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      CHECKOUT_ENABLED
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {CHECKOUT_ENABLED ? 'Live' : 'Coming soon'}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {CHECKOUT_ENABLED
                    ? 'Customers pay on Alfalah’s hosted page. The method they choose is saved on each order after payment.'
                    : 'Checkout is in preview mode. Alfalah payment methods appear here once customers place orders.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {GATEWAY_CHANNELS.map((channel) => (
                <span
                  key={channel.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
                >
                  <span className="font-semibold">{channel.label}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{channel.hint}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border-l-4 border-[#0F4C69] bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Total collected</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {paidTransactions.length > 0 ? formatMoney(totalCollected) : '—'}
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Successful payments</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{paidTransactions.length}</p>
          </div>
          <div className="rounded-lg border-l-4 border-slate-400 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Refunded</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {filteredTransactions.filter((tx) => tx.paymentStatus === 'refunded').length}
            </p>
          </div>
        </div>

        {/* Gateway channel breakdown */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {GATEWAY_CHANNELS.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => setFilterChannel((prev) => (prev === channel.id ? 'all' : channel.id))}
              className={`rounded-lg border p-4 text-left transition-colors ${
                filterChannel === channel.id
                  ? 'border-[#0F4C69] bg-[#0F4C69]/5 ring-2 ring-[#0F4C69]/20'
                  : 'border-gray-200 bg-white hover:border-[#0F4C69]/25'
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{channel.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{channelCounts[channel.id]}</p>
              <p className="mt-0.5 text-xs text-gray-500">{channel.hint}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Transaction ID, order, customer, gateway..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#0F4C69]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as OrderDateRange)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#0F4C69]"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="recent">Last 3 days</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Payment status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | PaymentStatus)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#0F4C69]"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Gateway</label>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value as AlfalahGatewayChannel)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#0F4C69]"
              >
                <option value="all">All gateways</option>
                {GATEWAY_CHANNELS.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gateway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Paid at
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.orderId}
                    id={`payment-row-${tx.id}`}
                    className={`hover:bg-gray-50 ${
                      highlightPaymentId === tx.id || highlightPaymentId === tx.paymentId
                        ? 'bg-amber-50 ring-2 ring-inset ring-amber-300'
                        : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-mono text-sm font-medium text-gray-900">
                        {displayText(tx.transactionId)}
                      </div>
                      {tx.paymentId && tx.paymentId !== tx.transactionId && (
                        <div className="text-xs text-gray-500">{tx.paymentId}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{tx.orderNumber}</div>
                      <div className="max-w-[12rem] truncate text-xs text-gray-500" title={tx.orderSummary}>
                        {tx.orderSummary}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{tx.customerName}</div>
                      <div className="text-xs text-gray-500">{tx.customerEmail}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getChannelStyles(tx.gatewayChannel)}`}
                      >
                        {gatewayDisplayLabel(tx)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{formatMoney(tx.amount)}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(tx.paymentStatus)}`}
                      >
                        {getStatusLabel(tx.paymentStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatOrderDateTime(tx.paidAt ?? tx.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(tx)}
                          className={adminIconActionBtn}
                          title="View transaction"
                          aria-label="View transaction details"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <Link
                          href={orderManagementHref(tx.orderNumber)}
                          className={adminIconActionBtn}
                          title="View order"
                          aria-label="View order details"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No transactions yet</h3>
            <p className="mx-auto max-w-md text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterChannel !== 'all' || dateRange !== 'all'
                ? 'No transactions match your current filters. Try adjusting search or filters.'
                : 'Payment records will appear here when customers complete checkout through the gateway.'}
            </p>
          </div>
        )}

        {/* Transaction details modal */}
        {showDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Transaction details</h3>
                <p className="mt-1 text-sm text-gray-500">Gateway settlement record for this order</p>
              </div>

              <div className="max-h-[70vh] space-y-0 overflow-y-auto px-6 py-4">
                <DetailRow label="Transaction ID" value={displayText(selectedTransaction.transactionId)} mono />
                <DetailRow label="Payment ID" value={displayText(selectedTransaction.paymentId)} mono />
                <DetailRow label="Order number" value={selectedTransaction.orderNumber} />
                <DetailRow label="Customer" value={selectedTransaction.customerName} />
                <DetailRow label="Email" value={selectedTransaction.customerEmail} />
                <DetailRow label="Phone" value={displayText(selectedTransaction.customerPhone)} />
                <DetailRow label="Order summary" value={selectedTransaction.orderSummary} />
                <DetailRow label="Items" value={quantityLabel([{ quantity: selectedTransaction.itemCount }])} />
                <DetailRow label="Amount" value={formatMoney(selectedTransaction.amount)} bold />
                <DetailRow label="Gateway" value={gatewayDisplayLabel(selectedTransaction)} />
                <DetailRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(selectedTransaction.paymentStatus)}`}
                    >
                      {getStatusLabel(selectedTransaction.paymentStatus)}
                    </span>
                  }
                />
                <DetailRow label="Created" value={formatOrderDateTime(selectedTransaction.createdAt)} />
                {selectedTransaction.paidAt && (
                  <DetailRow label="Paid at" value={formatOrderDateTime(selectedTransaction.paidAt)} />
                )}
                {selectedTransaction.failedReason && (
                  <div className="border-b py-3">
                    <p className="mb-1 text-sm font-medium text-gray-600">Failure reason</p>
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {selectedTransaction.failedReason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <Link
                  href={orderManagementHref(selectedTransaction.orderNumber)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View order
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="rounded-lg bg-[#0F4C69] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0d3f59]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

function DetailRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3">
      <span className="shrink-0 text-sm font-medium text-gray-600">{label}</span>
      <span
        className={`text-right text-sm text-gray-900 ${mono ? 'font-mono text-xs' : ''} ${bold ? 'font-semibold' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

export default PaymentsPage;
