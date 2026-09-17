'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { SparePartSummary } from '@/lib/spareParts.types';
import type { SparePartVariant } from '@/lib/sparePartVariants.util';
import {
  findSparePartVariant,
  resolveSparePartVariantPricing,
  sparePartHasVariants,
} from '@/lib/sparePartVariants.util';
import { PRODUCT_PLACEHOLDER } from '@/utils/productMedia.util';

interface SparePartDetailPopupProps {
  open: boolean;
  part: SparePartSummary | null;
  onClose: () => void;
  onAddToCart: (variant?: SparePartVariant) => void;
  onBuyItNow: (variant?: SparePartVariant) => void;
}

function variantImageUrl(part: SparePartSummary, variant?: SparePartVariant): string {
  const fromVariant = variant?.image?.trim();
  if (fromVariant) return fromVariant;
  return part.images[0] ?? PRODUCT_PLACEHOLDER;
}

export default function SparePartDetailPopup({
  open,
  part,
  onClose,
  onAddToCart,
  onBuyItNow,
}: SparePartDetailPopupProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  useEffect(() => {
    if (!open || !part) {
      setSelectedVariantId('');
      return;
    }
    if (sparePartHasVariants(part)) {
      const inStock = part.variants.find((v) => resolveSparePartVariantPricing(part, v).stock > 0);
      setSelectedVariantId((inStock ?? part.variants[0])?.id ?? '');
    } else {
      setSelectedVariantId('');
    }
  }, [open, part]);

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

  const selectedVariant = useMemo(
    () => (part ? findSparePartVariant(part, selectedVariantId) : undefined),
    [part, selectedVariantId],
  );

  const pricing = useMemo(
    () => (part ? resolveSparePartVariantPricing(part, selectedVariant) : null),
    [part, selectedVariant],
  );

  const hasVariants = part ? sparePartHasVariants(part) : false;
  const variantList = part?.variants ?? [];

  const selectVariantByOffset = useCallback(
    (delta: number) => {
      if (!part || !hasVariants || variantList.length === 0) return;
      const idx = variantList.findIndex((v) => v.id === selectedVariantId);
      const current = idx >= 0 ? idx : 0;
      const next = (current + delta + variantList.length) % variantList.length;
      setSelectedVariantId(variantList[next].id);
    },
    [part, hasVariants, variantList, selectedVariantId],
  );

  if (!open || !part) return null;

  const needsVariant = hasVariants && !selectedVariant;
  const price = pricing?.price ?? part.originalPrice;
  const originalPrice = pricing?.originalPrice ?? part.originalPrice;
  const outOfStock = (pricing?.stock ?? part.stock) <= 0;
  const showStrike = originalPrice > price && price > 0;
  const image = variantImageUrl(part, selectedVariant);
  const description = part.description?.trim();
  const specEntries = Object.entries(part.specifications ?? {}).filter(
    ([, v]) => v != null && String(v).trim() !== '',
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spare-part-detail-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image — follows selected variation; arrows cycle variations */}
        <div className="relative shrink-0 border-b border-gray-200 bg-white px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
          <div className="relative mx-auto aspect-[4/3] w-full max-h-[min(58vh,520px)] overflow-hidden rounded-xl border border-gray-200 bg-white">
            <Image
              key={`${part._id}-${selectedVariantId}-${image}`}
              src={image}
              alt={
                selectedVariant
                  ? `${part.name} — ${selectedVariant.name}`
                  : part.name
              }
              fill
              className="object-contain p-3 sm:p-5"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
            {selectedVariant ? (
              <span className="absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {selectedVariant.name}
              </span>
            ) : null}
          </div>

          {hasVariants && variantList.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => selectVariantByOffset(-1)}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:border-[#0F4C69] hover:text-[#0F4C69]"
                aria-label="Previous variation"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => selectVariantByOffset(1)}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:border-[#0F4C69] hover:text-[#0F4C69]"
                aria-label="Next variation"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {hasVariants ? (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Choose variation
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {variantList.map((variant) => {
                  const variantPricing = resolveSparePartVariantPricing(part, variant);
                  const variantOut = variantPricing.stock <= 0;
                  const active = selectedVariantId === variant.id;
                  const thumb = variantImageUrl(part, variant);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={variantOut}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`flex min-w-[96px] max-w-[128px] shrink-0 flex-col overflow-hidden rounded-xl border-2 text-left transition-all ${
                        active
                          ? 'border-[#0F4C69] ring-2 ring-[#0F4C69]/20'
                          : 'border-gray-200 hover:border-[#0F4C69]/50'
                      } ${variantOut ? 'cursor-not-allowed opacity-55' : ''}`}
                    >
                      <div className="relative aspect-square w-full border-b border-gray-100 bg-white">
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-contain p-1.5"
                          sizes="88px"
                        />
                      </div>
                      <span className="truncate px-2 py-1.5 text-center text-[11px] font-semibold text-gray-800">
                        {variant.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {needsVariant ? (
                <p className="mt-2 text-xs text-amber-700">Select a variation to see price and add to cart.</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <h2
              id="spare-part-detail-title"
              className="min-w-0 flex-1 text-xl font-bold leading-snug text-[#0F4C69] sm:text-2xl"
            >
              {part.name}
            </h2>
            <div className="shrink-0 text-left sm:text-right">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:justify-end">
                <span className="text-2xl font-bold text-[#E36630] sm:text-3xl">
                  PKR {price.toLocaleString('en-PK')}
                </span>
                {showStrike ? (
                  <span className="text-base text-gray-500 line-through">
                    PKR {originalPrice.toLocaleString('en-PK')}
                  </span>
                ) : null}
                {showStrike ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    {Math.round((1 - price / originalPrice) * 100)}% OFF
                  </span>
                ) : null}
              </div>
              {hasVariants && selectedVariant ? (
                <p className="mt-1 text-xs text-gray-500">{selectedVariant.name}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</h3>
            {description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{description}</p>
            ) : (
              <p className="mt-2 text-sm italic text-gray-400">No description provided.</p>
            )}
          </div>

          {specEntries.length > 0 ? (
            <dl className="mt-4 space-y-2 rounded-xl border border-gray-100 bg-white p-4">
              {specEntries.map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <dt className="shrink-0 font-medium text-gray-700">{key}:</dt>
                  <dd className="text-gray-600">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:justify-start">
            <button
              type="button"
              onClick={() => onAddToCart(selectedVariant)}
              disabled={outOfStock || needsVariant}
              className="w-full rounded-xl bg-[#E36630] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#cc5a2a] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[130px]"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => onBuyItNow(selectedVariant)}
              disabled={outOfStock || needsVariant}
              className="w-full rounded-xl border-2 border-[#0F4C69] px-5 py-2.5 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[130px]"
            >
              Buy it Now
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:ml-auto sm:w-auto sm:min-w-[100px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
