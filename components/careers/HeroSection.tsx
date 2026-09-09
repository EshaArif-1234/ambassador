'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CAREERS_JOBS_PATH } from '@/lib/siteRoutes';

const HeroSection = () => {
  return (
    <section className="relative h-[420px] overflow-hidden bg-[#06131A] md:h-[520px]">
      <Image
        src="/Images/ABOUT-US-WEB-BANNER-K.png"
        alt="Join the Ambassador team"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E36630]" />
            Careers at Ambassador
          </span>
          <h1
            className="mb-5 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          >
            Join Our Growing{' '}
            <span className="text-[#E36630]">Team</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            Build your career with Pakistan&apos;s trusted commercial kitchen equipment partner — sales,
            service, operations, and more across our nationwide showrooms.
          </p>
          <Link
            href={CAREERS_JOBS_PATH}
            className="inline-flex rounded-xl bg-[#E36630] px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#cc5a2a] md:text-base"
          >
            View Job Openings
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
