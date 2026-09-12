'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminBlogModal, {
  blogToForm,
  emptyBlogForm,
  type AdminBlogForm,
  type AdminBlogSavePayload,
} from '@/components/blog/AdminBlogModal';
import { adminIconActionBtn, adminIconActionBtnDanger } from '@/admin/lib/adminTableActionStyles';
import { formatBlogDate } from '@/lib/blogDisplay';
import { useDashboardPermissions } from '@/hooks/useDashboardPermissions';
import { blogDetailPath } from '@/lib/siteRoutes';
import { BLOG_CATEGORIES, type BlogPost } from '@/lib/blog.types';

const BlogsAdminPage = () => {
  const { canDelete, canChangeStatus } = useDashboardPermissions();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<AdminBlogForm>(emptyBlogForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch('/api/admin/blogs', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load blog posts.');
      setPosts(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load blog posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const categorySuggestions = useMemo(() => {
    const fromPosts = posts
      .map((p) => p.category?.trim())
      .filter((c): c is string => Boolean(c));
    return [...new Set([...BLOG_CATEGORIES, ...fromPosts])].sort((a, b) =>
      a.localeCompare(b, 'en', { sensitivity: 'base' }),
    );
  }, [posts]);

  const filtered = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAdd = () => {
    setForm(emptyBlogForm());
    setFormError(null);
    setSelectedPost(null);
    setModalMode('add');
  };

  const openEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setForm(blogToForm(post));
    setFormError(null);
    setModalMode('edit');
  };

  const openView = (post: BlogPost) => {
    setSelectedPost(post);
    setForm(blogToForm(post));
    setFormError(null);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedPost(null);
    setFormError(null);
  };

  const handleSave = async (payload: AdminBlogSavePayload) => {
    setFormError(null);
    setSubmitting(true);
    try {
      const url = modalMode === 'add' ? '/api/admin/blogs' : `/api/admin/blogs/${selectedPost!.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        const fieldMsg =
          json.errors && typeof json.errors === 'object'
            ? Object.values(json.errors as Record<string, string>).find(Boolean)
            : undefined;
        throw new Error(fieldMsg || json.message || 'Save failed.');
      }
      closeModal();
      await loadPosts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed.');
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${selectedPost.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Delete failed.');
      setShowDeleteModal(false);
      closeModal();
      await loadPosts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    if (!canChangeStatus) return;
    setTogglingId(post.id);
    try {
      const next = post.status === 'active' ? 'inactive' : 'active';
      const res = await fetch(`/api/admin/blogs/${post.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Update failed.');
      await loadPosts();
    } catch {
      /* ignore */
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Blog</h1>
            <p className="text-gray-600">Create and manage articles on the public blog page.</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-lg bg-[#0F4C69] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d4259]"
          >
            Add Post
          </button>
        </div>

        <div className="mb-4">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts…"
            className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        {listError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {listError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Published</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No blog posts yet.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <Link
                        href={blogDetailPath(post.slug)}
                        target="_blank"
                        className="text-xs text-[#0F4C69] hover:underline"
                      >
                        View on site
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{post.category || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatBlogDate(post.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={!canChangeStatus || togglingId === post.id}
                        onClick={() => handleToggleStatus(post)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          post.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        } ${canChangeStatus ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      >
                        {post.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openView(post)}
                          className={adminIconActionBtn}
                          title="View"
                          aria-label="View"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(post)}
                          className={adminIconActionBtn}
                          title="Edit"
                          aria-label="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowDeleteModal(true);
                            }}
                            className={adminIconActionBtnDanger}
                            title="Delete"
                            aria-label="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminBlogModal
        open={modalMode !== null}
        mode={modalMode ?? 'view'}
        form={form}
        setForm={setForm}
        sourcePost={selectedPost}
        error={formError}
        submitting={submitting}
        onClose={closeModal}
        onSave={handleSave}
        canChangeStatus={canChangeStatus}
        categorySuggestions={categorySuggestions}
      />

      {showDeleteModal && selectedPost ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete post?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently remove &ldquo;{selectedPost.title}&rdquo;.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default BlogsAdminPage;
