'use client';

import { useState } from 'react';
import Banner from '@/components/about/Banner';
import MissionVisionSection from '@/components/about/MissionVisionSection';
import CompanySection from '@/components/about/CompanySection';
import TeamSection from '@/components/about/TeamSection';
import CertificatesSection from '@/components/about/CertificatesSection';
import TestimonialsSection from '@/components/about/TestimonialsSection';
import FAQSection from '@/components/about/FAQSection';

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Banner />
      
      <div className="bg-gray-50">
        <CompanySection />
      </div>
      {/* <div className="bg-white">
        <TeamSection />
      </div> */}
      <div className="bg-white">
        <CertificatesSection />
      </div>
      <div className="bg-gray-50">
        <MissionVisionSection />
      </div>
      <div className="bg-white">
        <TestimonialsSection />
      </div>
      <div className="bg-gray-50">
        <FAQSection />
      </div>
    </div>
  );
};

export default AboutPage;
