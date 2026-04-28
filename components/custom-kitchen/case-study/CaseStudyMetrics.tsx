'use client';

import React from 'react';

interface CaseStudyMetricsProps {
  items: { value: string; label: string }[];
}

/** Key numbers — full-width band for quick scanning */
const CaseStudyMetrics: React.FC<CaseStudyMetricsProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <section className="border-y border-gray-200 bg-[#FAFAFA]" aria-labelledby="metrics-heading">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 id="metrics-heading" className="text-2xl font-bold text-gray-900 md:text-3xl">
            At a <span className="text-[#E36630]">glance</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">Quantified outcomes from this engagement</p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 md:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex flex-col justify-center bg-white px-5 py-8 text-center"
            >
              <div className="mb-2 text-2xl font-bold tabular-nums text-[#0F4C69] md:text-3xl">
                {item.value}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-[13px]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudyMetrics;
