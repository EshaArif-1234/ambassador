'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  _id: string;
  title: string;
  slug: string;
  image: string;
  imagePublicId: string;
  status: 'active' | 'inactive';
  subcategoryCount: number;
  createdAt: string;
}

interface SubCategory {
  _id: string;
  title: string;
  slug: string;
  image: string;
  imagePublicId: string;
  categoryId: { _id: string; title: string } | string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CategoryForm {
  title: string;
  imageFile: File | null;
  imagePreview: string;
  imageUrl: string;
  imagePublicId: string;
  status: 'active' | 'inactive';
}

interface SubCategoryForm {
  title: string;
  imageFile: File | null;
  imagePreview: string;
  imageUrl: string;
  imagePublicId: string;
  categoryId: string;
  status: 'active' | 'inactive';
}

const emptyCategoryForm = (): CategoryForm => ({
  title: '', imageFile: null, imagePreview: '', imageUrl: '', imagePublicId: '', status: 'active',
});

const emptySubCategoryForm = (): SubCategoryForm => ({
  title: '', imageFile: null, imagePreview: '', imageUrl: '', imagePublicId: '', categoryId: '', status: 'active',
});

// ─── Component ────────────────────────────────────────────────────────────────

const AdminCategoriesPage = () => {
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterStatus,  setFilterStatus]  = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType,    setFilterType]    = useState<'all' | 'category' | 'subcategory'>('all');
  const [successMsg,    setSuccessMsg]    = useState('');
  const [error,         setError]         = useState('');

  // Modal visibility
  const [showCategoryModal,    setShowCategoryModal]    = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showViewCatModal,     setShowViewCatModal]     = useState(false);
  const [showViewSubModal,     setShowViewSubModal]     = useState(false);
  const [showDeleteModal,      setShowDeleteModal]      = useState(false);

  // Selected items
  const [selectedCategory,    setSelectedCategory]    = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [itemToDelete,        setItemToDelete]        = useState<{ id: string; type: 'category' | 'subcategory'; name: string } | null>(null);

  // Form state
  const [modalMode,       setModalMode]       = useState<'add' | 'edit'>('add');
  const [categoryForm,    setCategoryForm]    = useState<CategoryForm>(emptyCategoryForm());
  const [subCategoryForm, setSubCategoryForm] = useState<SubCategoryForm>(emptySubCategoryForm());
  const [catErrors,       setCatErrors]       = useState<Record<string, string>>({});
  const [subErrors,       setSubErrors]       = useState<Record<string, string>>({});
  const [saving,          setSaving]          = useState(false);
  const [uploading,       setUploading]       = useState(false);
  const [actionLoading,   setActionLoading]   = useState<string | null>(null);

  // ── Auto-clear banners ──
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  // ── Fetch data ──────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, subRes] = await Promise.all([
        fetch('/api/admin/categories', { credentials: 'include' }),
        fetch('/api/admin/subcategories', { credentials: 'include' }),
      ]);
      const [catData, subData] = await Promise.all([catRes.json(), subRes.json()]);
      if (catData.success)  setCategories(catData.data);
      if (subData.success) setSubcategories(subData.data);
    } catch {
      showError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Image upload helper ─────────────────────────────────────────────────────

  const uploadImage = async (file: File): Promise<{ url: string; publicId: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message ?? 'Upload failed');
    return { url: data.url, publicId: data.publicId };
  };

  // ── Category handlers ───────────────────────────────────────────────────────

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
      title: cat.title, imageFile: null,
      imagePreview: cat.image, imageUrl: cat.image,
      imagePublicId: cat.imagePublicId, status: cat.status,
    });
    setCatErrors({});
    setShowCategoryModal(true);
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCategoryForm(f => ({ ...f, imageFile: file, imagePreview: preview }));
  };

  const handleSaveCategory = async () => {
    const errors: Record<string, string> = {};
    if (!categoryForm.title.trim()) errors.title = 'Category title is required.';
    if (modalMode === 'add' && !categoryForm.imageFile) errors.image = 'Category image is required.';
    setCatErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      let imageUrl      = categoryForm.imageUrl;
      let imagePublicId = categoryForm.imagePublicId;

      if (categoryForm.imageFile) {
        setUploading(true);
        const uploaded = await uploadImage(categoryForm.imageFile);
        imageUrl      = uploaded.url;
        imagePublicId = uploaded.publicId;
        setUploading(false);
      }

      const payload = { title: categoryForm.title, image: imageUrl, imagePublicId, status: categoryForm.status };

      if (modalMode === 'add') {
        const res  = await fetch('/api/admin/categories', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCategories(prev => [{ ...data.data, subcategoryCount: 0 }, ...prev]);
        showSuccess('Category created successfully.');
      } else if (selectedCategory) {
        const res  = await fetch(`/api/admin/categories/${selectedCategory._id}`, {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCategories(prev => prev.map(c =>
          c._id === selectedCategory._id ? { ...c, ...data.data } : c
        ));
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
      const res  = await fetch(`/api/admin/categories/${cat._id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, status: newStatus } : c));
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    setItemToDelete({ id: cat._id, type: 'category', name: cat.title });
    setShowDeleteModal(true);
  };

  // ── SubCategory handlers ────────────────────────────────────────────────────

  const handleAddSubCategory = () => {
    setModalMode('add');
    setSelectedSubCategory(null);
    setSubCategoryForm(emptySubCategoryForm());
    setSubErrors({});
    setShowSubCategoryModal(true);
  };

  const handleEditSubCategory = (sub: SubCategory) => {
    setModalMode('edit');
    setSelectedSubCategory(sub);
    const parentId = typeof sub.categoryId === 'string' ? sub.categoryId : sub.categoryId._id;
    setSubCategoryForm({
      title: sub.title, imageFile: null,
      imagePreview: sub.image, imageUrl: sub.image,
      imagePublicId: sub.imagePublicId, categoryId: parentId, status: sub.status,
    });
    setSubErrors({});
    setShowSubCategoryModal(true);
  };

  const handleSubCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSubCategoryForm(f => ({ ...f, imageFile: file, imagePreview: preview }));
  };

  const handleSaveSubCategory = async () => {
    const errors: Record<string, string> = {};
    if (!subCategoryForm.title.trim())   errors.title      = 'Subcategory title is required.';
    if (!subCategoryForm.categoryId)     errors.categoryId = 'Parent category is required.';
    if (modalMode === 'add' && !subCategoryForm.imageFile) errors.image = 'Subcategory image is required.';
    setSubErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      let imageUrl      = subCategoryForm.imageUrl;
      let imagePublicId = subCategoryForm.imagePublicId;

      if (subCategoryForm.imageFile) {
        setUploading(true);
        const uploaded = await uploadImage(subCategoryForm.imageFile);
        imageUrl      = uploaded.url;
        imagePublicId = uploaded.publicId;
        setUploading(false);
      }

      const payload = {
        title: subCategoryForm.title, image: imageUrl, imagePublicId,
        categoryId: subCategoryForm.categoryId, status: subCategoryForm.status,
      };

      if (modalMode === 'add') {
        const res  = await fetch('/api/admin/subcategories', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSubcategories(prev => [data.data, ...prev]);
        setCategories(prev => prev.map(c =>
          c._id === subCategoryForm.categoryId
            ? { ...c, subcategoryCount: c.subcategoryCount + 1 }
            : c
        ));
        showSuccess('Subcategory created successfully.');
      } else if (selectedSubCategory) {
        const res  = await fetch(`/api/admin/subcategories/${selectedSubCategory._id}`, {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSubcategories(prev => prev.map(s =>
          s._id === selectedSubCategory._id ? data.data : s
        ));
        showSuccess('Subcategory updated successfully.');
      }
      setShowSubCategoryModal(false);
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleToggleSubCategoryStatus = async (sub: SubCategory) => {
    setActionLoading(sub._id);
    const newStatus = sub.status === 'active' ? 'inactive' : 'active';
    try {
      const res  = await fetch(`/api/admin/subcategories/${sub._id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubcategories(prev => prev.map(s => s._id === sub._id ? { ...s, status: newStatus } : s));
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSubCategory = (sub: SubCategory) => {
    setItemToDelete({ id: sub._id, type: 'subcategory', name: sub.title });
    setShowDeleteModal(true);
  };

  // ── Confirm delete ──────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    const url = type === 'category'
      ? `/api/admin/categories/${id}`
      : `/api/admin/subcategories/${id}`;

    try {
      const res  = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (type === 'category') {
        const deletedCat = categories.find(c => c._id === id);
        setCategories(prev => prev.filter(c => c._id !== id));
        // Remove all subcategories that belonged to this category
        if (deletedCat) {
          setSubcategories(prev => prev.filter(s => {
            const parentId = typeof s.categoryId === 'string' ? s.categoryId : s.categoryId._id;
            return parentId !== id;
          }));
        }
      } else {
        const deletedSub = subcategories.find(s => s._id === id);
        setSubcategories(prev => prev.filter(s => s._id !== id));
        if (deletedSub) {
          const parentId = typeof deletedSub.categoryId === 'string'
            ? deletedSub.categoryId : deletedSub.categoryId._id;
          setCategories(prev => prev.map(c =>
            c._id === parentId ? { ...c, subcategoryCount: Math.max(0, c.subcategoryCount - 1) } : c
          ));
        }
      }
      showSuccess(`${type === 'category' ? 'Category' : 'Subcategory'} deleted successfully.`);
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // ── Filtered lists ──────────────────────────────────────────────────────────

  const filteredCategories = categories.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchType   = filterType   === 'all' || filterType === 'category';
    return matchSearch && matchStatus && matchType;
  });

  const filteredSubCategories = subcategories.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchType   = filterType   === 'all' || filterType === 'subcategory';
    return matchSearch && matchStatus && matchType;
  });

  const getParentTitle = (sub: SubCategory) =>
    typeof sub.categoryId === 'string'
      ? (categories.find(c => c._id === sub.categoryId)?.title ?? 'Unknown')
      : sub.categoryId.title;

  // ── Shared UI fragments ─────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: 'active' | 'inactive' }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
    }`}>
      {status}
    </span>
  );

  const Toggle = ({ active, loading, onClick }: { active: boolean; loading: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        active ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        active ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );

  const Thumb = ({ src, alt }: { src: string; alt: string }) => (
    <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center flex-shrink-0">
      {src ? (
        <Image src={src} alt={alt} width={48} height={48} className="w-full h-full object-cover" />
      ) : (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage categories and subcategories for your kitchen products
          </p>
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button onClick={handleAddCategory}
            className="px-4 py-2 bg-[#0F4C69] text-white text-sm font-medium rounded-lg hover:bg-[#0d3d55] transition-colors shadow-sm">
            + Add Category
          </button>
          <button onClick={handleAddSubCategory}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm">
            + Add Subcategory
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search categories..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30 focus:border-[#0F4C69]" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full md:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)}
              className="w-full md:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30">
              <option value="all">All Types</option>
              <option value="category">Categories</option>
              <option value="subcategory">Subcategories</option>
            </select>
          </div>
        </div>

        {/* ── Categories Table ── */}
        {(filterType === 'all' || filterType === 'category') && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Categories</h2>
              <span className="text-xs text-gray-400 font-medium">{filteredCategories.length} total</span>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-[#0F4C69] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">No categories found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Image</th>
                      <th className="px-6 py-3 text-left">Title</th>
                      <th className="px-6 py-3 text-left">Subcategories</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Toggle</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCategories.map(cat => (
                      <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><Thumb src={cat.image} alt={cat.title} /></td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{cat.title}</span>
                          <div className="text-xs text-gray-400 mt-0.5">{cat.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            {cat.subcategoryCount}
                          </span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={cat.status} /></td>
                        <td className="px-6 py-4">
                          <Toggle
                            active={cat.status === 'active'}
                            loading={actionLoading === cat._id}
                            onClick={() => handleToggleCategoryStatus(cat)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedCategory(cat); setShowViewCatModal(true); }}
                              className="px-3 py-1.5 text-xs font-medium bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] transition-colors">
                              View
                            </button>
                            <button onClick={() => handleEditCategory(cat)}
                              className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteCategory(cat)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
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
        )}

        {/* ── Subcategories Table ── */}
        {(filterType === 'all' || filterType === 'subcategory') && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Subcategories</h2>
              <span className="text-xs text-gray-400 font-medium">{filteredSubCategories.length} total</span>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-[#0F4C69] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredSubCategories.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">No subcategories found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Image</th>
                      <th className="px-6 py-3 text-left">Title</th>
                      <th className="px-6 py-3 text-left">Parent Category</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Toggle</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubCategories.map(sub => (
                      <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><Thumb src={sub.image} alt={sub.title} /></td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{sub.title}</span>
                          <div className="text-xs text-gray-400 mt-0.5">{sub.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{getParentTitle(sub)}</td>
                        <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                        <td className="px-6 py-4">
                          <Toggle
                            active={sub.status === 'active'}
                            loading={actionLoading === sub._id}
                            onClick={() => handleToggleSubCategoryStatus(sub)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedSubCategory(sub); setShowViewSubModal(true); }}
                              className="px-3 py-1.5 text-xs font-medium bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3f59] transition-colors">
                              View
                            </button>
                            <button onClick={() => handleEditSubCategory(sub)}
                              className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteSubCategory(sub)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
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
        )}

        {/* ── Category Modal ── */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {modalMode === 'add' ? 'Create a new product category' : 'Update the saved category details'}
                  </p>
                </div>
                <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">✕</button>
              </div>

              {/* Saved data summary — edit mode only */}
              {modalMode === 'edit' && selectedCategory && (
                <div className="mx-6 mt-5 rounded-xl border border-[#0F4C69]/20 bg-[#0F4C69]/5 overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Current image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#0F4C69]/20 bg-white flex-shrink-0">
                      {selectedCategory.image ? (
                        <img src={selectedCategory.image} alt={selectedCategory.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#0F4C69] font-semibold uppercase tracking-wide mb-1">Currently saved</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedCategory.title}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">/{selectedCategory.slug}</p>
                    </div>
                    {/* Status + date */}
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={selectedCategory.status} />
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(selectedCategory.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalMode === 'edit' ? 'New Title' : 'Title'} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={categoryForm.title}
                    onChange={e => setCategoryForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Kitchen Cabinets"
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C69]/30 ${catErrors.title ? 'border-red-400' : 'border-gray-300'}`} />
                  {catErrors.title && <p className="text-red-500 text-xs mt-1">{catErrors.title}</p>}
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalMode === 'edit' ? 'Replace Image' : 'Image'}
                    {modalMode === 'add' && <span className="text-red-500"> *</span>}
                    {modalMode === 'edit' && <span className="text-gray-400 font-normal"> (optional — leave blank to keep current)</span>}
                    {modalMode === 'add' && <span className="text-gray-400 font-normal ml-1">(JPEG/PNG/WebP, max 5 MB)</span>}
                  </label>
                  <input type="file" accept="image/*" onChange={handleCategoryImageChange}
                    className={`w-full text-sm text-gray-600 border rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#0F4C69] file:text-white hover:file:bg-[#0d3d55] outline-none ${catErrors.image ? 'border-red-400' : 'border-gray-300'}`} />
                  {catErrors.image && <p className="text-red-500 text-xs mt-1">{catErrors.image}</p>}
                  {/* New file preview */}
                  {categoryForm.imageFile && categoryForm.imagePreview && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">New image preview:</p>
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <img src={categoryForm.imagePreview} alt="new preview" className="w-full h-32 object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveCategory} disabled={saving}
                  className="px-5 py-2 text-sm bg-[#0F4C69] text-white rounded-lg hover:bg-[#0d3d55] transition-colors disabled:opacity-60 flex items-center gap-2">
                  {uploading ? 'Uploading…' : saving ? 'Saving…' : modalMode === 'add' ? 'Add Category' : 'Update Category'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SubCategory Modal ── */}
        {showSubCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'add' ? 'Add Subcategory' : 'Edit Subcategory'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {modalMode === 'add' ? 'Create a new subcategory under a parent category' : 'Update the saved subcategory details'}
                  </p>
                </div>
                <button onClick={() => setShowSubCategoryModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">✕</button>
              </div>

              {/* Saved data summary — edit mode only */}
              {modalMode === 'edit' && selectedSubCategory && (
                <div className="mx-6 mt-5 rounded-xl border border-orange-200 bg-orange-50 overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Current image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-orange-200 bg-white flex-shrink-0">
                      {selectedSubCategory.image ? (
                        <img src={selectedSubCategory.image} alt={selectedSubCategory.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Currently saved</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedSubCategory.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        under <span className="font-medium text-gray-700">{getParentTitle(selectedSubCategory)}</span>
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">/{selectedSubCategory.slug}</p>
                    </div>
                    {/* Status + date */}
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={selectedSubCategory.status} />
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(selectedSubCategory.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalMode === 'edit' ? 'New Title' : 'Title'} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={subCategoryForm.title}
                    onChange={e => setSubCategoryForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Wall Cabinets"
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-400/30 ${subErrors.title ? 'border-red-400' : 'border-gray-300'}`} />
                  {subErrors.title && <p className="text-red-500 text-xs mt-1">{subErrors.title}</p>}
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category <span className="text-red-500">*</span></label>
                  <select value={subCategoryForm.categoryId}
                    onChange={e => setSubCategoryForm(f => ({ ...f, categoryId: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-400/30 ${subErrors.categoryId ? 'border-red-400' : 'border-gray-300'}`}>
                    <option value="">— Select category —</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                  {subErrors.categoryId && <p className="text-red-500 text-xs mt-1">{subErrors.categoryId}</p>}
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalMode === 'edit' ? 'Replace Image' : 'Image'}
                    {modalMode === 'add' && <span className="text-red-500"> *</span>}
                    {modalMode === 'edit' && <span className="text-gray-400 font-normal"> (optional — leave blank to keep current)</span>}
                    {modalMode === 'add' && <span className="text-gray-400 font-normal ml-1">(JPEG/PNG/WebP, max 5 MB)</span>}
                  </label>
                  <input type="file" accept="image/*" onChange={handleSubCategoryImageChange}
                    className={`w-full text-sm text-gray-600 border rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-orange-500 file:text-white hover:file:bg-orange-600 outline-none ${subErrors.image ? 'border-red-400' : 'border-gray-300'}`} />
                  {subErrors.image && <p className="text-red-500 text-xs mt-1">{subErrors.image}</p>}
                  {/* New file preview only */}
                  {subCategoryForm.imageFile && subCategoryForm.imagePreview && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">New image preview:</p>
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <img src={subCategoryForm.imagePreview} alt="new preview" className="w-full h-32 object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setShowSubCategoryModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveSubCategory} disabled={saving}
                  className="px-5 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60">
                  {uploading ? 'Uploading…' : saving ? 'Saving…' : modalMode === 'add' ? 'Add Subcategory' : 'Update Subcategory'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── View Category Modal ── */}
        {showViewCatModal && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Category Details</h2>
                <button onClick={() => setShowViewCatModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
              </div>
              <div className="p-6 space-y-4">
                {selectedCategory.image && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <Image src={selectedCategory.image} alt={selectedCategory.title} width={400} height={200} className="w-full h-40 object-cover" />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="font-medium text-gray-900">{selectedCategory.title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Slug</span><span className="font-mono text-gray-600 text-xs">{selectedCategory.slug}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-500">Status</span><StatusBadge status={selectedCategory.status} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Subcategories</span><span className="font-medium text-gray-900">{selectedCategory.subcategoryCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-600">{new Date(selectedCategory.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
              <div className="flex justify-end px-6 py-4 border-t border-gray-100">
                <button onClick={() => setShowViewCatModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── View SubCategory Modal ── */}
        {showViewSubModal && selectedSubCategory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Subcategory Details</h2>
                <button onClick={() => setShowViewSubModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
              </div>
              <div className="p-6 space-y-4">
                {selectedSubCategory.image && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <Image src={selectedSubCategory.image} alt={selectedSubCategory.title} width={400} height={200} className="w-full h-40 object-cover" />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="font-medium text-gray-900">{selectedSubCategory.title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Parent</span><span className="text-gray-600">{getParentTitle(selectedSubCategory)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Slug</span><span className="font-mono text-gray-600 text-xs">{selectedSubCategory.slug}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-500">Status</span><StatusBadge status={selectedSubCategory.status} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-600">{new Date(selectedSubCategory.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
              <div className="flex justify-end px-6 py-4 border-t border-gray-100">
                <button onClick={() => setShowViewSubModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
          onConfirm={confirmDelete}
          title={itemToDelete?.type === 'category' ? 'Delete Category' : 'Delete Subcategory'}
          message={
            itemToDelete?.type === 'category'
              ? `Are you sure you want to delete "${itemToDelete.name}"? All its subcategories will also be deleted. This cannot be undone.`
              : `Are you sure you want to delete "${itemToDelete?.name}"? This cannot be undone.`
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
