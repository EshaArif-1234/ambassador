import { redirect } from 'next/navigation';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Legacy /catalogue → /our-collection (category title → slug path when possible). */
export default async function CatalogueRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    if (key === 'category') continue;
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
  }

  const categoryTitle = typeof sp.category === 'string' ? sp.category.trim() : '';
  if (categoryTitle) {
    await connectDB();
    const cat = await Category.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(categoryTitle)}$`, 'i') },
    })
      .select('slug')
      .lean();

    if (cat?.slug) {
      const qs = params.toString();
      redirect(qs ? `/our-collection/${cat.slug}?${qs}` : `/our-collection/${cat.slug}`);
    }

    params.set('category', categoryTitle);
  }

  const qs = params.toString();
  redirect(qs ? `/our-collection?${qs}` : '/our-collection');
}
