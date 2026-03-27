'use client';

import { Suspense } from 'react';
import CaseStudyPage from '@/client/pages/custom-kitchen/case-study-detailpage';

export default async function CustomKitchen({ params }: { params: Promise<{ caseStudy: string }> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <CaseStudyPage params={resolvedParams} />
    </Suspense>
  );
}