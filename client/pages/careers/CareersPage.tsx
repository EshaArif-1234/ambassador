'use client';

import HeroSection from '@/components/careers/HeroSection';
import BenefitsSection from '@/components/careers/BenefitsSection';
import ApplyNowBanner from '@/components/careers/ApplyNowBanner';

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <BenefitsSection />
      <ApplyNowBanner />
    </div>
  );
};

export default CareersPage;
