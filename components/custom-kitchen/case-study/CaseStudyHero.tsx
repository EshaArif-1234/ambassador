'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface CaseStudyHeroProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  /** Short label under eyebrow, e.g. client name */
  clientName?: string;
}

const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  clientName,
}) => {
  return (
    <header className="relative min-h-[24rem] overflow-hidden md:min-h-[32rem] lg:min-h-[36rem]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        style={{ objectPosition: 'center center' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/40" />
      <div className="absolute inset-0 bg-[#0F4C69]/35" />

      <div className="relative z-10 flex min-h-[24rem] flex-col pb-12 pt-8 md:min-h-[32rem] md:pb-16 lg:min-h-[36rem] lg:justify-end lg:pb-20">
        <div className="container mx-auto flex w-full flex-1 flex-col justify-between gap-10 px-4 lg:flex-none lg:justify-end">
          <nav className="text-sm text-white/70" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/custom-kitchen" className="transition-colors hover:text-white">
                  Custom kitchen
                </Link>
              </li>
              <li className="text-white/40" aria-hidden>
                /
              </li>
              <li className="font-medium text-white/95">Case study</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F4B08A]">
                Case study
              </span>
              {clientName ? (
                <span className="text-sm font-medium text-white/90">{clientName}</span>
              ) : null}
            </div>
            <h1 className="mb-5 text-3xl font-bold leading-[1.12] tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/88 md:text-xl">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CaseStudyHero;
