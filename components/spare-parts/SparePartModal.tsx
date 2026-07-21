'use client';

import { useState, useEffect, useCallback } from 'react';
import { uploadMedia } from '@/utils/uploadMedia';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryOption {
  _id: string;
  title: string;
}

interface ProductOption {
  _id: string;
  name: string;
  categories?: { _id: string; title?: string }[] | string[];
}

export interface SparePartFormData {
  name: string;
  originalPrice: number;
  stock: number;
  status: 'active' | 'inactive';
  linkedCategoryIds: string[];
  linkedProductIds: string[];
  images: string[];
  imagePublicIds: string[];
}

interface SparePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  sparePart?: {
    _id?: string;
    name?: string;
    originalPrice?: number;
    price?: number;
    stock?: number;
    status?: 'active' | 'inactive';
    images?: string[];
    imagePublicIds?: string[];
    linkedCategoryIds?: unknown[];
    linkedProductIds?: unknown[];
  } | null;
  onSave: (data: SparePartFormData) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2 border rounded-lg text-sm text-gray-900 outline-none transition-shadow focus:ring-2 focus:ring-[#0F4C69]/25 focus:border-[#0F4C69] ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
  }`;

function refIds(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) =>
    typeof x === 'object' && x && '_id' in x ? String((x as { _id: string })._id) : String(x),
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const SparePartModal: React.FC<SparePartModalProps> = ({
  isOpen,
  onClose,
  mode,
  sparePart,
  onSave,
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '0',
    status: 'active' as 'active' | 'inactive',
    linkedCategoryIds: [] as string[],
    linkedProductIds: [] as string[],
  });

  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // ── Fetch categories ──
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data);
      });
  }, [isOpen]);

  // ── Reset form when opening ──
  useEffect(() => {
    if (!isOpen) return;
    const sp = sparePart;
    setCategoryFilter('');
    setProductSearch('');
    setForm({
      name: sp?.name ?? '',
      price: String(sp?.originalPrice ?? sp?.price ?? ''),
      stock: String(sp?.stock ?? 0),
      status: sp?.status ?? 'active',
      linkedCategoryIds: refIds(sp?.linkedCategoryIds),
      linkedProductIds: refIds(sp?.linkedProductIds),
    });
    const existingImage = sp?.images?.[0] ?? '';
    setImagePreview(existingImage);
    setImageUrl(existingImage);
    setImagePublicId(sp?.imagePublicIds?.[0] ?? '');
    setImageFile(null);
    setErrors({});
    setUploadStatus('');
    setUploadProgress(null);
  }, [isOpen, mode, sparePart?._id]);

  const fetchProducts = useCallback(async (categoryIds: string[], q: string) => {
    if (!categoryIds.length) {
      setProductOptions([]);
      return;
    }
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        productType: 'main',
        status: 'active',
        limit: '200',
        page: '1',
        categories: categoryIds.join(','),
      });
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/admin/products?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setProductOptions(data.data);
      else setProductOptions([]);
    } catch {
      setProductOptions([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(
      () => void fetchProducts(form.linkedCategoryIds, productSearch),
      250,
    );
    return () => window.clearTimeout(t);
  }, [isOpen, form.linkedCategoryIds, productSearch, fetchProducts]);

  // Drop product selections that no longer belong to the selected categories
  useEffect(() => {
    if (!isOpen) return;
    if (form.linkedCategoryIds.length === 0) {
      setForm((f) => (f.linkedProductIds.length ? { ...f, linkedProductIds: [] } : f));
      return;
    }
    if (loadingProducts) return;
    const visibleIds = new Set(productOptions.map((p) => p._id));
    setForm((f) => {
      const next = f.linkedProductIds.filter((id) => visibleIds.has(id));
      return next.length === f.linkedProductIds.length ? f : { ...f, linkedProductIds: next };
    });
  }, [productOptions, isOpen, form.linkedCategoryIds.length, loadingProducts]);

  const toggleCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      linkedCategoryIds: f.linkedCategoryIds.includes(id)
        ? f.linkedCategoryIds.filter((x) => x !== id)
        : [...f.linkedCategoryIds, id],
    }));
  };

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      linkedProductIds: f.linkedProductIds.includes(id)
        ? f.linkedProductIds.filter((x) => x !== id)
        : [...f.linkedProductIds, id],
    }));
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
    setImagePublicId('');
  };

  const filteredCategories = (() => {
    const q = categoryFilter.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.title.toLowerCase().includes(q));
  })();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Spare part title is required';
    if (!form.price.trim() || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (mode === 'add' && !imageFile && !imageUrl) e.image = 'Image is required';
    if (!form.linkedCategoryIds.length) {
      e.categories = 'Select at least one category';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let finalUrl = imageUrl;
      let finalPublicId = imagePublicId;

      if (imageFile) {
        setUploadStatus('Uploading image…');
        setUploadProgress(0);
        const up = await uploadMedia(imageFile, (pct) => setUploadProgress(pct));
        finalUrl = up.url;
        finalPublicId = up.publicId;
        setUploadProgress(null);
        setUploadStatus('');
      }

      await onSave({
        name: form.name.trim(),
        originalPrice: Number(form.price),
        stock: Number(form.stock || 0),
        status: form.status,
        linkedCategoryIds: form.linkedCategoryIds,
        linkedProductIds: form.linkedProductIds,
        images: [finalUrl],
        imagePublicIds: [finalPublicId],
      });
      onClose();
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    } finally {
      setSaving(false);
      setUploadStatus('');
      setUploadProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'add' ? 'Add New Spare Part' : 'Edit Spare Part'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === 'add'
                ? 'Fill in the details to list a spare part'
                : 'Update the saved spare part information'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">

          {errors.submit && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          {/* ── Media Upload ── */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Media Upload</h3>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">
                Spare Part Image <span className="text-gray-400">(required)</span>
              </p>

              {!imagePreview ? (
                <div className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0F4C69] hover:bg-[#0F4C69]/5 transition-colors bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      handleImageChange(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <svg className="w-7 h-7 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">+ Add Image</span>
                    <span className="text-xs text-gray-400">JPEG · PNG · WebP · max 5 MB</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    {uploadProgress != null && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <span className="text-white text-[10px] font-bold">{uploadProgress}%</span>
                        <div className="w-10 h-1 mt-1 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E36630] rounded-full transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="relative flex items-center justify-center flex-1 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0F4C69] hover:bg-[#0F4C69]/5 transition-colors bg-white">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        handleImageChange(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                    <span className="text-xs text-gray-500 font-medium pointer-events-none">Replace image</span>
                  </div>
                </div>
              )}
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>
          </div>

          {/* ── Basic Information ── */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Spare Part Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Heating Element for Pressure Fryer"
                className={inputCls(!!errors.name)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* ── Pricing & Stock ── */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Pricing & Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="2500"
                  className={inputCls(!!errors.price)}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stock (units)</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                  className={inputCls(false)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))
                  }
                  className={inputCls(false)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Where to Show ── */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Where to Show</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Select one or more categories first. Products from those categories appear below — optionally pick specific ones, or leave products empty to show on all products in the selected categories.
              </p>
            </div>

            {/* Categories */}
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-medium text-gray-600">
                  Categories <span className="text-red-500">*</span>
                  <span className="font-normal text-gray-400"> · multi</span>
                </label>
                {form.linkedCategoryIds.length > 0 && (
                  <span className="rounded-full bg-[#0F4C69]/10 px-2 py-0.5 text-[11px] font-medium text-[#0F4C69]">
                    {form.linkedCategoryIds.length} selected
                  </span>
                )}
              </div>
              {categories.length > 0 && (
                <input
                  type="search"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Filter…"
                  className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none placeholder:text-gray-400 focus:border-[#0F4C69]/40 focus:ring-1 focus:ring-[#0F4C69]/20"
                />
              )}
              <div
                className={`max-h-[min(14rem,34svh)] overflow-y-auto overscroll-contain rounded-lg border bg-white ${
                  errors.categories ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                {categories.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-gray-400">No categories.</p>
                ) : filteredCategories.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-gray-400">No matches.</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-0.5 p-1.5 sm:grid-cols-2">
                    {filteredCategories.map((c) => (
                      <li key={c._id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-[#0F4C69]/5 sm:text-[13px] sm:py-1.5">
                          <input
                            type="checkbox"
                            checked={form.linkedCategoryIds.includes(c._id)}
                            onChange={() => toggleCategory(c._id)}
                            className="h-3.5 w-3.5 shrink-0 rounded border-gray-400 text-[#0F4C69] focus:ring-[#0F4C69]/30"
                          />
                          <span className="min-w-0 text-gray-400 truncate" title={c.title}>
                            {c.title}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}
            </div>

            {/* Products — shown only when categories are selected */}
            {form.linkedCategoryIds.length > 0 && (
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-medium text-gray-600">
                    Products in selected categories
                    <span className="font-normal text-gray-400"> · optional · multi</span>
                  </label>
                  {form.linkedProductIds.length > 0 && (
                    <span className="rounded-full bg-[#0F4C69]/10 px-2 py-0.5 text-[11px] font-medium text-[#0F4C69]">
                      {form.linkedProductIds.length} selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mb-2">
                  {form.linkedProductIds.length === 0
                    ? 'No products selected — spare part will appear on all products in the selected categories.'
                    : 'Spare part will appear only on the selected products (within the chosen categories).'}
                </p>
                <input
                  type="search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products in selected categories…"
                  className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none placeholder:text-gray-400 focus:border-[#0F4C69]/40 focus:ring-1 focus:ring-[#0F4C69]/20"
                />
                <div className="max-h-[min(14rem,34svh)] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white">
                  {loadingProducts ? (
                    <p className="px-3 py-4 text-center text-xs text-gray-400">Loading products…</p>
                  ) : productOptions.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-gray-400">No products in the selected categories.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {productOptions.map((p) => (
                        <li key={p._id}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-[#0F4C69]/5 sm:text-[13px]">
                            <input
                              type="checkbox"
                              checked={form.linkedProductIds.includes(p._id)}
                              onChange={() => toggleProduct(p._id)}
                              className="h-3.5 w-3.5 shrink-0 rounded border-gray-400 text-[#0F4C69] focus:ring-[#0F4C69]/30"
                            />
                            <span className="min-w-0 text-gray-400 truncate" title={p.name}>
                              {p.name}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="text-xs text-gray-400">{uploadStatus}</div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 text-sm bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] transition-colors disabled:opacity-60 min-w-[140px] text-center"
            >
              {saving
                ? uploadStatus || 'Saving…'
                : mode === 'add'
                  ? 'Add Spare Part'
                  : 'Update Spare Part'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SparePartModal;
