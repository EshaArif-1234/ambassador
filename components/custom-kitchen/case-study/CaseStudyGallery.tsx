'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { CaseStudyGallerySection, GalleryKind } from '@/client/data/customKitchenCases';

interface CaseStudyGalleryProps {
  sections: CaseStudyGallerySection[];
}

const kindStyles: Record<
  GalleryKind,
  { badge: string; ring: string; label: string }
> = {
  '2d': {
    badge: 'bg-slate-800 text-white',
    ring: 'ring-slate-200',
    label: '2D',
  },
  '3d': {
    badge: 'bg-[#0F4C69] text-white',
    ring: 'ring-[#0F4C69]/20',
    label: '3D',
  },
  installed: {
    badge: 'bg-[#E36630] text-white',
    ring: 'ring-[#E36630]/25',
    label: 'Installed',
  },
};

const CaseStudyGallery: React.FC<CaseStudyGalleryProps> = ({ sections }) => {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption?: string } | null>(
    null
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const valid = sections.filter((s) => s.images.length > 0);
  if (valid.length === 0) return null;

  return (
    <>
      <section className="bg-white" aria-labelledby="gallery-heading">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="mb-3 inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
              <span className="h-px w-8 bg-[#0F4C69]" />
              Visual evidence
              <span className="h-px w-8 bg-[#0F4C69]" />
            </span>
            <h2 id="gallery-heading" className="text-3xl font-bold text-gray-900 md:text-4xl">
              From <span className="text-[#E36630]">design</span> to delivery
            </h2>
            <p className="mt-3 text-base text-gray-500">
              2D documentation, 3D visualization, and site photography — the same journey your project will follow.
            </p>
          </div>

          <div className="space-y-20">
            {valid.map((section) => {
              const k = kindStyles[section.kind];
              return (
                <div key={section.id}>
                  <div className="mb-8 flex flex-col gap-3 border-b border-gray-100 pb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <span
                        className={`mb-3 inline-block rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${k.badge}`}
                      >
                        {k.label}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 md:text-2xl">{section.title}</h3>
                      {section.subtitle ? (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{section.subtitle}</p>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={`grid gap-4 sm:grid-cols-2 ${
                      section.images.length >= 5 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
                    }`}
                  >
                    {section.images.map((img, idx) => (
                      <button
                        key={`${section.id}-${idx}`}
                        type="button"
                        onClick={() => setLightbox({ src: img.src, alt: img.alt, caption: img.caption })}
                        className={`group overflow-hidden rounded-xl bg-gray-100 text-left ring-1 ring-inset ${k.ring} transition-transform hover:z-10 hover:shadow-lg md:hover:-translate-y-0.5`}
                      >
                        <div className={`relative aspect-[4/3] ${section.kind === '2d' ? 'bg-[#F1F5F9]' : ''}`}>
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className={`object-cover transition-transform duration-500 group-hover:scale-[1.02] ${
                              section.kind === '2d' ? 'object-contain p-2' : ''
                            }`}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-6 opacity-0 transition-opacity group-hover:opacity-100 md:py-8">
                            <span className="text-xs font-medium text-white">View larger</span>
                          </div>
                        </div>
                        {img.caption ? (
                          <p className="border-x border-b border-gray-100 bg-white px-4 py-3 text-sm leading-snug text-gray-600">
                            {img.caption}
                          </p>
                        ) : (
                          <div className="h-px bg-gray-50" aria-hidden />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 md:right-8 md:top-8"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
          >
            Close
          </button>
          <div className="relative mt-10 w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[min(80vh,720px)] w-full">
              <Image src={lightbox.src} alt={lightbox.alt} fill className="object-contain" sizes="100vw" priority />
            </div>
            {lightbox.caption ? (
              <p className="mt-4 max-w-prose px-2 text-center text-sm text-white/85">{lightbox.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CaseStudyGallery;
