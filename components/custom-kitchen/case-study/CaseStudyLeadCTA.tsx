'use client';

import React from 'react';
import Link from 'next/link';

/** Bottom conversion strip — pairs with future “Request quote” API */
const CaseStudyLeadCTA: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#0F4C69] py-14 md:py-16">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#E36630]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="container relative mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Ready for a kitchen that matches <span className="text-[#F4B08A]">your</span> operation?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-white/80">
          Share your menu, footprint, and timeline — we translate it into surveyed drawings, 3D approvals, fabricated
          stainless, and a commissioned handover like the projects above.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-[#E36630] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#cc5a2a]"
          >
            Request a consultation
          </Link>
          <Link
            href="/custom-kitchen"
            className="inline-flex items-center justify-center rounded-lg border-2 border-white/35 px-8 py-3.5 font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            More case studies
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyLeadCTA;
