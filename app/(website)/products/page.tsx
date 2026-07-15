import { Suspense } from 'react';
import { permanentRedirect } from 'next/navigation';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import ProductsPage from '@/client/pages/products/ProductsPage';
import PageLoader from '@/components/ui/PageLoader';
import { productsCategoryPath } from '@/lib/siteRoutes';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** /products — listing. ?category=Title permanently redirects to /products/[slug]. */
export default async function ProductsListingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categoryTitle = typeof sp.category === 'string' ? sp.category.trim() : '';

  if (categoryTitle) {
    await connectDB();
    const cat = await Category.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(categoryTitle)}$`, 'i') },
      status: { $ne: 'inactive' },
    })
      .select('slug')
      .lean();

    if (cat?.slug) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(sp)) {
        if (key === 'category') continue;
        if (typeof value === 'string') params.set(key, value);
        else if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
      }
      const qs = params.toString();
      permanentRedirect(qs ? `${productsCategoryPath(cat.slug)}?${qs}` : productsCategoryPath(cat.slug));
    }
  }

  return (
    <Suspense fallback={<PageLoader message="Loading products…" fullScreen={false} className="min-h-[60vh]" />}>
      <ProductsPage />
    </Suspense>
  );
}
