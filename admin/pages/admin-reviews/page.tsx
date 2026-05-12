'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { adminIconActionBtn, adminIconActionBtnDanger } from '@/admin/lib/adminTableActionStyles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  _id: string;
  productId: { _id: string; name: string; images: string[]; slug: string } | null;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

interface Product { _id: string; name: string; images: string[]; }

// ─── Star renderer ────────────────────────────────────────────────────────────

const Stars = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const cls = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`${cls} ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const statusCls: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending:  'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-700',
};


const ReviewsPage = () => {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [error,      setError]      = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [search,     setSearch]     = useState('');
  const [filterProd, setFilterProd] = useState('all');
  const [filterStar, setFilterStar] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [deleteTarget,    setDeleteTarget]    = useState<Review | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewReview, setViewReview] = useState<Review | null>(null);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({
    reviewerName: '',
    reviewerEmail: '',
    rating: 5,
    comment: '',
    status: 'approved' as Review['status'],
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Add form
  const [addForm, setAddForm] = useState({
    productId: '',
    reviewerName: '',
    reviewerEmail: '',
    rating: 5,
    comment: '',
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addSaving, setAddSaving] = useState(false);

  // ── Banners ──
  const showSuccess = (m: string) => { setSuccessMsg(m); setTimeout(() => setSuccessMsg(''), 4000); };
  const showError   = (m: string) => { setError(m);      setTimeout(() => setError(''),      5000); };

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search       && search !== '')       params.set('search',    search);
      if (filterProd   && filterProd !== 'all') params.set('productId', filterProd);
      if (filterStar   && filterStar !== 'all') params.set('rating',    filterStar);
      if (filterStatus && filterStatus !== 'all') params.set('status',  filterStatus);

      const [rRes, pRes] = await Promise.all([
        fetch(`/api/admin/reviews?${params}`, { credentials: 'include' }),
        fetch('/api/admin/products',           { credentials: 'include' }),
      ]);
      const [rData, pData] = await Promise.all([rRes.json(), pRes.json()]);
      if (rData.success) setReviews(rData.data);
      if (pData.success) setProducts(pData.data);
    } catch {
      showError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [search, filterProd, filterStar, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Toggle status ──
  const toggleStatus = async (review: Review, newStatus: Review['status']) => {
    setActionLoading(review._id);
    try {
      const res  = await fetch(`/api/admin/reviews/${review._id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed.');
      const updated = data.data as Review;
      setReviews(prev => prev.map(r => (r._id === review._id ? { ...r, ...updated } : r)));
      showSuccess(`Review marked as ${newStatus}.`);
    } catch (e) {
      showError((e as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete ──
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res  = await fetch(`/api/admin/reviews/${deleteTarget._id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed.');
      setReviews(prev => prev.filter(r => r._id !== deleteTarget._id));
      showSuccess('Review deleted.');
    } catch (e) {
      showError((e as Error).message);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ── Add ──
  const validateAdd = () => {
    const e: Record<string, string> = {};
    if (!addForm.productId)            e.productId    = 'Product is required';
    if (!addForm.reviewerName.trim())   e.reviewerName = 'Reviewer name is required';
    if (addForm.rating < 1 || addForm.rating > 5) e.rating = 'Rating must be 1–5';
    setAddErrors(e);
    return Object.keys(e).length === 0;
  };

  const openEdit = (r: Review) => {
    setEditReview(r);
    setEditForm({
      reviewerName: r.reviewerName,
      reviewerEmail: r.reviewerEmail ?? '',
      rating: r.rating,
      comment: r.comment ?? '',
      status: r.status,
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const e: Record<string, string> = {};
    if (!editForm.reviewerName.trim()) e.reviewerName = 'Name is required';
    if (editForm.rating < 1 || editForm.rating > 5) e.rating = 'Rating must be 1–5';
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveEdit = async () => {
    if (!editReview || !validateEdit()) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/reviews/${editReview._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: editForm.reviewerName.trim(),
          reviewerEmail: editForm.reviewerEmail.trim(),
          rating: editForm.rating,
          comment: editForm.comment.trim(),
          status: editForm.status,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed.');
      const updated = data.data as Review;
      setReviews(prev => prev.map(r => (r._id === editReview._id ? { ...r, ...updated } : r)));
      showSuccess('Review updated.');
      setEditReview(null);
      setEditErrors({});
    } catch (err) {
      setEditErrors({ submit: (err as Error).message });
    } finally {
      setEditSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!validateAdd()) return;
    setAddSaving(true);
    try {
      const res  = await fetch('/api/admin/reviews', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not create review.');
      setReviews(prev => [data.data as Review, ...prev]);
      showSuccess('Review added successfully.');
      setShowAddModal(false);
      setAddForm({
        productId: '',
        reviewerName: '',
        reviewerEmail: '',
        rating: 5,
        comment: '',
      });
      setAddErrors({});
    } catch (e) {
      setAddErrors({ submit: (e as Error).message });
    } finally {
      setAddSaving(false);
    }
  };

  // ── Stats ──
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const avgStorefront =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length).toFixed(1)
      : '—';
  const totalReviews = reviews.length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = approvedReviews.length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage product reviews and ratings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F4C69] text-white text-sm font-medium rounded-lg hover:bg-[#0d3f59] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Review
          </button>
        </div>

        {/* Stats */}
        <p className="text-xs text-gray-500 -mt-2">
          Dropdown on the site shows <strong className="text-gray-700">approved</strong> reviews only. Figures below reflect your current filters.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(
            [
              { label: 'In this list', value: totalReviews, color: 'bg-blue-50 text-blue-700' },
              {
                label: 'Avg (approved)',
                value: avgStorefront,
                color: 'bg-amber-50 text-amber-700',
                hint: `${approvedCount} approved in list`,
              },
              { label: 'Approved', value: approvedCount, color: 'bg-green-50 text-green-700' },
              { label: 'Pending', value: pendingCount, color: 'bg-yellow-50 text-yellow-700' },
            ] as const
          ).map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 border border-current/10`}>
              <p className="text-xs font-medium opacity-70 mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
              {'hint' in s && s.hint ? (
                <p className="text-[11px] opacity-75 mt-0.5">{s.hint}</p>
              ) : null}
            </div>
          ))}
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {successMsg}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search by reviewer or comment…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30 focus:border-[#0F4C69]" />
            </div>
            <select value={filterProd} onChange={e => setFilterProd(e.target.value)}
              className="w-full md:w-52 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Products</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <select value={filterStar} onChange={e => setFilterStar(e.target.value)}
              className="w-full md:w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Ratings</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Reviews</h2>
            <span className="text-xs text-gray-400 font-medium">{reviews.length} total</span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#0F4C69] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-sm text-gray-400">No reviews found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-left">Reviewer</th>
                    <th className="px-6 py-3 text-left">Rating</th>
                    <th className="px-6 py-3 text-left">Comment</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reviews.map(review => (
                    <tr key={review._id} className="hover:bg-gray-50 transition-colors">

                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                            {review.productId?.images?.[0] ? (
                              <img src={review.productId.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 truncate max-w-[140px]">
                            {review.productId?.name ?? <span className="text-gray-400 italic">Deleted product</span>}
                          </p>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{review.reviewerName}</p>
                        {review.reviewerEmail && (
                          <p className="text-xs text-gray-400 mt-0.5">{review.reviewerEmail}</p>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Stars rating={review.rating} />
                          <span className="text-xs font-semibold text-gray-700">{Number(review.rating || 0).toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4 max-w-[220px]">
                        {review.comment ? (
                          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{review.comment}</p>
                        ) : (
                          <span className="text-gray-300 text-xs italic">No comment</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusCls[review.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {review.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex min-w-[11rem] flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              title="View full review"
                              aria-label="View full review"
                              onClick={() => setViewReview(review)}
                              className={adminIconActionBtn}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              title="Edit review"
                              aria-label="Edit review"
                              onClick={() => openEdit(review)}
                              className={adminIconActionBtn}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {review.productId?._id ? (
                              <a
                                href={`/products/${review.productId._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open product on website"
                                aria-label="Open product on website"
                                className={adminIconActionBtn}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <span
                                title="Product removed"
                                className={`${adminIconActionBtn} cursor-not-allowed opacity-40`}
                                aria-hidden
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </span>
                            )}
                            <button
                              type="button"
                              title="Delete review"
                              aria-label="Delete review"
                              onClick={() => {
                                setDeleteTarget(review);
                                setShowDeleteModal(true);
                              }}
                              className={adminIconActionBtnDanger}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label htmlFor={`review-status-${review._id}`} className="sr-only">
                              Change status
                            </label>
                            <select
                              id={`review-status-${review._id}`}
                              value={review.status}
                              disabled={actionLoading === review._id}
                              onChange={(e) => {
                                const v = e.target.value as Review['status'];
                                if (v !== review.status) void toggleStatus(review, v);
                              }}
                              className="w-full min-w-[8.5rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-800 outline-none focus:border-[#0F4C69] focus:ring-2 focus:ring-[#0F4C69]/20"
                            >
                              <option value="approved">Approved</option>
                              <option value="pending">Pending</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            {actionLoading === review._id ? (
                              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#0F4C69] border-t-transparent" />
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── View review ── */}
        {viewReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-labelledby="review-view-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 id="review-view-title" className="text-base font-semibold text-gray-900">
                    Review detail
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    As shown after moderation ({viewReview.status})
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setViewReview(null)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 px-6 py-5 text-sm">
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {viewReview.productId?.images?.[0] ? (
                      <img src={viewReview.productId.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Product</p>
                    <p className="font-medium text-gray-900 truncate">
                      {viewReview.productId?.name ?? 'Removed product'}
                    </p>
                    {viewReview.productId?._id ? (
                      <a
                        href={`/products/${viewReview.productId._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-[#0F4C69] hover:underline"
                      >
                        View on website
                      </a>
                    ) : null}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Reviewer</p>
                  <p className="font-medium text-gray-900">{viewReview.reviewerName}</p>
                  {viewReview.reviewerEmail ? (
                    <p className="text-xs text-gray-500">{viewReview.reviewerEmail}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Rating</p>
                    <div className="flex items-center gap-2">
                      <Stars rating={viewReview.rating} size="md" />
                      <span className="text-sm font-semibold text-gray-800">
                        {Number(viewReview.rating || 0).toFixed(1)} / 5
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls[viewReview.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {viewReview.status}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Comment</p>
                  <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-gray-700 leading-relaxed">
                    {viewReview.comment?.trim() ? viewReview.comment : 'No comment'}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Submitted{' '}
                  {new Date(viewReview.createdAt).toLocaleString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    openEdit(viewReview);
                    setViewReview(null);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewReview(null)}
                  className="rounded-lg bg-[#0F4C69] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3f59]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit review ── */}
        {editReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Edit review</h2>
                  <p className="text-xs text-gray-400">Updates apply immediately on the storefront for approved entries.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    setEditReview(null);
                    setEditErrors({});
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {editErrors.submit && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{editErrors.submit}</div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Product</label>
                  <p className="truncate rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                    {editReview.productId?.name ?? 'Removed product'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Reviewer name *</label>
                    <input
                      type="text"
                      value={editForm.reviewerName}
                      onChange={(e) => setEditForm((f) => ({ ...f, reviewerName: e.target.value }))}
                      className={inputCls(!!editErrors.reviewerName)}
                    />
                    {editErrors.reviewerName && (
                      <p className="mt-1 text-xs text-red-500">{editErrors.reviewerName}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                    <input
                      type="email"
                      value={editForm.reviewerEmail}
                      onChange={(e) => setEditForm((f) => ({ ...f, reviewerEmail: e.target.value }))}
                      className={inputCls(false)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-600">Rating</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setEditForm((f) => ({ ...f, rating: n }))}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`h-8 w-8 ${n <= editForm.rating ? 'text-amber-400' : 'text-gray-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-sm font-semibold text-gray-700">{editForm.rating} / 5</span>
                  </div>
                  {editErrors.rating && <p className="mt-1 text-xs text-red-500">{editErrors.rating}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Comment</label>
                  <textarea
                    rows={4}
                    value={editForm.comment}
                    onChange={(e) => setEditForm((f) => ({ ...f, comment: e.target.value }))}
                    className={inputCls(false)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Review['status'] }))}
                    className={inputCls(false)}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={() => {
                    setEditReview(null);
                    setEditErrors({});
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={() => void saveEdit()}
                  className="min-w-[120px] rounded-lg bg-[#0F4C69] px-5 py-2 text-center text-sm font-medium text-white hover:bg-[#0d3f59] disabled:opacity-60"
                >
                  {editSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Review Modal ── */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Add Review</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manually add a customer review</p>
                </div>
                <button onClick={() => { setShowAddModal(false); setAddErrors({}); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {addErrors.submit && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{addErrors.submit}</div>
                )}

                {/* Product */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product <span className="text-red-500">*</span></label>
                  <select value={addForm.productId}
                    onChange={e => setAddForm(f => ({ ...f, productId: e.target.value }))}
                    className={inputCls(!!addErrors.productId)}>
                    <option value="">— Select product —</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  {addErrors.productId && <p className="text-red-500 text-xs mt-1">{addErrors.productId}</p>}
                </div>

                {/* Reviewer Name + Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Reviewer Name <span className="text-red-500">*</span></label>
                    <input type="text" value={addForm.reviewerName}
                      onChange={e => setAddForm(f => ({ ...f, reviewerName: e.target.value }))}
                      placeholder="e.g. Ahmed Khan"
                      className={inputCls(!!addErrors.reviewerName)} />
                    {addErrors.reviewerName && <p className="text-red-500 text-xs mt-1">{addErrors.reviewerName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="email" value={addForm.reviewerEmail}
                      onChange={e => setAddForm(f => ({ ...f, reviewerEmail: e.target.value }))}
                      placeholder="ahmed@example.com"
                      className={inputCls(false)} />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Rating <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAddForm(f => ({ ...f, rating: n }))}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <svg className={`w-8 h-8 ${n <= addForm.rating ? 'text-amber-400' : 'text-gray-200'} transition-colors`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-sm font-semibold text-gray-700 ml-1">{addForm.rating} / 5</span>
                  </div>
                  {addErrors.rating && <p className="text-red-500 text-xs mt-1">{addErrors.rating}</p>}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Comment <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea rows={3} value={addForm.comment}
                    onChange={e => setAddForm(f => ({ ...f, comment: e.target.value }))}
                    placeholder="Share the customer's feedback…"
                    className={inputCls(false)} />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => { setShowAddModal(false); setAddErrors({}); }} disabled={addSaving}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={addSaving}
                  className="px-5 py-2 text-sm bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] disabled:opacity-60 min-w-[120px] text-center">
                  {addSaving ? 'Saving…' : 'Add Review'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
          onConfirm={confirmDelete}
          title="Delete Review"
          message={`Are you sure you want to delete this review by "${deleteTarget?.reviewerName || ''}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />

      </div>
    </DashboardLayout>
  );
};

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2 border rounded-lg text-sm text-gray-900 outline-none transition-shadow focus:ring-2 focus:ring-[#0F4C69]/25 focus:border-[#0F4C69] ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`;

export default ReviewsPage;
