'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProductModal, { ProductFormData } from '@/components/products/ProductModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { adminIconActionBtn, adminIconActionBtnDanger } from '@/admin/lib/adminTableActionStyles';
import { downloadStockProductsPdf } from '@/utils/generateStockProductsPdf';
import { downloadStockProductsExcel } from '@/utils/generateStockProductsExcel';
import PageLoader from '@/components/ui/PageLoader';

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
  features?: string[];
  brands?: string[];
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

const ADMIN_PAGE_SIZE = 10;

type ExportScope = 'in_stock' | 'out_of_stock' | 'all' | 'selected';
type ExportFormat = 'pdf' | 'excel';

const EXPORT_SCOPE_OPTIONS: {
  id: ExportScope;
  label: string;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    id: 'all',
    label: 'All Products',
    activeClass: 'border-[#0F4C69] bg-[#0F4C69]/10 text-[#0F4C69] ring-1 ring-[#0F4C69]/30',
    idleClass: 'border-gray-200 bg-white text-gray-700 hover:border-[#0F4C69]/40 hover:bg-[#0F4C69]/5',
  },
  {
    id: 'in_stock',
    label: 'In Stock',
    activeClass: 'border-green-300 bg-green-50 text-green-800 ring-1 ring-green-200',
    idleClass: 'border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50/60',
  },
  {
    id: 'out_of_stock',
    label: 'Out of Stock',
    activeClass: 'border-red-300 bg-red-50 text-red-800 ring-1 ring-red-200',
    idleClass: 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50/60',
  },
  {
    id: 'selected',
    label: 'Selected Products',
    activeClass: 'border-[#E36630]/40 bg-[#E36630]/10 text-[#E36630] ring-1 ring-[#E36630]/25',
    idleClass: 'border-gray-200 bg-white text-gray-700 hover:border-[#E36630]/30 hover:bg-[#E36630]/5',
  },
];

const ProductsPage = () => {
  const [products,     setProducts]    = useState<Product[]>([]);
  const [categories,   setCategories]  = useState<Category[]>([]);
  const [total,        setTotal]       = useState(0);
  const [totalPages,   setTotalPages]  = useState(0);
  const [loading,      setLoading]     = useState(true);
  const [searchTerm,   setSearchTerm]  = useState('');
  const [filterCat,    setFilterCat]   = useState('all');
  const [filterStatus, setFilterStatus]= useState('all');
  const [filterStock,  setFilterStock] = useState('all');
  const [successMsg,   setSuccessMsg]  = useState('');
  const [error,        setError]       = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<{ format: ExportFormat; scope: ExportScope } | null>(null);
  const [exportFormatTab, setExportFormatTab] = useState<ExportFormat>('pdf');
  const [exportScope, setExportScope] = useState<ExportScope>('all');
  const [selectedIds,   setSelectedIds]   = useState<string[]>([]);
  const [currentPage,   setCurrentPage]   = useState(1);

  // Modal
  const [modalMode,       setModalMode]       = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget,    setDeleteTarget]    = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Auto-clear banners ──
  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
  const showError   = (msg: string) => { setError(msg);      setTimeout(() => setError(''),      5000); };

  // ── Fetch products (server-side paginated + filtered) ──────────────────────

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page',  String(page));
      params.set('limit', String(ADMIN_PAGE_SIZE));
      params.set('productType', 'main');
      if (searchTerm.trim())      params.set('search',   searchTerm.trim());
      if (filterStatus !== 'all') params.set('status',   filterStatus);
      if (filterStock  !== 'all') params.set('stock',    filterStock);
      if (filterCat    !== 'all') params.set('category', filterCat);

      const res  = await fetch(`/api/admin/products?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.total ?? data.data.length);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch {
      showError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCat, filterStatus, filterStock]);

  // Fetch categories once
  useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data); })
      .catch(() => {});
  }, []);

  // Re-fetch when page or filters change; reset to page 1 on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCat, filterStatus, filterStock]);
  useEffect(() => { fetchProducts(currentPage); }, [currentPage, fetchProducts]);

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
      showSuccess('Product updated successfully.');
    } else {
      showSuccess('Product created successfully.');
    }
    fetchProducts(currentPage);
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
      fetchProducts(currentPage);
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchExportProducts = async (scope: ExportScope) => {
    const url =
      scope === 'selected'
        ? `/api/admin/products/export?ids=${encodeURIComponent(selectedIds.join(','))}`
        : `/api/admin/products/export?stock=${scope}`;

    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to export products.');
    }
    return data.data;
  };

  const exportSuccessMessage = (format: ExportFormat, scope: ExportScope, count?: number) => {
    const kind = format === 'pdf' ? 'PDF' : 'Excel file';
    if (scope === 'selected') {
      return `${kind} downloaded for ${count ?? 0} selected product(s).`;
    }
    if (scope === 'in_stock') return `In stock products ${kind} downloaded.`;
    if (scope === 'out_of_stock') return `Out of stock products ${kind} downloaded.`;
    return `All products ${kind} downloaded.`;
  };

  const handleExport = async (format: ExportFormat, scope: ExportScope) => {
    if (scope === 'selected' && selectedIds.length === 0) {
      showError('Select at least one product to download.');
      return;
    }

    setExportLoading({ format, scope });
    try {
      const products = await fetchExportProducts(scope);
      if (format === 'pdf') {
        await downloadStockProductsPdf(products, scope);
      } else {
        downloadStockProductsExcel(products, scope);
      }
      showSuccess(exportSuccessMessage(format, scope, products.length));
    } catch (err) {
      showError(
        (err as Error).message ||
          `Failed to generate ${format === 'pdf' ? 'PDF' : 'Excel file'}.`,
      );
    } finally {
      setExportLoading(null);
    }
  };

  const isExporting = exportLoading !== null;
  const canExportSelected = selectedIds.length > 0;
  const exportDownloadDisabled =
    isExporting || (exportScope === 'selected' && !canExportSelected);

  const exportScopeLabel = (scope: ExportScope) => {
    if (scope === 'selected') {
      return canExportSelected
        ? `Selected Products (${selectedIds.length})`
        : 'Selected Products';
    }
    return EXPORT_SCOPE_OPTIONS.find((option) => option.id === scope)?.label ?? scope;
  };

  const toggleProductSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const pageIds = products.map((p) => p._id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  const toggleAllOnPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      return;
    }
    setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
  };

  const clearSelection = () => setSelectedIds([]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res  = await fetch(`/api/admin/products/${deleteTarget._id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSuccess('Product deleted successfully.');
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget._id));
      fetchProducts(currentPage);
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Fetch the full product document (listing projection omits specs, videos, about, etc.)
  const openModal = async (product: Product, mode: 'edit' | 'view') => {
    try {
      const res  = await fetch(`/api/admin/products/${product._id}`, { credentials: 'include' });
      const data = await res.json();
      setSelectedProduct(data.success ? data.data : product);
    } catch {
      setSelectedProduct(product); // fallback to partial data
    }
    setModalMode(mode);
  };

  // products already filtered and paginated by server
  const paginated = products;

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
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search by name, slug, or product ID…" value={searchTerm}
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
            <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
              className="w-full md:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Export products</p>
              <div className="mt-3 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setExportFormatTab('pdf')}
                  disabled={isExporting}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    exportFormatTab === 'pdf'
                      ? 'bg-white text-[#0F4C69] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormatTab('excel')}
                  disabled={isExporting}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    exportFormatTab === 'excel'
                      ? 'bg-white text-[#0F4C69] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Excel
                </button>
              </div>
              {exportFormatTab === 'excel' && (
                <p className="mt-2 text-xs text-gray-500">Excel export includes product data only — no images.</p>
              )}
              {exportFormatTab === 'pdf' && (
                <p className="mt-2 text-xs text-gray-500">PDF export includes product images in the report.</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Choose export type</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {EXPORT_SCOPE_OPTIONS.map((option) => {
                  const isActive = exportScope === option.id;
                  const isSelectedScope = option.id === 'selected';
                  const disabled =
                    isExporting || (isSelectedScope && !canExportSelected);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setExportScope(option.id)}
                      disabled={disabled}
                      className={`inline-flex min-w-[140px] flex-1 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none ${
                        isActive ? option.activeClass : option.idleClass
                      }`}
                    >
                      {isSelectedScope && canExportSelected
                        ? `Selected Products (${selectedIds.length})`
                        : option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => handleExport(exportFormatTab, exportScope)}
                disabled={exportDownloadDisabled}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F4C69] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d3f59] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isExporting
                  ? exportFormatTab === 'pdf'
                    ? 'Generating PDF…'
                    : 'Generating Excel…'
                  : `Download ${exportFormatTab === 'pdf' ? 'PDF' : 'Excel'} — ${exportScopeLabel(exportScope)}`}
              </button>

              {canExportSelected && (
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={isExporting}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Products</h2>
              {selectedIds.length > 0 && (
                <p className="text-xs text-[#0F4C69] mt-0.5">
                  {selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {total > 0
                ? `${(currentPage - 1) * ADMIN_PAGE_SIZE + 1}–${Math.min(currentPage * ADMIN_PAGE_SIZE, total)} of ${total}`
                : '0 products'}
            </span>
          </div>

          {loading ? (
            <PageLoader message="Loading products…" fullScreen={false} className="min-h-0 bg-white py-12" />
          ) : paginated.length === 0 ? (
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
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = somePageSelected;
                        }}
                        onChange={toggleAllOnPage}
                        aria-label="Select all products on this page"
                        className="h-4 w-4 rounded border-gray-300 accent-[#0F4C69] focus:ring-[#0F4C69]/35"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">Product ID</th>
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
                  {paginated.map(product => (
                    <tr key={product._id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(product._id) ? 'bg-[#0F4C69]/5' : ''}`}>

                      {/* Select */}
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => toggleProductSelection(product._id)}
                          aria-label={`Select ${product.name}`}
                          className="h-4 w-4 rounded border-gray-300 accent-[#0F4C69] focus:ring-[#0F4C69]/35"
                        />
                      </td>

                      {/* Product ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="font-mono text-xs text-gray-600"
                          title={product._id}
                        >
                          {product._id}
                        </span>
                      </td>

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
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            title="View product"
                            aria-label="View product"
                            onClick={() => openModal(product, 'view')}
                            className={adminIconActionBtn}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Edit product"
                            aria-label="Edit product"
                            onClick={() => openModal(product, 'edit')}
                            className={adminIconActionBtn}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Delete product"
                            aria-label="Delete product"
                            onClick={() => { setDeleteTarget(product); setShowDeleteModal(true); }}
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (() => {
          const getPages = (): (number | '…')[] => {
            if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
            const pages: (number | '…')[] = [1];
            if (currentPage > 3) pages.push('…');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('…');
            pages.push(totalPages);
            return pages;
          };

          return (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-3">
              <p className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-800">{currentPage}</span> of <span className="font-semibold text-gray-800">{totalPages}</span>
              </p>

              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#0F4C69] hover:text-[#0F4C69] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>

                {/* Page numbers */}
                {getPages().map((page, idx) =>
                  page === '…' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-xs select-none">…</span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-[#0F4C69] text-white shadow-sm'
                          : 'border border-gray-200 text-gray-700 hover:bg-[#0F4C69]/8 hover:border-[#0F4C69] hover:text-[#0F4C69]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#0F4C69] hover:text-[#0F4C69] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                >
                  Next
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}

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
