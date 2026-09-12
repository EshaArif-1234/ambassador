'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BlogPost } from '@/lib/blog.types';
import { BLOG_PAGE_SIZE } from '@/lib/blog.types';
import BlogCard from '@/components/blog/BlogCard';

function blogPaginationPages(currentPage: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (currentPage > 3) pages.push('…');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push('…');
  pages.push(totalPages);
  return pages;
}

const BlogGridSection = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      params.set('page', String(currentPage));
      params.set('limit', String(BLOG_PAGE_SIZE));
      const res = await fetch(`/api/blogs?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load blog posts.');
      setPosts(Array.isArray(json.data) ? json.data : []);
      setCategories(Array.isArray(json.filters?.categories) ? json.filters.categories : []);
      const pagination = json.pagination;
      if (pagination && typeof pagination.total === 'number') {
        setTotal(pagination.total);
        setTotalPages(Math.max(1, pagination.totalPages ?? 1));
      } else {
        setTotal(Array.isArray(json.data) ? json.data.length : 0);
        setTotalPages(1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load blog posts.');
      setPosts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [search, category, currentPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPosts();
    }, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [loadPosts, search]);

  const hasActiveFilters = Boolean(search.trim() || category);

  const resultLabel = useMemo(() => {
    if (loading) return 'Loading articles…';
    if (total === 0) return '0 articles';
    const start = (currentPage - 1) * BLOG_PAGE_SIZE + 1;
    const end = Math.min(currentPage * BLOG_PAGE_SIZE, total);
    if (total === 1) return '1 article';
    if (totalPages > 1) return `Showing ${start}–${end} of ${total} articles`;
    return `${total} articles`;
  }, [loading, total, currentPage, totalPages]);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    scrollToGrid();
  };

  return (
    <section ref={gridRef} className="scroll-mt-28 bg-[#FAFAFA] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Latest Articles</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
            Browse guides and updates from our commercial kitchen equipment specialists.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:p-5">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Search</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or topic…"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#0F4C69] focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20"
            />
          </div>
          <div className="w-full md:w-56">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#0F4C69] focus:outline-none focus:ring-2 focus:ring-[#0F4C69]/20"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-6 text-sm font-medium text-gray-500">{resultLabel}</p>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-800">
              {hasActiveFilters ? 'No matching articles' : 'No articles yet'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try a different search or category.'
                : 'Check back soon for new posts from the Ambassador team.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#E36630] hover:text-[#E36630] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {blogPaginationPages(currentPage, totalPages).map((page, idx) =>
                    page === '…' ? (
                      <span key={`ellipsis-${idx}`} className="select-none px-2 py-2 text-sm text-gray-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`min-h-[36px] min-w-[36px] rounded-lg text-sm font-semibold transition-colors ${
                          currentPage === page
                            ? 'bg-[#E36630] text-white'
                            : 'border border-gray-200 bg-white text-gray-700 hover:border-[#E36630] hover:text-[#E36630]'
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#E36630] hover:text-[#E36630] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
};

export default BlogGridSection;
