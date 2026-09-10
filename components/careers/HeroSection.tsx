'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CAREERS_JOBS_PATH } from '@/lib/siteRoutes';

const HeroSection = () => {
  return (
    <section className="relative h-96 overflow-hidden bg-[#06131A] md:h-[560px]">
      <Image
        src="/Images/ABOUT-US-WEB-BANNER-K.png"
        alt="Join the Ambassador team"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06131A]/95 via-[#0F4C69]/55 to-[#0F4C69]/25" />
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-white md:max-w-4xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E36630]" />
              Careers
            </span>
            <h1
              className="text-3xl font-bold leading-tight md:text-5xl lg:text-[3.25rem]"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.45)' }}
            >
              Build Your Career at{' '}
              <span className="text-[#E36630]">Ambassador</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-lg">
              Join our sales, service, and operations teams across Pakistan&apos;s trusted commercial
              kitchen equipment company.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={CAREERS_JOBS_PATH}
                className="inline-flex rounded-xl bg-[#E36630] px-7 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#cc5a2a]"
              >
                View Open Positions
              </Link>
              <a
                href="mailto:info@ambassador.pk?subject=Career%20Inquiry"
                className="inline-flex rounded-xl border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Email HR Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
