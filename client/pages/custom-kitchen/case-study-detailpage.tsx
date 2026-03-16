'use client';

import React from 'react';
import HeroSection from '@/components/custom-kitchen/HeroSection';
import OverviewSection from '@/components/custom-kitchen/OverviewSection';
import StepsSection from '@/components/custom-kitchen/StepsSection';
import ImageSlider from '@/components/custom-kitchen/ImageSlider';
import ConsultationSection from '@/components/custom-kitchen/ConsultationSection';
import ProjectHighlights from '@/components/custom-kitchen/ProjectHighlights';
import BackToProjects from '@/components/custom-kitchen/BackToProjects';

interface DetailPageProps {
  title?: string;
  description?: string;
  caseStudySlug?: string;
  cardColor?: string;
  icon?: string;
  params?: { caseStudy: string };
}

const DetailPage: React.FC<DetailPageProps> = ({ params }) => {
  // Sample data for the case study
  const kitchenImages = [
    '/images/home/card1.jpg',
    '/images/home/card2.webp', 
    '/images/home/card3.jpg',
    '/images/home/ratio.jpg'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
        <div className="bg-gray-50">
        <OverviewSection />
        </div>
        <div className="bg-white">
        <StepsSection />
        </div>
        <ImageSlider images={kitchenImages} />
        <div className="bg-gray-50">
        <ConsultationSection />
        </div>
        <div className="bg-white">
        <ProjectHighlights />
        
        {/* <BackToProjects /> */}
        </div>
      </div>
    
  );
};

export default DetailPage;
