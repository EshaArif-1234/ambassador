'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import ProductRatings, { type StarKey } from './ProductRatings';

export type RatingBreakdown = Partial<Record<StarKey, number>>;

interface FetchedSummary {
  averageRating: number;
  reviewCount: number;
  byStar: Record<StarKey, number>;
}

interface ProductRatingDropdownProps {
  /** When set, opening the dropdown loads live breakdown from the API */
  productId?: string;
  /** Optional precomputed counts (e.g. product detail page) — skips fetch */
  ratingBreakdown?: RatingBreakdown;
  averageRating?: number;
  totalReviews?: number;
  productName?: string;
  className?: string;
}

const summaryCache: Record<string, FetchedSummary> = {};

export default function ProductRatingDropdown({
  productId,
  ratingBreakdown,
  averageRating = 0,
  totalReviews = 0,
  productName = 'Product',
  className = '',
}: ProductRatingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollCloseArmedRef = useRef(false);
  const isClosingRef = useRef(false);
  const [fetched, setFetched] = useState<FetchedSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadSummary = useCallback(async (id: string) => {
    if (summaryCache[id]) {
      setFetched(summaryCache[id]);
      setFetchError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, { cache: 'no-store' });
      const json = await res.json();
      if (!json?.success || !json.data) {
        throw new Error(json?.message || 'Could not load ratings');
      }
      const data = json.data as FetchedSummary;
      summaryCache[id] = data;
      setFetched(data);
    } catch {
      setFetchError('Could not load rating details');
      setFetched(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !productId || ratingBreakdown) return;
    void loadSummary(productId);
  }, [isOpen, productId, ratingBreakdown, loadSummary]);

  const countsFromBreakdown = ratingBreakdown
    ? (Object.fromEntries(
        ([1, 2, 3, 4, 5] as StarKey[]).map((k) => [k, ratingBreakdown[k] ?? 0])
      ) as Record<StarKey, number>)
    : null;

  const displayAvg =
    ratingBreakdown != null
      ? totalReviews > 0
        ? averageRating
        : 0
      : fetched?.averageRating ?? averageRating;
  const displayTotal =
    ratingBreakdown != null ? totalReviews : fetched?.reviewCount ?? totalReviews;
  const countsForPanel = ratingBreakdown
    ? countsFromBreakdown!
    : fetched?.byStar ?? undefined;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 20 20">
            <path
              d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
              opacity="0.5"
            />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const updateDropdownPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dropdownHeight = 400;
    const dropdownWidth = 350;

    let left = rect.left;
    let top = rect.bottom + 8;

    if (left + dropdownWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - dropdownWidth - 16);
    }

    if (top + dropdownHeight > window.innerHeight - 16) {
      top = rect.top - dropdownHeight - 8;
    }

    if (left < 16) {
      left = 16;
    }

    setDropdownPosition({ top, left });
  }, []);

  const handleTriggerClick = () => {
    setIsClosing(false);
    setIsOpen((open) => !open);
  };

  const FADE_MS = 500;

  useEffect(() => {
    isClosingRef.current = isClosing;
  }, [isClosing]);

  useLayoutEffect(() => {
    if (!isOpen) {
      scrollCloseArmedRef.current = false;
      return;
    }

    updateDropdownPosition();
    scrollCloseArmedRef.current = false;
    const armId = window.setTimeout(() => {
      scrollCloseArmedRef.current = true;
    }, 120);

    const onScrollClose = () => {
      if (!scrollCloseArmedRef.current || isClosingRef.current) return;
      setIsClosing(true);
    };

    const onResize = () => {
      if (!isClosingRef.current) updateDropdownPosition();
    };

    window.addEventListener('scroll', onScrollClose, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(armId);
      window.removeEventListener('scroll', onScrollClose, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isClosing) return;
    const id = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      scrollCloseArmedRef.current = false;
    }, FADE_MS);
    return () => window.clearTimeout(id);
  }, [isClosing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setIsClosing(false);
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const showTriggerStars = displayTotal > 0;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={triggerRef}
        className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50"
        onClick={handleTriggerClick}
      >
        {showTriggerStars ? (
          renderStars(displayAvg)
        ) : (
          <span className="text-sm text-gray-500">No ratings</span>
        )}
        <div className="text-sm text-gray-600">
          {showTriggerStars ? (
            <>
              <span className="font-medium text-gray-900">{displayAvg.toFixed(1)}</span>
              <span className="text-gray-500"> ({displayTotal})</span>
            </>
          ) : (
            <span className="text-gray-500">(0)</span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen && !isClosing ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`fixed z-[9999] min-w-[320px] max-w-[400px] rounded-lg border border-gray-200 bg-white shadow-lg transition-opacity duration-500 ease-out ${
            isClosing ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="p-4">
            <div className="mb-3 border-b border-gray-200 pb-3">
              <h4 className="text-sm font-semibold text-gray-900">{productName}</h4>
              <p className="text-xs text-gray-600">Customer Reviews</p>
            </div>
            {productId && !ratingBreakdown && loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-500">Loading…</div>
            ) : productId && !ratingBreakdown && fetchError ? (
              <div className="py-6 text-center text-sm text-red-600">{fetchError}</div>
            ) : (
              <ProductRatings
                averageRating={displayAvg}
                totalReviews={displayTotal}
                countsByStar={countsForPanel}
                className="w-full border-0 p-0"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
