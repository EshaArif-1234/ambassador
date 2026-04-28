'use client';

import React from 'react';

interface OverviewSectionProps {
  body: string;
  heading?: string;
  kicker?: string;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  body,
  heading = 'Executive summary',
  kicker = 'Overview',
}) => {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl">
          <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
            <span className="h-px w-8 bg-[#0F4C69]" />
            {kicker}
            <span className="h-px w-8 bg-[#0F4C69]" />
          </span>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">{heading}</h2>
          <p className="leading-relaxed text-gray-700 md:text-lg">{body}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
