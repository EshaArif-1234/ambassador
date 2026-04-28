'use client';

import React from 'react';

export interface CaseStudyProjectMetaProps {
  clientName?: string;
  location?: string;
  sector?: string;
  completedYear?: string;
}

type Item = { label: string; value: string; icon: React.ReactNode };

const CaseStudyProjectMeta: React.FC<CaseStudyProjectMetaProps> = ({
  clientName,
  location,
  sector,
  completedYear,
}) => {
  const items: Item[] = [];
  if (clientName) {
    items.push({
      label: 'Client',
      value: clientName,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    });
  }
  if (location) {
    items.push({
      label: 'Location',
      value: location,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    });
  }
  if (sector) {
    items.push({
      label: 'Sector',
      value: sector,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    });
  }
  if (completedYear) {
    items.push({
      label: 'Completed',
      value: completedYear,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-8 lg:py-10">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F4C69]/08 text-[#0F4C69]">
                {item.icon}
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</dt>
                <dd className="mt-1 text-base font-semibold leading-snug text-gray-900">{item.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default CaseStudyProjectMeta;
