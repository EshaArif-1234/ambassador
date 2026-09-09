'use client';

import Link from 'next/link';
import JobListingsSection from '@/components/careers/JobListingsSection';
import SignupBanner from '@/components/common/signup-banner';
import { CAREERS_PATH } from '@/lib/siteRoutes';

const JobOpportunitiesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-[#0F4C69] py-10 md:py-12">
        <div className="container mx-auto px-4">
          <Link
            href={CAREERS_PATH}
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white"
          >
            ← Back to Careers
          </Link>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Current Job Opportunities</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            Browse open roles across sales, service, operations, and corporate teams at Ambassador.
            Select a position to view details and apply.
          </p>
        </div>
      </section>

      <JobListingsSection compactHeader />
      <SignupBanner />
    </div>
  );
};

export default JobOpportunitiesPage;
