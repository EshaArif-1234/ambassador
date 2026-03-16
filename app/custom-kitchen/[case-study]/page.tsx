'use client';

import { Suspense } from 'react';
import CaseStudyPage from '@/app/custom-kitchen/DetailPage';

export default function CustomKitchen({ params }: { params: Promise<{ caseStudy: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <CaseStudyPage params={params} />
    </Suspense>
  );
}