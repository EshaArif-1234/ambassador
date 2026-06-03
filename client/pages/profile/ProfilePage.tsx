'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import AccountLayout from '@/components/account/AccountLayout';
import AccountPageLoader from '@/components/account/AccountPageLoader';
import { authApi } from '@/utils/auth.api';
import { SHIPPING_CITIES } from '@/utils/userAddress.util';
import Link from 'next/link';
import { fetchAuthedJson } from '@/utils/fetchAuthed.util';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface RecentOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  items: { productName: string; productImage?: string }[];
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useUser();

  // ── Personal info edit state ──
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal]   = useState(false);
  const [personal, setPersonal] = useState({
    fullName:    user?.name        ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  });

  // ── Address edit state ──
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress]   = useState(false);
  const [addressCity, setAddressCity]         = useState(user?.city ?? '');
  const [address, setAddress]               = useState(user?.address ?? '');

  // ── Recent orders ──
  const [orders, setOrders]               = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError]     = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setOrdersLoading(false);
      setOrdersError(null);
      return;
    }
    setOrdersLoading(true);
    setOrdersError(null);
    fetchAuthedJson<{ success?: boolean; data?: RecentOrder[]; message?: string }>('/api/orders')
      .then(({ ok, status, body }) => {
        if (ok && body.success) {
          setOrders(
            (body.data ?? []).slice(0, 5).map((o) => ({
              ...o,
              status: (o.status ?? 'pending') as OrderStatus,
            }))
          );
          return;
        }
        if (status === 401) {
          setOrdersError('Session expired. Please log in again.');
        } else {
          setOrdersError(body.message ?? 'Could not load recent orders.');
        }
        setOrders([]);
      })
      .catch(() => {
        setOrdersError('Could not load recent orders. Check your connection and try again.');
        setOrders([]);
      })
      .finally(() => setOrdersLoading(false));
  }, [user, isLoading]);

  if (isLoading) {
    return <AccountPageLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <Link href="/login" className="px-6 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a]">Login</Link>
        </div>
      </div>
    );
  }

  const flash = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const savePersonal = async () => {
    if (!personal.fullName.trim()) { flash('error', 'Name cannot be empty.'); return; }
    setSavingPersonal(true);
    try {
      const res = await authApi.updateProfile({
        fullName: personal.fullName.trim(),
        phoneNumber: personal.phoneNumber.trim(),
      });
      const u = res.data!.user;
      updateUser({ name: u.fullName, fullName: u.fullName, phoneNumber: u.phoneNumber, initials: u.fullName.substring(0, 2).toUpperCase() });
      setEditingPersonal(false);
      flash('success', 'Personal information updated.');
    } catch (err) {
      flash('error', (err as Error).message);
    } finally {
      setSavingPersonal(false);
    }
  };

  const saveAddress = async () => {
    setSavingAddress(true);
    try {
      const res = await authApi.updateProfile({
        city: addressCity.trim(),
        address: address.trim(),
      });
      updateUser({ city: res.data!.user.city, address: res.data!.user.address });
      setEditingAddress(false);
      flash('success', 'Address updated.');
    } catch (err) {
      flash('error', (err as Error).message);
    } finally {
      setSavingAddress(false);
    }
  };

  const maskedEmail = (() => {
    const [name, domain] = user.email.split('@');
    if (!domain) return user.email;
    const visible = name.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
  })();

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">Manage My Account</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update your personal information and addresses</p>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {feedback.type === 'success' ? '✓' : '⚠'} {feedback.msg}
          </div>
        )}

        {/* ── Three cards in one row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Personal Profile */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#0F4C69]">Personal Profile</h2>
              {!editingPersonal && (
                <button
                  onClick={() => { setPersonal({ fullName: user.name, phoneNumber: user.phoneNumber ?? '' }); setEditingPersonal(true); }}
                  className="text-xs font-semibold text-[#E36630] hover:underline uppercase tracking-wide"
                >
                  Edit
                </button>
              )}
            </div>

            {editingPersonal ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={personal.fullName}
                    onChange={e => setPersonal(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={personal.phoneNumber}
                    onChange={e => setPersonal(p => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="+92 300 0000000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={savePersonal}
                    disabled={savingPersonal}
                    className="px-5 py-2.5 bg-[#E36630] text-white text-sm font-medium rounded-xl hover:bg-[#cc5a2a] disabled:opacity-60 transition-colors"
                  >
                    {savingPersonal ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingPersonal(false)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 break-all">{maskedEmail}</p>
                {user.phoneNumber && <p className="text-sm text-gray-500">{user.phoneNumber}</p>}
              </div>
            )}

            {/* Password */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-800 mb-2">Password</p>
              <Link
                href="/change-password"
                className="inline-block px-4 py-2 border border-[#0F4C69] text-[#0F4C69] text-sm font-medium rounded-xl hover:bg-[#0F4C69] hover:text-white transition-colors"
              >
                Change Password
              </Link>
            </div>
          </div>

          {/* Address Book — Default Shipping */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#0F4C69]">Address Book</h2>
              {!editingAddress && (
                <button
                  onClick={() => {
                    setAddressCity(user.city ?? '');
                    setAddress(user.address ?? '');
                    setEditingAddress(true);
                  }}
                  className="text-xs font-semibold text-[#E36630] hover:underline uppercase tracking-wide"
                >
                  Edit
                </button>
              )}
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Default Shipping Address</p>

            {editingAddress ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                  <select
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/20"
                  >
                    <option value="">Select city</option>
                    {SHIPPING_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={4}
                  placeholder="Area, street, house / building details"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/20 resize-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveAddress}
                    disabled={savingAddress}
                    className="px-5 py-2 bg-[#E36630] text-white text-sm font-medium rounded-xl hover:bg-[#cc5a2a] disabled:opacity-60 transition-colors"
                  >
                    {savingAddress ? 'Saving…' : 'Save Address'}
                  </button>
                  <button
                    onClick={() => setEditingAddress(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : user.address || user.city ? (
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">{user.name}</p>
                {user.city && <p className="text-sm text-gray-600">{user.city}</p>}
                {user.address && (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{user.address}</p>
                )}
                {user.phoneNumber && <p className="text-sm text-gray-600 mt-1">{user.phoneNumber}</p>}
              </div>
            ) : (
              <div className="py-4">
                <p className="text-sm text-gray-400">No address saved yet.</p>
                <button
                  onClick={() => { setAddressCity(''); setAddress(''); setEditingAddress(true); }}
                  className="mt-2 text-sm font-medium text-[#E36630] hover:underline"
                >
                  + Add Address
                </button>
              </div>
            )}
          </div>

          {/* Default Billing Address */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-6 h-full">
            <h2 className="text-base font-semibold text-[#0F4C69] mb-4">Billing Address</h2>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Default Billing Address</p>

            {user.address || user.city ? (
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">{user.name}</p>
                {user.city && <p className="text-sm text-gray-600">{user.city}</p>}
                {user.address && (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{user.address}</p>
                )}
                {user.phoneNumber && <p className="text-sm text-gray-600 mt-1">{user.phoneNumber}</p>}
                <p className="mt-3 text-xs text-gray-400">Same as your default shipping address.</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4">No billing address saved yet.</p>
            )}
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-sm font-medium text-[#0F4C69] hover:text-[#E36630] transition-colors">
              View All
            </Link>
          </div>

          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : ordersError ? (
            <div className="py-14 text-center px-6">
              <p className="text-sm text-red-600">{ordersError}</p>
              {ordersError.includes('log in') && (
                <Link href="/login" className="mt-3 inline-block text-sm font-medium text-[#0F4C69] hover:underline">
                  Go to login
                </Link>
              )}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-gray-500">You have no orders yet.</p>
              <Link href="/products" className="mt-3 inline-block px-5 py-2 bg-[#E36630] text-white text-sm rounded-xl hover:bg-[#cc5a2a] transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order #', 'Status', 'Items', 'Total', ''].map((h, i) => (
                      <th key={i} className={`px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 3 ? 'text-right' : i === 4 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-800">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-500' :
                              order.status === 'cancelled' ? 'bg-red-500' :
                              order.status === 'shipped' ? 'bg-indigo-500' :
                              order.status === 'processing' ? 'bg-purple-500' :
                              order.status === 'confirmed' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                          />
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shrink-0">
                              {item.productImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right whitespace-nowrap">
                        Rs. {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/orders/${order._id}`}
                          prefetch={false}
                          className="inline-block text-sm font-semibold text-[#0F4C69] hover:text-[#E36630] uppercase tracking-wide transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AccountLayout>
  );
}
