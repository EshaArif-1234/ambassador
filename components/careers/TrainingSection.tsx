'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CAREERS_JOBS_PATH } from '@/lib/siteRoutes';

const TrainingSection = () => {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
            <span className="h-px w-8 bg-[#0F4C69]" />
            Grow With Us
            <span className="h-px w-8 bg-[#0F4C69]" />
          </span>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Learn a Career &{' '}
            <span className="text-[#E36630]">Grow With Ambassador</span>
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#E36630]" />
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/Images/installed.webp"
              alt="Ambassador training and kitchen equipment expertise"
              width={640}
              height={420}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-base leading-relaxed text-gray-600">
              Whether you join our sales floor, service team, or back office, Ambassador invests in
              practical training so you understand the products, customers, and standards that define
              our brand.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              New hires receive onboarding on commercial kitchen equipment, customer handling, and
              internal processes. High performers get opportunities to lead projects, manage branches,
              and specialize in technical or commercial roles.
            </p>
            <Link
              href={CAREERS_JOBS_PATH}
              className="mt-6 inline-flex rounded-xl bg-[#E36630] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cc5a2a]"
            >
              Explore Open Roles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingSection;
