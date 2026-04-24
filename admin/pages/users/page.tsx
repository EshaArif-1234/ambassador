'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isDisabled: boolean;
  disableReason?: string;
  disableDescription?: string;
  lastLoginAt?: string;
  createdAt: string;
}

const UsersPage = () => {
  const [users, setUsers]               = useState<AdminUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError]               = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const successTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filters
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRole, setFilterRole]     = useState<'all' | 'admin' | 'user'>('all');

  // Modals
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [userToDelete, setUserToDelete]         = useState<AdminUser | null>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [userToDisable, setUserToDisable]       = useState<AdminUser | null>(null);
  const [disableReason, setDisableReason]       = useState('');
  const [disableDescription, setDisableDescription] = useState('');
  const [showViewModal, setShowViewModal]       = useState(false);
  const [userToView, setUserToView]             = useState<AdminUser | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm)              params.set('search', searchTerm);
      if (filterRole !== 'all')    params.set('role', filterRole);
      if (filterStatus !== 'all')  params.set('status', filterStatus);

      const res  = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch users.');
      setUsers(data.data.users);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(userToDelete._id);
    try {
      const res  = await fetch(`/api/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ── Disable / Enable ────────────────────────────────────────────────────────
  const confirmDisableUser = async () => {
    if (!userToDisable || !disableReason) return;
    setActionLoading(userToDisable._id);
    try {
      const res  = await fetch(`/api/admin/users/${userToDisable._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisabled: true, disableReason, disableDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Directly patch the affected fields so the status badge and button
      // toggle instantly without relying on the API response shape
      setUsers(prev => prev.map(u =>
        u._id === userToDisable._id
          ? { ...u, isDisabled: true, disableReason, disableDescription }
          : u
      ));
      showSuccess(`${userToDisable.fullName} has been disabled and notified by email.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
      setShowDisableModal(false);
      setUserToDisable(null);
      setDisableReason('');
      setDisableDescription('');
    }
  };

  const handleEnableUser = async (user: AdminUser) => {
    setActionLoading(user._id);
    try {
      const res  = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisabled: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Directly clear the disabled fields so the status badge and button
      // toggle instantly
      setUsers(prev => prev.map(u =>
        u._id === user._id
          ? { ...u, isDisabled: false, disableReason: '', disableDescription: '' }
          : u
      ));
      showSuccess(`${user.fullName}'s account has been re-enabled.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const REASON_LABELS: Record<string, string> = {
    policy_violation: 'Policy Violation',
    security_concern: 'Security Concern',
    inactivity:       'Inactivity',
    account_issue:    'Account Issue',
    other:            'Other',
  };

  const getRoleBadgeColor = (role: string) =>
    role === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';

  const getStatusBadgeColor = (isDisabled: boolean) =>
    isDisabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800';

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E36630]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} total user{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
            <svg className="w-4 h-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMsg}
            <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Name, email or phone..."
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36630] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36630] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value as typeof filterRole)}
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36630] focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['User', 'Phone', 'Role', 'Account', 'Verified', 'Last Login', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">

                    {/* Avatar + Name */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F4C69] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials(user.fullName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.phoneNumber || '—'}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Account status — Enabled / Disabled */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${user.isDisabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isDisabled ? 'bg-red-500' : 'bg-green-500'}`} />
                        {user.isDisabled ? 'Disabled' : 'Enabled'}
                      </span>
                    </td>

                    {/* Email verification */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${user.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">

                        {/* View */}
                        <button
                          onClick={() => { setUserToView(user); setShowViewModal(true); }}
                          className="px-3 py-1.5 text-xs font-medium bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] transition-colors"
                        >
                          View
                        </button>

                        {/* Disable / Enable */}
                        {user.role !== 'admin' && (
                          actionLoading === user._id ? (
                            <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-400 rounded-lg">
                              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                              Loading...
                            </div>
                          ) : user.isDisabled ? (
                            <button
                              onClick={() => handleEnableUser(user)}
                              className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Enable
                            </button>
                          ) : (
                            <button
                              onClick={() => { setUserToDisable(user); setDisableReason(''); setDisableDescription(''); setShowDisableModal(true); }}
                              className="px-3 py-1.5 text-xs font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              Disable
                            </button>
                          )
                        )}

                        {/* Delete */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}
                            className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {users.length === 0 && !loading && (
            <div className="text-center py-16">
              <svg className="w-14 h-14 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500 text-sm">No users found</p>
            </div>
          )}
        </div>

        {/* ── Modals ── */}

        {/* Delete */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}
          onConfirm={confirmDeleteUser}
          title="Delete User"
          message={`Are you sure you want to permanently delete "${userToDelete?.fullName}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />

        {/* Disable Modal */}
        {showDisableModal && userToDisable && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

              {/* Modal Header */}
              <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Disable User Account</h3>
                  <p className="text-xs text-gray-500 mt-0.5">This action will block login access immediately</p>
                </div>
                <button
                  onClick={() => { setShowDisableModal(false); setDisableReason(''); setDisableDescription(''); }}
                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">

                {/* User info card */}
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F4C69] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initials(userToDisable.fullName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{userToDisable.fullName}</p>
                    <p className="text-xs text-gray-500">{userToDisable.email}</p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Reason for Disabling <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={disableReason}
                    onChange={e => { setDisableReason(e.target.value); setDisableDescription(''); }}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors ${
                      disableReason ? 'border-yellow-400 bg-yellow-50/40' : 'border-gray-300'
                    }`}
                  >
                    <option value="">— Select a reason —</option>
                    <option value="policy_violation">Policy Violation</option>
                    <option value="security_concern">Security Concern</option>
                    <option value="inactivity">Inactivity</option>
                    <option value="account_issue">Account Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message — always visible once reason is picked */}
                {disableReason && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Additional Message
                      {disableReason === 'other' && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-gray-400 font-normal ml-1">(sent to user via email)</span>
                    </label>
                    <textarea
                      value={disableDescription}
                      onChange={e => setDisableDescription(e.target.value)}
                      rows={3}
                      placeholder={
                        disableReason === 'policy_violation' ? 'e.g. Your account violated our terms of service regarding...' :
                        disableReason === 'security_concern' ? 'e.g. We detected suspicious login activity on your account...' :
                        disableReason === 'inactivity'       ? 'e.g. Your account has been inactive for more than 6 months...' :
                        disableReason === 'account_issue'    ? 'e.g. There is an issue with your account that requires review...' :
                        'Please describe the reason for disabling this account...'
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {disableDescription.length}/500 characters
                    </p>
                  </div>
                )}

                {/* Email preview notice */}
                {disableReason && (
                  <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-blue-800">Email will be sent to {userToDisable.email}</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        The user will be notified with reason: <strong>{REASON_LABELS[disableReason]}</strong>
                        {disableDescription && ' and your additional message'}.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => { setShowDisableModal(false); setDisableReason(''); setDisableDescription(''); }}
                  className="px-5 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDisableUser}
                  disabled={!disableReason || (disableReason === 'other' && !disableDescription.trim()) || actionLoading === userToDisable._id}
                  className="px-5 py-2 text-sm font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {actionLoading === userToDisable._id ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Disable & Notify User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View */}
        {showViewModal && userToView && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-[#0F4C69] flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {initials(userToView.fullName)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{userToView.fullName}</h3>
                  <p className="text-sm text-gray-500">{userToView.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: 'Phone',       value: userToView.phoneNumber || '—' },
                  { label: 'Address',     value: userToView.address || '—' },
                  { label: 'Role',        value: userToView.role },
                  { label: 'Status',      value: userToView.isDisabled ? 'Disabled' : 'Active' },
                  { label: 'Verified',    value: userToView.isVerified ? 'Yes' : 'No' },
                  { label: 'Last Login',  value: userToView.lastLoginAt ? new Date(userToView.lastLoginAt).toLocaleString() : 'Never' },
                  { label: 'Joined',      value: new Date(userToView.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="text-gray-900 capitalize">{value}</span>
                  </div>
                ))}

                {userToView.disableReason && (
                  <div className="py-2">
                    <span className="text-gray-500 font-medium">Disable Reason:</span>
                    <p className="text-gray-900 capitalize mt-1">{userToView.disableReason.replace('_', ' ')}</p>
                    {userToView.disableDescription && (
                      <p className="text-gray-600 mt-1 text-xs">{userToView.disableDescription}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-5">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
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

export default UsersPage;
