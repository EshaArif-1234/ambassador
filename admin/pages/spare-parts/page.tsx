'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SparePartModal, { SparePartFormData, SparePartSavePayload } from '@/components/spare-parts/SparePartModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PageLoader from '@/components/ui/PageLoader';
import { adminIconActionBtn, adminIconActionBtnDanger } from '@/admin/lib/adminTableActionStyles';

interface SparePartRow {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  images?: string[];
}

const PAGE_SIZE = 10;

function displayPrice(row: SparePartRow) {
  const v = row.price != null && row.price > 0 ? row.price : row.originalPrice;
  return `PKR ${Number(v).toLocaleString()}`;
}

export default function SparePartsAdminPage() {
  const [rows, setRows] = useState<SparePartRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selected, setSelected] = useState<SparePartRow | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SparePartRow | null>(null);
  const fetchSeq = useRef(0);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const fetchRows = useCallback(async (p = 1, options?: { silent?: boolean }) => {
    const seq = ++fetchSeq.current;
    if (!options?.silent) {
      setLoading(true);
      setError('');
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (search.trim()) params.set('search', search.trim());
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/admin/spareparts?${params}`, {
        credentials: 'include',
        signal: controller.signal,
        cache: 'no-store',
      });

      let data: {
        success?: boolean;
        message?: string;
        data?: SparePartRow[];
        total?: number;
        totalPages?: number;
      } = {};

      try {
        data = await res.json();
      } catch {
        throw new Error(`Could not load spare parts (${res.status}).`);
      }

      if (seq !== fetchSeq.current) return;

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Could not load spare parts (${res.status}).`);
      }

      setRows(Array.isArray(data.data) ? data.data : []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      if (seq !== fetchSeq.current) return;
      const msg =
        err instanceof DOMException && err.name === 'AbortError'
          ? 'Loading spare parts timed out. Refresh the page and try again.'
          : (err as Error).message || 'Failed to load spare parts.';
      showError(msg);
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      clearTimeout(timeout);
      if (seq === fetchSeq.current && !options?.silent) setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  useEffect(() => {
    fetchRows(page);
  }, [page, fetchRows]);

  const openAdd = () => {
    setModalMode('add');
    setSelected(null);
    setModalOpen(true);
  };

  const openView = async (row: SparePartRow) => {
    setModalMode('view');
    setSelected(row);
    try {
      const res = await fetch(`/api/admin/spareparts/${row._id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setSelected(data.data);
      setModalOpen(true);
    } catch {
      showError('Failed to load spare part.');
    }
  };

  const openEdit = async (row: SparePartRow) => {
    setModalMode('edit');
    setSelected(row);
    try {
      const res = await fetch(`/api/admin/spareparts/${row._id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setSelected(data.data);
      setModalOpen(true);
    } catch {
      showError('Failed to load spare part.');
    }
  };

  const handleSave = async (payload: SparePartSavePayload) => {
    const isAdd = modalMode === 'add';
    const url = isAdd ? '/api/admin/spareparts' : `/api/admin/spareparts/${selected?._id}`;
    if (!isAdd && !selected?._id) {
      throw new Error('No spare part selected.');
    }

    const isFormData = payload instanceof FormData;
    const res = await fetch(url, {
      method: isAdd ? 'POST' : 'PATCH',
      credentials: 'include',
      ...(isFormData
        ? { body: payload }
        : {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }),
    });

    let data: { success?: boolean; message?: string; data?: SparePartRow } = {};
    try {
      data = await res.json();
    } catch {
      throw new Error(`Save failed (${res.status}). Please try again.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Save failed.');
    }

    showSuccess(isAdd ? 'Spare part created.' : 'Spare part updated.');

    if (isAdd && data.data) {
      setRows((prev) => [data.data!, ...prev]);
      setTotal((t) => t + 1);
    } else if (!isAdd && data.data) {
      setRows((prev) => prev.map((row) => (row._id === data.data!._id ? { ...row, ...data.data! } : row)));
    } else {
      void fetchRows(page, { silent: true });
    }
  };

  const handleToggleStatus = async (row: SparePartRow) => {
    setActionLoading(row._id);
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/spareparts/${row._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update status.');
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, status: newStatus } : r)));
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      const res = await fetch(`/api/admin/spareparts/${deleteTarget._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSuccess('Spare part deleted.');
      fetchRows(page);
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const inputCls = (err?: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30 ${
      err ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Spare Parts Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage spare parts shown on the public spare parts page.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F4C69] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0d3f59]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Spare Part
          </button>
        </div>

        {successMsg && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{successMsg}</div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="search"
              placeholder="Search spare parts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls()}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#0F4C69]/30"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <PageLoader message="Loading spare parts…" />
          ) : rows.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-gray-500">No spare parts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row._id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          {row.images?.[0] ? (
                            <Image src={row.images[0]} alt="" fill className="object-cover" sizes="44px" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="text-xs text-gray-400">{row.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{displayPrice(row)}</td>
                      <td className="px-4 py-3 text-sm">{row.stock}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.status === 'active'}
                          aria-label={row.status === 'active' ? 'Set inactive' : 'Set active'}
                          onClick={() => handleToggleStatus(row)}
                          disabled={actionLoading === row._id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                            row.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              row.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            title="View spare part"
                            aria-label="View spare part"
                            onClick={() => openView(row)}
                            className={adminIconActionBtn}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Edit spare part"
                            aria-label="Edit spare part"
                            onClick={() => openEdit(row)}
                            className={adminIconActionBtn}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Delete spare part"
                            aria-label="Delete spare part"
                            disabled={actionLoading === row._id}
                            onClick={() => setDeleteTarget(row)}
                            className={adminIconActionBtnDanger}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Previous</button>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}

        <SparePartModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          sparePart={selected}
          onSave={modalMode === 'view' ? undefined : handleSave}
        />

        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete spare part?"
          message={`Delete "${deleteTarget?.name ?? 'this item'}"? This cannot be undone.`}
          confirmText="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}
