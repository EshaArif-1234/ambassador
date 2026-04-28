'use client';

import React from 'react';

/** Generic value section — same pillars for every case; scope is project-specific in Overview. */
const ConsultationSection: React.FC = () => {
  return (
    <div className="bg-[#FAFAFA] border-y border-gray-100">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
            <span className="h-px w-8 bg-[#0F4C69]" />
            What we assess
            <span className="h-px w-8 bg-[#0F4C69]" />
          </span>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Consultation <span className="text-[#E36630]">&amp; feasibility</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-[#0F4C69]">Initial assessment</h3>
            <p className="mb-5 leading-relaxed text-gray-700">
              Site surveys, ingress rules, drains, grease paths, ventilation capacity, utilities, and throughput targets —
              documented before pencil hits CAD.
            </p>
            <ul className="space-y-3 text-gray-600">
              {['Measurements & obstruction survey', 'Menu mix & hourly volume', 'CAPEX envelope & phased delivery'].map(
                (t) => (
                  <li key={t} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-[#0F4C69]">Design output</h3>
            <p className="mb-5 leading-relaxed text-gray-700">
              You receive labelled 2D plan sets plus 3D visuals for sign-off — then fabrication queues against approved BoM &
              elevations.
            </p>
            <ul className="space-y-3 text-gray-600">
              {['Equipment BoM synced to ducts & civils', 'Exhaust / cold chain duty calculations', 'Install window & snag plan'].map(
                (t) => (
                  <li key={t} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#0F4C69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSection;
