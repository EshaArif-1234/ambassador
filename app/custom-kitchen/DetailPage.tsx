'use client';

import { Suspense } from 'react';
import CaseStudyDetailPage from '@/client/pages/custom-kitchen/case-study-detailpage';

export default function CustomKitchen({ params }: { params: Promise<{ caseStudy: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <CaseStudyDetailPage title="" description="" caseStudySlug="" cardColor="" icon="" />
    </Suspense>
  );
}

