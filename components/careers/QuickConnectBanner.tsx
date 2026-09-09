'use client';

import Link from 'next/link';
import { CAREERS_JOBS_PATH } from '@/lib/siteRoutes';

const QuickConnectBanner = () => {
  return (
    <section className="bg-[#0F4C69] py-5">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <p className="text-center text-sm text-white/85 md:text-left md:text-base">
          <span className="font-semibold text-white">Connect with us</span> — questions about working at
          Ambassador? Our HR team is happy to help.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:info@ambassador.pk?subject=Careers%20Inquiry"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Email HR
          </a>
          <Link
            href={CAREERS_JOBS_PATH}
            className="rounded-xl bg-[#E36630] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#cc5a2a]"
          >
            View Jobs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default QuickConnectBanner;
