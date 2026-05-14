'use client';

import { useState } from 'react';
import Banner from '@/components/about/Banner';
import MissionVisionSection from '@/components/about/MissionVisionSection';
import MissionVisionValues from '@/components/about/MissionVisionValues';
import CompanySection from '@/components/about/CompanySection';
import TeamSection from '@/components/about/TeamSection';
import CertificatesSection from '@/components/about/CertificatesSection';
import TestimonialsSection from '@/components/about/TestimonialsSection';
import FAQSection from '@/components/about/FAQSection';
import SignupBanner from '@/components/common/signup-banner';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Banner />

      {/* 1 — white */}
      <div className="bg-white">
        <CompanySection />
      </div>

      {/* 2 — gray */}
      <div className="bg-[#E3E6E6]">
        <MissionVisionValues />
      </div>

      {/* 3 — white */}
      <div className="bg-white">
        <CertificatesSection />
      </div>

      {/* 4 — gray */}
      <div className="bg-[#E3E6E6]">
        <MissionVisionSection />
      </div>

      {/* 5 — white */}
      <div className="bg-white">
        <TestimonialsSection />
      </div>

      {/* 6 — gray */}
      <div className="bg-[#E3E6E6]">
        <FAQSection />
      </div>

      <SignupBanner />
    </div>
  );
};

export default AboutPage;
