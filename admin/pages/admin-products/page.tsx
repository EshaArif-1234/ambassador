'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductModal, { ProductFormData } from '@/components/products/ProductModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  slug: string;
  categories: Array<{ _id: string; title: string } | string>;
  price: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  about: string;
  images: string[];
  imagePublicIds: string[];
  videos: string[];
  videoPublicIds: string[];
  specifications: Record<string, string>;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

interface Category { _id: string; title: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTitle = (v: any): string => (v && typeof v === 'object' && v.title) ? v.title : String(v || '—');

const taxonomyList = (p: Product) => {
  const arr = p.categories;
  if (Array.isArray(arr) && arr.length) return arr;
  const one = (p as unknown as Record<string, unknown>).category;
  return one ? [one] : [];
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProductsPage = () => {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterCat,   setFilterCat]   = useState('all');
  const [filterStatus,setFilterStatus]= useState('all');
  const [successMsg,  setSuccessMsg]  = useState('');
  const [error,       setError]       = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal
  const [modalMode,      setModalMode]      = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Auto-clear banners ──
  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
  const showError   = (msg: string) => { setError(msg);      setTimeout(() => setError(''),      5000); };

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products',  { credentials: 'include' }),
        fetch('/api/admin/categories',{ credentials: 'include' }),
      ]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
      if (pData.success) setProducts(pData.data);
      if (cData.success) setCategories(cData.data);
    } catch {
      showError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleSave = async (data: ProductFormData) => {
    const isEdit = modalMode === 'edit' && selectedProduct;
    const url    = isEdit ? `/api/admin/products/${selectedProduct!._id}` : '/api/admin/products';
    const method = isEdit ? 'PATCH' : 'POST';

    const res  = await fetch(url, {
      method, credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');

    if (isEdit) {
      setProducts(prev => prev.map(p => p._id === selectedProduct!._id ? json.data : p));
      showSuccess('Product updated successfully.');
    } else {
      setProducts(prev => [json.data, ...prev]);
      showSuccess('Product created successfully.');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    setActionLoading(product._id);
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const res  = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, status: newStatus } : p));
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res  = await fetch(`/api/admin/products/${deleteTarget._id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
      showSuccess('Product deleted successfully.');
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat =
      filterCat === 'all' ||
      taxonomyList(p).some(
        c => (typeof c === 'object' && c && '_id' in c ? c._id : c) === filterCat
      );
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your kitchen product catalogue</p>
          </div>
          <button
            onClick={() => { setSelectedProduct(null); setModalMode('add'); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F4C69] text-white text-sm font-medium rounded-lg hover:bg-[#0d3f59] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
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
              <input type="text" placeholder="Search products…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30 focus:border-[#0F4C69]" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="w-full md:w-52 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full md:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Products</h2>
            <span className="text-xs text-gray-400 font-medium">{filtered.length} total</span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#0F4C69] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
              </svg>
              <p className="text-sm text-gray-400">No products found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-left">Categories</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Stock</th>
                    <th className="px-6 py-3 text-left">Rating</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Toggle</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(product => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">

                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{product.name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[180px]">{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {taxonomyList(product).map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {getTitle(c)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">PKR {Number(product.price ?? product.originalPrice).toLocaleString()}</p>
                        {product.originalPrice > product.price && (
                          <p className="text-xs text-gray-400 line-through">PKR {Number(product.originalPrice).toLocaleString()}</p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span className={Number(product.stock) === 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {product.stock} {Number(product.stock) === 0 ? '(Out)' : 'units'}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.reviewCount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.avgRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{product.avgRating}</span>
                            <span className="text-xs text-gray-400">({product.reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No reviews</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.status}
                        </span>
                      </td>

                      {/* Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          disabled={actionLoading === product._id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                            product.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            product.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedProduct(product); setModalMode('view'); }}
                            className="px-3 py-1.5 text-xs font-medium bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] transition-colors"
                          >View</button>
                          <button
                            onClick={() => { setSelectedProduct(product); setModalMode('edit'); }}
                            className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                          >Edit</button>
                          <button
                            onClick={() => { setDeleteTarget(product); setShowDeleteModal(true); }}
                            className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >Delete</button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {modalMode && modalMode !== null && (
          <ProductModal
            key={`${modalMode}-${selectedProduct?._id ?? 'new'}`}
            isOpen
            onClose={() => { setModalMode(null); setSelectedProduct(null); }}
            mode={modalMode}
            product={selectedProduct ?? undefined}
            onSave={modalMode !== 'view' ? handleSave : undefined}
          />
        )}

        {/* Delete confirm */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget?.name || 'this product'}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />

      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
