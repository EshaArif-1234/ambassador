'use client';

import { Suspense } from 'react';
import SubCategoriesPage from '@/client/pages/subcategories/SubCategoriesPage';

export default function SubCategories() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubCategoriesPage />
    </Suspense>
  );
}
