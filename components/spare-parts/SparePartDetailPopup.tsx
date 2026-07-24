'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import type { SparePartSummary } from '@/lib/spareParts.types';
import { PRODUCT_PLACEHOLDER } from '@/utils/productMedia.util';

interface SparePartDetailPopupProps {
  open: boolean;
  part: SparePartSummary | null;
  price: number;
  onClose: () => void;
  onAddToCart: () => void;
  onBuyItNow: () => void;
}

export default function SparePartDetailPopup({
  open,
  part,
  price,
  onClose,
  onAddToCart,
  onBuyItNow,
}: SparePartDetailPopupProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !part) return null;

  const outOfStock = part.stock <= 0;
  const showStrike = part.originalPrice > price && price > 0;
  const image = part.images[0] ?? PRODUCT_PLACEHOLDER;
  const description = part.description?.trim();
  const specEntries = Object.entries(part.specifications ?? {}).filter(
    ([, v]) => v != null && String(v).trim() !== '',
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spare-part-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0F4C69]">Spare part</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
            <div className="relative mx-auto aspect-square w-full max-w-[280px] shrink-0 bg-[#F3F3F3] sm:mx-0 sm:w-44 md:w-52">
              <Image src={image} alt={part.name} fill className="object-contain p-4" sizes="(max-width:640px) 280px, 208px" />
              {outOfStock ? (
                <span className="absolute left-3 top-3 rounded-full bg-[#B12704] px-2.5 py-1 text-xs font-bold uppercase text-white">
                  Out of stock
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <h2 id="spare-part-detail-title" className="text-xl font-bold text-[#0F4C69] sm:text-xl">
                {part.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-lg font-normal text-[#E36630]">{price.toLocaleString()} PKR</span>
                {showStrike ? (
                  <span className="text-base text-gray-500 line-through">PKR {part.originalPrice.toLocaleString()}</span>
                ) : null}
                {showStrike ? (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">
                    {Math.round((1 - price / part.originalPrice) * 100)}% OFF
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-900">Description</h3>
                {description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{description}</p>
                ) : (
                  <p className="mt-2 text-sm italic text-gray-400">No description provided.</p>
                )}
              </div>

              {specEntries.length > 0 ? (
                <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {specEntries.map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <dt className="shrink-0 font-medium text-gray-700">{key}:</dt>
                      <dd className="text-gray-600">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={outOfStock}
              className="w-full rounded-xl bg-[#E36630] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[140px]"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={onBuyItNow}
              disabled={outOfStock}
              className="w-full rounded-xl border-2 border-[#0F4C69] px-5 py-2.5 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[140px]"
            >
              Buy it Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
