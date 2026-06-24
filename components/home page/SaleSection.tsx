'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SaleProduct {
  _id: string;
  name: string;
  price?: number;
  originalPrice: number;
  images: string[];
  stock?: number;
  categories?: Array<{ title?: string }>;
}

const DEFAULT_IMAGE = '/Images/home/stainless-steal.webp';
const SALE_LIMIT = 24;
const SCROLL_PX_PER_SEC = 50;

function displayPrice(p: SaleProduct): number {
  return p.price != null && p.price > 0 ? p.price : p.originalPrice;
}

function discountPercent(p: SaleProduct): number {
  const sale = displayPrice(p);
  if (p.originalPrice <= 0 || sale >= p.originalPrice) return 0;
  return Math.round((1 - sale / p.originalPrice) * 100);
}

function categoryTitle(cats?: SaleProduct['categories']): string {
  return cats?.[0]?.title ?? '';
}

function SaleProductCard({ product }: { product: SaleProduct }) {
  const salePrice = displayPrice(product);
  const pct = discountPercent(product);
  const hasDiscount = pct > 0;
  const outOfStock = (product.stock ?? 0) <= 0;
  const image = product.images?.[0] || DEFAULT_IMAGE;
  const category = categoryTitle(product.categories);

  return (
    <article
      data-sale-card
      className="group relative w-[17rem] shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/95 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
    >
      <Link href={`/products/${product._id}`} className="relative block h-48 overflow-hidden bg-[#EEF5F9]">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="272px"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-[#E36630] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
            {pct}% OFF
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-gray-900/75 px-2.5 py-1 text-[10px] font-semibold text-white">
            Out of Stock
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
      </Link>

      <div className="flex flex-col gap-3 p-4">
        {category ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0F4C69]/70">
            {category}
          </p>
        ) : null}
        <Link href={`/products/${product._id}`}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#E36630]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-[#E36630]">
            PKR {salePrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              PKR {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <Link
          href={`/products/${product._id}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0F4C69] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0d3d55]"
        >
          Shop Now
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export default function SaleSection() {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const slideStepRef = useRef(292);
  const lastFrameRef = useRef(0);

  const canLoop = products.length > 1;
  const loopProducts = canLoop ? [...products, ...products] : products;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          sale: '1',
          limit: String(SALE_LIMIT),
          sort: 'newest',
        });
        const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          const sorted = [...(json.data as SaleProduct[])].sort(
            (a, b) => discountPercent(b) - discountPercent(a)
          );
          setProducts(sorted);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const applyTransform = useCallback((offset: number) => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(-${offset}px, 0, 0)`;
    }
  }, []);

  const measureTrack = useCallback(() => {
    const track = trackRef.current;
    if (!track || !canLoop) return;

    const totalWidth = track.scrollWidth;
    loopWidthRef.current = totalWidth / 2;

    const card = track.querySelector<HTMLElement>('[data-sale-card]');
    if (card) {
      const gap = parseFloat(getComputedStyle(track).gap || '20');
      slideStepRef.current = card.offsetWidth + gap;
    }

    const loopWidth = loopWidthRef.current;
    if (loopWidth > 0 && offsetRef.current >= loopWidth) {
      offsetRef.current %= loopWidth;
      applyTransform(offsetRef.current);
    }
  }, [canLoop, applyTransform]);

  useEffect(() => {
    if (loading || !canLoop) return;
    measureTrack();

    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(measureTrack);
    observer.observe(track);
    return () => observer.disconnect();
  }, [loading, canLoop, products, measureTrack]);

  useEffect(() => {
    if (!canLoop || paused || loading) return;

    let raf = 0;

    const tick = (now: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      const loopWidth = loopWidthRef.current;
      if (loopWidth > 0) {
        offsetRef.current += (SCROLL_PX_PER_SEC * delta) / 1000;
        if (offsetRef.current >= loopWidth) {
          offsetRef.current -= loopWidth;
        }
        applyTransform(offsetRef.current);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastFrameRef.current = 0;
    };
  }, [canLoop, paused, loading, applyTransform]);

  const nudge = useCallback((dir: 'left' | 'right') => {
    const loopWidth = loopWidthRef.current;
    if (loopWidth <= 0) return;

    const step = slideStepRef.current;
    offsetRef.current += dir === 'right' ? step : -step;

    if (offsetRef.current >= loopWidth) offsetRef.current -= loopWidth;
    if (offsetRef.current < 0) offsetRef.current += loopWidth;

    applyTransform(offsetRef.current);
  }, [applyTransform]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a3d52] via-[#0F4C69] to-[#0c3548] py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#E36630]/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mb-8 flex flex-col items-center gap-6 text-center md:mb-10">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E36630]/40 bg-[#E36630]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#ffb48a]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E36630] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E36630]" />
              </span>
              Limited Time Offers
            </span>
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              Hot Deals on{' '}
              <span className="text-[#E36630]">
                <br />Premium Equipment
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
              Grab exclusive discounts on commercial kitchen essentials — while stocks last.
            </p>
          </div>

          <Link
            href="/products?features=on_sale"
            className="inline-flex items-center gap-2 rounded-full bg-[#E36630] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E36630]/30 transition-all hover:bg-[#cc5a2a] hover:shadow-[#E36630]/40"
          >
            View All Sales
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex w-full gap-5 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[22rem] w-[17rem] shrink-0 animate-pulse rounded-2xl border border-white/10 bg-white/10 first:ml-4 last:mr-4 sm:first:ml-6 sm:last:mr-6"
            />
          ))}
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="relative w-full overflow-hidden pb-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-10 bg-gradient-to-r from-[#0c3548] to-transparent sm:w-16"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-10 bg-gradient-to-l from-[#0a3d52] to-transparent sm:w-16"
            aria-hidden
          />

          {canLoop && (
            <>
              <button
                type="button"
                onClick={() => nudge('left')}
                aria-label="Previous sale product"
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#0F4C69]/90 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-[#E36630] sm:left-5 sm:h-11 sm:w-11 md:left-6"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => nudge('right')}
                aria-label="Next sale product"
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#0F4C69]/90 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-[#E36630] sm:right-5 sm:h-11 sm:w-11 md:right-6"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <div
            ref={trackRef}
            className="flex w-max gap-5 pl-4 sm:pl-6"
            style={{ willChange: canLoop ? 'transform' : undefined }}
          >
            {loopProducts.map((product, index) => (
              <SaleProductCard key={`${product._id}-${index}`} product={product} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
