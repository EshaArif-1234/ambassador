'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import CartPopup from '@/components/products/CartPopup';
import SparePartDetailPopup from '@/components/spare-parts/SparePartDetailPopup';
import PageLoader from '@/components/ui/PageLoader';
import { PRODUCT_PLACEHOLDER } from '@/utils/productMedia.util';
import type { SparePartSummary } from '@/lib/spareParts.types';

const PAGE_SIZE = 12;

function partPrice(part: SparePartSummary) {
  return part.price != null && part.price > 0 ? part.price : part.originalPrice;
}

function SparePartCard({
  part,
  onOpen,
  onAddToCart,
  onBuyItNow,
}: {
  part: SparePartSummary;
  onOpen: () => void;
  onAddToCart: () => void;
  onBuyItNow: () => void;
}) {
  const outOfStock = part.stock <= 0;
  const price = partPrice(part);
  const showStrike = part.originalPrice > price && price > 0;
  const image = part.images[0] ?? PRODUCT_PLACEHOLDER;

  return (
    <article
      className="flex h-full w-full cursor-pointer flex-col overflow-hidden border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${part.name}`}
    >
      <div className="relative aspect-square w-full bg-[#F3F3F3]">
        <Image
          src={image}
          alt={part.name}
          fill
          className="object-contain p-2"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
        />
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-[#B12704] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 lg:p-3">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#0F4C69] lg:text-xl">{part.name}</h3>

        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#0F4C69]">
          <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1v8a2 2 0 01-2 2h-4a2 2 0 01-2-2v-8H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
            />
          </svg>
          Spare part
        </span>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
          <span className="text-base font-normal text-[#E36630] lg:text-lg">PKR {price.toLocaleString()}</span>
          {showStrike ? (
            <span className="text-xs text-gray-500 line-through sm:text-sm">
              PKR {part.originalPrice.toLocaleString()}
            </span>
          ) : null}
          {showStrike ? (
            <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
              {Math.round((1 - price / part.originalPrice) * 100)}% OFF
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-row gap-1.5 pt-2 lg:gap-2 lg:pt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={outOfStock}
            className="min-w-0 flex-1 rounded-lg bg-[#E36630] px-1.5 py-1.5 text-[10px] font-bold leading-tight text-white shadow-sm transition-colors hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-40 lg:px-2 lg:text-[11px]"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBuyItNow();
            }}
            disabled={outOfStock}
            className="min-w-0 flex-1 rounded-lg border-2 border-[#0F4C69] px-1.5 py-1.5 text-[10px] font-semibold leading-tight text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 lg:px-2 lg:text-[11px]"
          >
            Buy it Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default function SparePartsPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [items, setItems] = useState<SparePartSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addedPart, setAddedPart] = useState<SparePartSummary | null>(null);
  const [detailPart, setDetailPart] = useState<SparePartSummary | null>(null);

  const fetchParts = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      if (q.trim()) params.set('search', q.trim());

      const res = await fetch(`/api/spare-parts?${params}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Could not load spare parts.');
      }

      setItems(json.items ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } catch (err) {
      setItems([]);
      setError((err as Error).message || 'Could not load spare parts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchParts(page, searchTerm);
  }, [page, searchTerm, fetchParts]);

  const buildCartItem = (part: SparePartSummary) => ({
    id: part._id,
    title: part.name,
    price: partPrice(part),
    quantity: 1,
    image: part.images[0] ?? PRODUCT_PLACEHOLDER,
    productCode: part.slug,
  });

  const handleAddToCart = (part: SparePartSummary) => {
    addToCart(buildCartItem(part));
    setAddedPart(part);
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 3000);
  };

  const handleBuyItNow = (part: SparePartSummary) => {
    if (part.stock <= 0) return;
    addToCart(buildCartItem(part));
    router.push('/checkout');
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  if (error && !loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            type="button"
            onClick={() => fetchParts(1, searchTerm)}
            className="rounded-lg bg-[#E36630] px-4 py-2 text-white hover:bg-[#cc5a2a]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="sticky top-28 z-20 shrink-0 border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-[1600px] px-4">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-[1.25rem] text-sm text-gray-600">
              {!loading && (
                <>
                  {searchTerm.trim() ? (
                    <>
                      <span className="font-semibold">
                        {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                      </span>{' '}
                      of <span className="font-semibold">{total}</span> results for{' '}
                      <span className="font-semibold text-gray-800">&quot;{searchTerm.trim()}&quot;</span>
                    </>
                  ) : (
                    <>
                      Showing{' '}
                      <span className="font-semibold">
                        {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                      </span>{' '}
                      of <span className="font-semibold">{total}</span> spare parts
                    </>
                  )}
                </>
              )}
            </div>
            <p className="text-sm font-semibold text-[#0F4C69]">Spare Parts</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex max-w-[1600px] flex-1 flex-col">
        <div className="flex flex-1 flex-col lg:flex-row lg:items-stretch">
          <aside className="w-full shrink-0 border-b border-gray-200 px-4 py-4 lg:w-60 lg:border-b-0 lg:border-r lg:px-5 xl:w-64">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-bold text-gray-900">Search</h2>
              <button
                type="button"
                onClick={clearSearch}
                className="text-xs font-medium text-[#0F4C69] hover:text-[#E36630] hover:underline"
              >
                Clear
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchTerm(searchInput.trim());
              }}
            >
              <label htmlFor="spare-parts-search" className="mb-2 block text-sm font-bold text-gray-900">
                Find a part
              </label>
              <input
                id="spare-parts-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#E36630] focus:ring-2 focus:ring-[#E36630]/35"
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-[#E36630] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#cc5a2a]"
              >
                Search
              </button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-gray-500">
              Genuine Ambassador spare parts. Add to cart or buy now — checkout works the same as products.
            </p>
          </aside>

          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6">
            <h2 className="text-lg font-bold text-gray-900">Results</h2>
            <p className="mt-1 text-xs text-gray-500">
              Prices and availability may vary. Contact us if you need help finding a specific part.
            </p>

            {loading ? (
              <PageLoader message="Loading spare parts…" fullScreen={false} className="min-h-[280px] bg-white" />
            ) : items.length > 0 ? (
              <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {items.map((part) => (
                  <li key={part._id} className="min-w-0">
                    <SparePartCard
                      part={part}
                      onOpen={() => setDetailPart(part)}
                      onAddToCart={() => handleAddToCart(part)}
                      onBuyItNow={() => handleBuyItNow(part)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 border-t border-gray-200 py-16 text-center">
                <div className="mb-2 text-lg font-medium text-gray-800">No spare parts found</div>
                <p className="text-sm text-gray-500">Try adjusting your search terms</p>
              </div>
            )}

            {!loading && totalPages > 1 && (() => {
              const getPages = (): (number | '…')[] => {
                if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                const pages: (number | '…')[] = [1];
                if (page > 3) pages.push('…');
                for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                if (page < totalPages - 2) pages.push('…');
                pages.push(totalPages);
                return pages;
              };
              return (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => {
                      setPage((p) => p - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#E36630] hover:text-[#E36630] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {getPages().map((p, idx) =>
                      p === '…' ? (
                        <span key={`ellipsis-${idx}`} className="select-none px-2 py-2 text-sm text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setPage(p as number);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`min-h-[36px] min-w-[36px] rounded-lg text-sm font-semibold transition-colors ${
                            page === p
                              ? 'bg-[#E36630] text-white'
                              : 'border border-gray-200 bg-white text-gray-700 hover:border-[#E36630] hover:text-[#E36630]'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => {
                      setPage((p) => p + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#E36630] hover:text-[#E36630] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              );
            })()}
          </main>
        </div>
      </div>

      <SparePartDetailPopup
        open={detailPart != null}
        part={detailPart}
        price={detailPart ? partPrice(detailPart) : 0}
        onClose={() => setDetailPart(null)}
        onAddToCart={() => {
          if (!detailPart) return;
          handleAddToCart(detailPart);
          setDetailPart(null);
        }}
        onBuyItNow={() => {
          if (!detailPart) return;
          setDetailPart(null);
          handleBuyItNow(detailPart);
        }}
      />

      <CartPopup
        show={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        product={
          addedPart
            ? {
                title: addedPart.name,
                images: addedPart.images.length ? addedPart.images : [PRODUCT_PLACEHOLDER],
                specifications: addedPart.specifications,
                price: partPrice(addedPart),
              }
            : undefined
        }
      />
    </div>
  );
}
