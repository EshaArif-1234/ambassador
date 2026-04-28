'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Category {
  _id: string;
  title: string;
  slug: string;
  image: string;
  imagePublicId: string;
  status: 'active' | 'inactive';
  metaTitle?: string;
  createdAt: string;
}

interface CategoryForm {
  title: string;
  imageFile: File | null;
  imagePreview: string;
  imageUrl: string;
  imagePublicId: string;
  status: 'active' | 'inactive';
  metaTitle: string;
}

const emptyCategoryForm = (): CategoryForm => ({
  title: '',
  imageFile: null,
  imagePreview: '',
  imageUrl: '',
  imagePublicId: '',
  status: 'active',
  metaTitle: '',
});

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showViewCatModal, setShowViewCatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm());
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const catRes = await fetch('/api/admin/categories', { credentials: 'include' });
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.data);
    } catch {
      showError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const catRes = await fetch('/api/admin/categories', { credentials: 'include' });
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.data);
    } catch {
      showError('Failed to refresh.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const uploadImage = async (file: File): Promise<{ url: string; publicId: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message ?? 'Upload failed');
    return { url: data.url, publicId: data.publicId };
  };

  const handleAddCategory = () => {
    setModalMode('add');
    setSelectedCategory(null);
    setCategoryForm(emptyCategoryForm());
    setCatErrors({});
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat: Category) => {
    setModalMode('edit');
    setSelectedCategory(cat);
    setCategoryForm({
      title: cat.title,
      imageFile: null,
      imagePreview: cat.image,
      imageUrl: cat.image,
      imagePublicId: cat.imagePublicId,
      status: cat.status,
      metaTitle: cat.metaTitle ?? '',
    });
    setCatErrors({});
    setShowCategoryModal(true);
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCategoryForm((f) => ({ ...f, imageFile: file, imagePreview: preview }));
  };

  const handleSaveCategory = async () => {
    const errors: Record<string, string> = {};
    if (!categoryForm.title.trim()) errors.title = 'Category title is required.';
    if (modalMode === 'add' && !categoryForm.imageFile) errors.image = 'Category image is required.';
    setCatErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      let imageUrl = categoryForm.imageUrl;
      let imagePublicId = categoryForm.imagePublicId;

      if (categoryForm.imageFile) {
        setUploading(true);
        const uploaded = await uploadImage(categoryForm.imageFile);
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
        setUploading(false);
      }

      const payload = {
        title: categoryForm.title,
        image: imageUrl,
        imagePublicId,
        status: categoryForm.status,
        metaTitle: categoryForm.metaTitle.trim(),
      };

      if (modalMode === 'add') {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCategories((prev) => [{ ...data.data }, ...prev]);
        showSuccess('Category created successfully.');
      } else if (selectedCategory) {
        const res = await fetch(`/api/admin/categories/${selectedCategory._id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCategories((prev) =>
          prev.map((c) => (c._id === selectedCategory._id ? { ...c, ...data.data } : c)),
        );
        showSuccess('Category updated successfully.');
      }
      setShowCategoryModal(false);
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleToggleCategoryStatus = async (cat: Category) => {
    setActionLoading(cat._id);
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/categories/${cat._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, status: newStatus } : c)),
      );
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    setItemToDelete({ id: cat._id, name: cat.title });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/admin/categories/${itemToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await refreshCategories();
      showSuccess('Category deleted successfully.');
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const StatusBadge = ({ status }: { status: 'active' | 'inactive' }) => (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  );

  const Toggle = ({
    active,
    loading,
    onClick,
  }: {
    active: boolean;
    loading: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        active ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const Thumb = ({ src, alt }: { src: string; alt: string }) => (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-100">
      {src ? (
        <Image src={src} alt={alt} width={48} height={48} className="h-full w-full object-cover" />
      ) : (
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage categories for your kitchen products</p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {successMsg}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={handleAddCategory}
            className="rounded-lg bg-[#0F4C69] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0d3d55]"
          >
            + Add Category
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-[#0F4C69] focus:ring-2 focus:ring-[#0F4C69]/30"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30 md:w-44"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Categories</h2>
            <span className="text-xs font-medium text-gray-400">{filteredCategories.length} total</span>
          </div>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F4C69] border-t-transparent" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">No categories found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Image</th>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Toggle</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((cat) => (
                    <tr key={cat._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Thumb src={cat.image} alt={cat.title} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{cat.title}</span>
                        <div className="mt-0.5 text-xs text-gray-400">{cat.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={cat.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Toggle
                          active={cat.status === 'active'}
                          loading={actionLoading === cat._id}
                          onClick={() => handleToggleCategoryStatus(cat)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setShowViewCatModal(true);
                            }}
                            className="rounded-lg bg-[#0F4C69] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0d3f59]"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditCategory(cat)}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
                          >
                            Delete
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

        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F4C69]/10">
                    <svg className="h-4 w-4 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {modalMode === 'add'
                        ? 'Title, image, and optional meta title'
                        : 'Update details — meta title is title-only (no description)'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {modalMode === 'edit' && selectedCategory && (
                  <div className="mx-6 mt-5 overflow-hidden rounded-xl border border-[#0F4C69]/20 bg-[#0F4C69]/5">
                    <div className="flex items-center gap-4 p-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#0F4C69]/20 bg-white">
                        {selectedCategory.image ? (
                          <img
                            src={selectedCategory.image}
                            alt={selectedCategory.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#0F4C69]">
                          Saved in database
                        </p>
                        <p className="truncate text-sm font-semibold text-gray-900">{selectedCategory.title}</p>
                        <p className="mt-0.5 truncate font-mono text-xs text-gray-400">/{selectedCategory.slug}</p>
                        {selectedCategory.metaTitle?.trim() ? (
                          <p className="mt-1.5 text-xs text-gray-600">
                            <span className="text-gray-500">Meta title: </span>
                            {selectedCategory.metaTitle}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs italic text-gray-400">
                            No custom meta title — page will use category name
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <StatusBadge status={selectedCategory.status} />
                        <p className="mt-1.5 text-xs text-gray-400">
                          {new Date(selectedCategory.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-5 p-6">
                  <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <span className="h-4 w-1 rounded-full bg-[#0F4C69]" />
                      Basic details
                    </h3>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        {modalMode === 'edit' ? 'New title' : 'Title'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={categoryForm.title}
                        onChange={(e) => setCategoryForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Kitchen Cabinets"
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30 ${
                          catErrors.title ? 'border-red-400' : 'border-gray-300 bg-white'
                        }`}
                      />
                      {catErrors.title && <p className="mt-1 text-xs text-red-500">{catErrors.title}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        {modalMode === 'edit' ? 'Replace image' : 'Image'}
                        {modalMode === 'add' && <span className="text-red-500"> *</span>}
                        {modalMode === 'edit' && <span className="font-normal text-gray-400"> — optional</span>}
                        <span className="font-normal text-gray-400"> · JPEG/PNG/WebP, max 5 MB</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageChange}
                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-600 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#0F4C69] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-[#0d3d55] ${
                          catErrors.image ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      {catErrors.image && <p className="mt-1 text-xs text-red-500">{catErrors.image}</p>}
                      {categoryForm.imageFile && categoryForm.imagePreview && (
                        <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                          <img src={categoryForm.imagePreview} alt="Preview" className="h-32 w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#0F4C69]/15 bg-[#0F4C69]/[0.04] p-4">
                    <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <svg className="h-4 w-4 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Meta title only
                    </h3>
                    <p className="mb-3 text-xs text-gray-500">
                      Optional. Shown as the HTML &lt;title&gt; for this category page. There is no separate meta description
                      field.
                    </p>
                    <div className="mb-1 flex justify-between">
                      <label className="text-xs font-medium text-gray-600">Custom &lt;title&gt; for SEO</label>
                      <span className={`text-xs ${categoryForm.metaTitle.length > 140 ? 'text-red-500' : 'text-gray-400'}`}>
                        {categoryForm.metaTitle.length} / 160
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={160}
                      value={categoryForm.metaTitle}
                      onChange={(e) => setCategoryForm((f) => ({ ...f, metaTitle: e.target.value }))}
                      placeholder="Leave empty to use the category name"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[#0F4C69] px-5 py-2 text-sm text-white transition-colors hover:bg-[#0d3d55] disabled:opacity-60"
                >
                  {uploading ? 'Uploading…' : saving ? 'Saving…' : modalMode === 'add' ? 'Add Category' : 'Update Category'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showViewCatModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F4C69]/10">
                    <svg className="h-4 w-4 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Category</h2>
                    <p className="text-xs text-gray-400">Read-only · saved data</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowViewCatModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 overflow-y-auto p-6">
                {selectedCategory.image ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <Image
                      src={selectedCategory.image}
                      alt={selectedCategory.title}
                      width={400}
                      height={200}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                    No image
                  </div>
                )}
                <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-gray-500">Title</span>
                    <span className="text-right font-medium text-gray-900">{selectedCategory.title}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="shrink-0 text-gray-500">Slug</span>
                    <span className="break-all text-right font-mono text-xs text-gray-600">{selectedCategory.slug}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={selectedCategory.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-600">
                      {new Date(selectedCategory.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-[#0F4C69]/15 bg-[#0F4C69]/[0.04] p-4">
                  <p className="mb-1 text-xs font-semibold text-[#0F4C69]">Meta title (SEO)</p>
                  <p className="mb-2 text-xs text-gray-500">
                    Only the HTML &lt;title&gt; is stored — there is no meta description for categories.
                  </p>
                  <p className="leading-snug text-sm text-gray-900">
                    {selectedCategory.metaTitle?.trim() || (
                      <span className="italic text-gray-400">Not set — storefront can fall back to category name</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowViewCatModal(false)}
                  className="w-full rounded-lg bg-[#0F4C69] py-2 text-sm font-medium text-white transition-colors hover:bg-[#0d3f59]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete category"
          message={
            itemToDelete ? `Are you sure you want to delete "${itemToDelete.name}"? This cannot be undone.` : ''
          }
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
