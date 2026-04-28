'use client';

import React from 'react';
import type { CustomKitchenCaseStudy } from '@/client/data/customKitchenCases';
import CaseStudyHero from '@/components/custom-kitchen/case-study/CaseStudyHero';
import CaseStudyProjectMeta from '@/components/custom-kitchen/case-study/CaseStudyProjectMeta';
import CaseStudyMetrics from '@/components/custom-kitchen/case-study/CaseStudyMetrics';
import OverviewSection from '@/components/custom-kitchen/OverviewSection';
import CaseStudyScope from '@/components/custom-kitchen/case-study/CaseStudyScope';
import CaseStudyChallengeSolution from '@/components/custom-kitchen/case-study/CaseStudyChallengeSolution';
import CaseStudyGallery from '@/components/custom-kitchen/case-study/CaseStudyGallery';
import CaseStudyLeadCTA from '@/components/custom-kitchen/case-study/CaseStudyLeadCTA';

export interface CaseStudyDetailViewProps {
  study: CustomKitchenCaseStudy;
}

export default function CaseStudyDetailView({ study }: CaseStudyDetailViewProps) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <CaseStudyHero
        title={study.heroTitle}
        subtitle={study.heroSubtitle}
        imageSrc={study.heroImage}
        imageAlt={study.cardAlt}
        clientName={study.clientName}
      />

      <CaseStudyProjectMeta
        clientName={study.clientName}
        location={study.location}
        sector={study.sector}
        completedYear={study.completedYear}
      />

      <CaseStudyMetrics items={study.highlights} />

      <OverviewSection
        body={study.overview}
        heading="Executive summary"
        kicker="Overview"
      />

      <CaseStudyScope items={study.scope ?? []} />
      <CaseStudyChallengeSolution challenge={study.challenge} solution={study.solution} />

      <CaseStudyGallery sections={study.gallerySections} />

      <CaseStudyLeadCTA />
    </div>
  );
}
