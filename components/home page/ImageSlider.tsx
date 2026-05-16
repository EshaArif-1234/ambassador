'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

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
    ctaHref: '/products',
    align: 'left' as const,
  },
  {
    id: 2,
    image: '/Images/40000-by-4-simple.png',
    alt: 'Professional Restaurant Solutions',
    badge: 'Complete Kitchen Solutions',
    title: 'Professional\nRestaurant Solutions',
    subtitle: 'Everything your kitchen needs — from concept to completion, backed by 15+ years of expertise.',
    cta: 'View Catalogue',
    ctaHref: '/products',
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
    ctaHref: '/products',
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
      className="relative w-full overflow-hidden bg-[#06131A]"
      style={{ height: 'clamp(420px, 60vw, 720px)' }}
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
          {/* Ken-Burns image */}
          <img
            key={`img-${s.id}-${idx === current ? animKey : 0}`}
            src={s.image}
            alt={s.alt}
            className={`absolute inset-0 h-full w-full object-cover object-center ${idx === current ? 'slider-ken-burns' : ''}`}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </div>
      ))}

      {/* ── Text content ── */}
      <div className={`relative z-20 flex h-full flex-col justify-end pb-16 sm:pb-20 ${isCenter ? 'items-center text-center px-6' : 'items-start text-left px-6 sm:px-12 lg:px-20'}`}>
        <div key={animKey} className="max-w-2xl">

          {/* Badge */}
          {slide.badge && (
            <span className="slider-badge inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E36630] animate-pulse" />
              {slide.badge}
            </span>
          )}

          {/* Title */}
          {slide.title && (
            <h2 className="slider-title text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl whitespace-pre-line mb-4 drop-shadow-lg">
              {slide.title}
            </h2>
          )}

          {/* Subtitle */}
          {slide.subtitle && (
            <p className="slider-subtitle text-sm text-white/80 leading-relaxed sm:text-base lg:text-lg max-w-xl mb-7 drop-shadow">
              {slide.subtitle}
            </p>
          )}

          {/* CTA */}
          {slide.cta && (
          <div className={`slider-cta flex flex-wrap gap-3 ${isCenter ? 'justify-center' : ''}`}>
            <Link
              href={slide.ctaHref}
              className="group inline-flex items-center gap-2 rounded-full bg-[#E36630] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#E36630]/30 transition-all duration-300 hover:bg-[#cc5a2a] hover:shadow-[#E36630]/50 hover:gap-3"
            >
              {slide.cta}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
            >
              Learn More
            </Link>
          </div>
          )}
        </div>
      </div>

      {/* ── Prev / Next ── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-110 sm:left-6 sm:h-12 sm:w-12"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-110 sm:right-6 sm:h-12 sm:w-12"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ── Dot + progress indicators ── */}
      <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`relative h-1 overflow-hidden rounded-full transition-all duration-500 ${
              idx === current ? 'w-10' : 'w-4 bg-white/30 hover:bg-white/50'
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

      {/* ── Slide counter ── */}
      <div className="absolute bottom-6 right-6 z-30 text-xs font-semibold text-white/60 tabular-nums">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </section>
  );
}
