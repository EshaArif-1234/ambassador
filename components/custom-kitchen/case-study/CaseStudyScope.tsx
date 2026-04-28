'use client';

import React from 'react';

interface CaseStudyScopeProps {
  items: string[];
}

const CaseStudyScope: React.FC<CaseStudyScopeProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <section className="bg-white" aria-labelledby="scope-heading">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl">
          <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
            <span className="h-px w-8 bg-[#0F4C69]" />
            Scope &amp; deliverables
            <span className="h-px w-8 bg-[#0F4C69]" />
          </span>
          <h2 id="scope-heading" className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">
            What we <span className="text-[#E36630]">delivered</span>
          </h2>
          <ul className="grid gap-4 sm:grid-cols-1">
            {items.map((line) => (
              <li
                key={line}
                className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-5 py-4 text-gray-800"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E36630]/15 text-[#E36630]">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyScope;
