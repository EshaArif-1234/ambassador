'use client';

import HeroSection from '@/components/careers/HeroSection';
import QuickConnectBanner from '@/components/careers/QuickConnectBanner';
import CultureSections from '@/components/careers/CultureSections';
import BenefitsSection from '@/components/careers/BenefitsSection';
import ApplyNowBanner from '@/components/careers/ApplyNowBanner';
import EqualOpportunitySection from '@/components/careers/EqualOpportunitySection';
import TalentCommunityBanner from '@/components/careers/TalentCommunityBanner';
import TrainingSection from '@/components/careers/TrainingSection';
import CareersTestimonial from '@/components/careers/CareersTestimonial';
import SignupBanner from '@/components/common/signup-banner';

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <QuickConnectBanner />
      <CultureSections />
      <BenefitsSection />
      <ApplyNowBanner />
      <EqualOpportunitySection />
      <TalentCommunityBanner />
      <TrainingSection />
      <CareersTestimonial />
      <SignupBanner />
    </div>
  );
};

export default CareersPage;
