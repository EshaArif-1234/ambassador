'use client';

import React from 'react';

interface CaseStudyChallengeSolutionProps {
  challenge?: string;
  solution?: string;
}

const CaseStudyChallengeSolution: React.FC<CaseStudyChallengeSolutionProps> = ({ challenge, solution }) => {
  if (!challenge && !solution) return null;

  return (
    <section className="border-y border-gray-100 bg-[#FAFAFA]" aria-labelledby="challenge-heading">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 id="challenge-heading" className="text-2xl font-bold text-gray-900 md:text-3xl">
            Challenge &amp; <span className="text-[#E36630]">response</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">How we aligned engineering with real-site constraints</p>
        </div>
        <div className="mx-auto grid gap-6 lg:grid-cols-2 lg:gap-8">
          {challenge ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0F4C69]">Challenge</p>
              <p className="leading-relaxed text-gray-700">{challenge}</p>
            </div>
          ) : null}
          {solution ? (
            <div className="rounded-2xl border border-[#E36630]/25 bg-white p-8 shadow-sm ring-1 ring-[#E36630]/10">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#E36630]">Our response</p>
              <p className="leading-relaxed text-gray-700">{solution}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default CaseStudyChallengeSolution;
