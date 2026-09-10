'use client';

import Link from 'next/link';
import { CAREERS_JOBS_PATH } from '@/lib/siteRoutes';

const ApplyNowBanner = () => {
  return (
    <section className="bg-[#0F4C69] py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center md:flex-row md:p-8 md:text-left">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E36630]">Ready to apply?</p>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Start your journey with us</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
              Explore current openings or send your CV to{' '}
              <a href="mailto:info@ambassador.pk" className="font-semibold text-white hover:underline">
                info@ambassador.pk
              </a>
              . Our HR team reviews applications on a rolling basis.
            </p>
          </div>
          <Link
            href={CAREERS_JOBS_PATH}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#E36630] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#cc5a2a]"
          >
            View Job Openings
          </Link>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-white/55">
          Ambassador is an equal opportunity employer. Hiring decisions are based on qualifications,
          experience, and role requirements.
        </p>
      </div>
    </section>
  );
};

export default ApplyNowBanner;
