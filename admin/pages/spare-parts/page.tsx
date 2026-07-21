'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SparePartModal, { SparePartFormData } from '@/components/spare-parts/SparePartModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PageLoader from '@/components/ui/PageLoader';
import { adminIconActionBtn, adminIconActionBtnDanger } from '@/admin/lib/adminTableActionStyles';

type Ref = { _id: string; title?: string; name?: string; slug?: string };

interface SparePartRow {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  images?: string[];
  linkedCategoryIds?: Ref[] | string[];
  linkedProductIds?: Ref[] | string[];
}

const PAGE_SIZE = 10;

function refLabels(arr: unknown, field: 'title' | 'name'): string {
  if (!Array.isArray(arr) || !arr.length) return '—';
  return arr
    .map((x) =>
      typeof x === 'object' && x && field in x ? String((x as Ref)[field]) : 'Linked',
    )
    .join(', ');
}

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
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<SparePartRow | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SparePartRow | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const fetchRows = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (search.trim()) params.set('search', search.trim());
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const res = await fetch(`/api/admin/spare-parts?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setRows(data.data);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch {
      showError('Failed to load spare parts.');
    } finally {
      setLoading(false);
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

  const openEdit = async (row: SparePartRow) => {
    setModalMode('edit');
    setSelected(row);
    try {
      const res = await fetch(`/api/admin/spare-parts/${row._id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setSelected(data.data);
      setModalOpen(true);
    } catch {
      showError('Failed to load spare part.');
    }
  };

  const handleSave = async (payload: SparePartFormData) => {
    const url = modalMode === 'add' ? '/api/admin/spare-parts' : `/api/admin/spare-parts/${selected?._id}`;
    const res = await fetch(url, {
      method: modalMode === 'add' ? 'POST' : 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Save failed.');
    showSuccess(modalMode === 'add' ? 'Spare part created.' : 'Spare part updated.');
    fetchRows(page);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      const res = await fetch(`/api/admin/spare-parts/${deleteTarget._id}`, {
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
              Create spare parts and choose where they appear — on whole categories or specific products.
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Categories</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Products</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
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
                      <td className="max-w-[10rem] truncate px-4 py-3 text-xs text-gray-700" title={refLabels(row.linkedCategoryIds, 'title')}>
                        {refLabels(row.linkedCategoryIds, 'title')}
                      </td>
                      <td className="max-w-[10rem] truncate px-4 py-3 text-xs text-gray-700" title={refLabels(row.linkedProductIds, 'name')}>
                        {refLabels(row.linkedProductIds, 'name')}
                      </td>
                      <td className="px-4 py-3 text-sm">{displayPrice(row)}</td>
                      <td className="px-4 py-3 text-sm">{row.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" className={adminIconActionBtn} onClick={() => openEdit(row)} title="Edit">✎</button>
                          <button
                            type="button"
                            className={adminIconActionBtnDanger}
                            disabled={actionLoading === row._id}
                            onClick={() => setDeleteTarget(row)}
                            title="Delete"
                          >
                            🗑
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
          onSave={handleSave}
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
