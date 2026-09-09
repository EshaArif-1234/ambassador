'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CareerJob } from '@/lib/careers.types';
import JobApplicationModal from '@/components/careers/JobApplicationModal';
import SignupBanner from '@/components/common/signup-banner';
import { CAREERS_JOBS_PATH } from '@/lib/siteRoutes';

interface JobDetailPageProps {
  job: CareerJob;
}

const JobDetailPage = ({ job }: JobDetailPageProps) => {
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-100 bg-[#FAFAFA] py-10 md:py-12">
        <div className="container mx-auto px-4">
          <Link
            href={CAREERS_JOBS_PATH}
            className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#0F4C69] hover:text-[#E36630]"
          >
            ← Back to all jobs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{job.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.isHot ? (
              <span className="rounded-full bg-[#FDE8E8] px-2.5 py-0.5 text-[11px] font-bold uppercase text-[#B12704]">
                Hot Job
              </span>
            ) : null}
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
              {job.type}
            </span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
              {job.department}
            </span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
              {job.workEnvironment}
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-gray-800 md:text-base">{job.location}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">{job.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="rounded-xl bg-[#E36630] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cc5a2a]"
            >
              Apply for This Job
            </button>
            <Link
              href={CAREERS_JOBS_PATH}
              className="rounded-xl border-2 border-[#0F4C69] px-6 py-2.5 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white"
            >
              View Other Openings
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">About the Role</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">{job.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Responsibilities</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 md:text-base">
                {job.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Requirements</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 md:text-base">
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">Job Overview</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Department</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{job.department}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{job.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Position Type</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{job.type}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Work Environment</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{job.workEnvironment}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Education</dt>
                <dd className="mt-0.5 font-medium text-gray-800">{job.educationLevel}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#0F4C69] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0d4259]"
            >
              Apply Now
            </button>
          </aside>
        </div>
      </section>

      <SignupBanner />

      <JobApplicationModal job={applyOpen ? job : null} onClose={() => setApplyOpen(false)} />
    </div>
  );
};

export default JobDetailPage;
