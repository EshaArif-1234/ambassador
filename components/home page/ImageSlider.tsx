'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { COLLECTION_PATH } from '@/lib/siteRoutes';

const SLIDE_DURATION = 8000; // ms per slide

const slides = [
  {
    id: 1,
    image: '/Images/4000-by-1800.png',
    alt: 'Premium Kitchen Equipment',
    badge: 'Industry Leading',
    title: 'Premium Commercial\nKitchen Equipment',
    subtitle: 'Engineered for performance, built for the professional kitchen — where quality meets reliability.',
    cta: 'Explore Products',
    ctaHref: COLLECTION_PATH,
    align: 'left' as const,
  },
  {
    id: 2,
    image: '/Images/40000-by-4-Simple.png',
    alt: 'Professional Restaurant Solutions',
    badge: 'Complete Kitchen Solutions',
    title: 'Professional\nRestaurant Solutions',
    subtitle: 'Everything your kitchen needs — from concept to completion, backed by 60+ years of expertise.',
    cta: 'View Catalogue',
    ctaHref: COLLECTION_PATH,
    align: 'center' as const,
  },
  {
    id: 3,
    image: '/Images/banner-3.png',
    alt: 'Commercial Kitchen Equipment Range',
    badge: 'Full Product Range',
    // title: 'Everything Your\nKitchen Demands',
    subtitle: 'From griddles to rotary rack ovens — explore our complete lineup of commercial-grade kitchen machinery.',
    cta: 'Shop Now',
    ctaHref: COLLECTION_PATH,
    align: 'left' as const,
  },

];

export default function ImageSlider() {
  const [current, setCurrent]   = useState(0);
  const [animKey, setAnimKey]   = useState(0); // forces re-mount → re-animate
  const [paused,  setPaused]    = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setAnimKey(k => k + 1);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, SLIDE_DURATION);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  const slide = slides[current];
  const isCenter = slide.align === 'center';

  return (
    <section
      className="relative w-full overflow-hidden bg-[#06131A] min-h-[360px] h-[min(52svh,480px)] md:min-h-[400px] md:h-[clamp(400px,55vw,600px)] lg:min-h-[420px] lg:h-[clamp(420px,60vw,720px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ── */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={idx !== current}
        >
          <img
            key={`img-${s.id}-${idx === current ? animKey : 0}`}
            src={s.image}
            alt={s.alt}
            className={`absolute inset-0 h-full w-full object-cover object-center ${
              idx === current ? 'slider-ken-burns' : ''
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20 md:from-black/75 md:via-black/30 md:to-black/10" />
          <div
            className={`absolute inset-0 ${
              s.align === 'center'
                ? 'bg-gradient-to-b from-black/40 via-transparent to-black/50 md:from-black/30 md:to-black/40'
                : 'bg-gradient-to-r from-black/60 via-black/20 to-transparent md:from-black/50 md:via-transparent'
            }`}
          />
        </div>
      ))}

      {/* ── Text content ── */}
      <div
        className={`relative z-20 flex h-full w-full flex-col justify-end pb-14 sm:pb-16 md:pb-20 ${
          isCenter
            ? 'items-center px-4 text-center sm:px-6'
            : 'items-start px-4 text-left sm:px-6 md:px-10 lg:px-20'
        }`}
      >
        <div key={animKey} className="w-full max-w-2xl">
          {slide.badge && (
            <span className="slider-badge mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm sm:mb-4 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-widest">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E36630] animate-pulse" />
              <span className="truncate">{slide.badge}</span>
            </span>
          )}

          {slide.title && (
            <h2 className="slider-title mb-3 text-[1.625rem] font-extrabold leading-[1.15] tracking-tight text-white whitespace-pre-line drop-shadow-lg sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {slide.title}
            </h2>
          )}

          {slide.subtitle && (
            <p className="slider-subtitle mb-5 max-w-xl text-xs leading-relaxed text-white/85 drop-shadow sm:mb-6 sm:text-sm md:mb-7 md:text-base lg:text-lg">
              {slide.subtitle}
            </p>
          )}

          {slide.cta && (
            <div
              className={`slider-cta flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3 ${
                isCenter ? 'sm:justify-center' : ''
              }`}
            >
              <Link
                href={slide.ctaHref}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E36630] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#E36630]/30 transition-all duration-300 hover:bg-[#cc5a2a] hover:shadow-[#E36630]/50 hover:gap-3 sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
              >
                {slide.cta}
                <svg className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
              >
                Learn More
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Prev / Next (tablet+) ── */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/25 md:flex md:left-4 md:h-11 md:w-11 lg:left-6 lg:h-12 lg:w-12"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white/25 md:flex md:right-4 md:h-11 md:w-11 lg:right-6 lg:h-12 lg:w-12"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Dot + progress indicators ── */}
      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:bottom-5 sm:gap-3 md:bottom-6">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === current ? 'true' : undefined}
            className={`relative h-1 overflow-hidden rounded-full transition-all duration-500 ${
              idx === current ? 'w-8 sm:w-10' : 'w-3 bg-white/30 hover:bg-white/50 sm:w-4'
            }`}
          >
            {idx === current && (
              <>
                <span className="absolute inset-0 bg-white/30 rounded-full" />
                <span
                  key={animKey}
                  className="slider-progress absolute inset-y-0 left-0 rounded-full bg-[#E36630]"
                  style={{ '--slide-duration': `${SLIDE_DURATION}ms` } as React.CSSProperties}
                />
              </>
            )}
          </button>
        ))}
      </div>

     
    </section>
  );
}
