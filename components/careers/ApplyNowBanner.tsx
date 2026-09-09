'use client';

import Link from 'next/link';
import { CAREERS_JOBS_PATH } from '@/lib/siteRoutes';

const ApplyNowBanner = () => {
  return (
    <>
      <section className="bg-[#0F4C69] py-10 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold text-white md:text-xl">
            Ready to bring your talent to Pakistan&apos;s leading commercial kitchen equipment company?
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0F4C69]">Ambassador Careers</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">Apply Today</h2>
            <p className="mt-2 max-w-xl text-sm text-gray-600 md:text-base">
              Browse open roles below or send your CV to our HR team. We review applications on a rolling
              basis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={CAREERS_JOBS_PATH}
              className="rounded-xl bg-[#E36630] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#cc5a2a]"
            >
              Apply Now
            </Link>
            <a
              href="mailto:info@ambassador.pk?subject=General%20Career%20Application"
              className="rounded-xl border-2 border-[#0F4C69] px-6 py-3 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white"
            >
              Send Your CV
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default ApplyNowBanner;
