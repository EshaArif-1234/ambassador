import type { MetadataRoute } from 'next';
import connectDB from '@/backend/config/db';
import Category from '@/backend/models/Category.model';
import Product from '@/backend/models/Product.model';
import { categoryListSort } from '@/backend/lib/categoryOrder';
import { getCaseStudySlugs } from '@/client/data/customKitchenCases';
import { collectionCategoryPath, productDetailPath } from '@/lib/siteRoutes';
import { absoluteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

type StaticPage = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
};

const STATIC_PAGES: StaticPage[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact-us', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/branches', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/custom-kitchen', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/our-collection', priority: 0.9, changeFrequency: 'daily' },
  { path: '/returns', priority: 0.4, changeFrequency: 'yearly' },
];

function pushEntry(
  entries: MetadataRoute.Sitemap,
  seen: Set<string>,
  entry: MetadataRoute.Sitemap[number],
) {
  if (seen.has(entry.url)) return;
  seen.add(entry.url);
  entries.push(entry);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  for (const { path, priority, changeFrequency } of STATIC_PAGES) {
    pushEntry(entries, seen, {
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    });
  }

  for (const slug of getCaseStudySlugs()) {
    pushEntry(entries, seen, {
      url: absoluteUrl(`/custom-kitchen/${encodeURIComponent(slug)}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  try {
    await connectDB();

    const categories = await Category.find({
      $nor: [{ status: { $regex: /^inactive$/i } }],
    })
      .select('slug updatedAt')
      .sort(categoryListSort)
      .lean();

    for (const category of categories) {
      const slug = category.slug?.trim().toLowerCase();
      if (!slug) continue;
      pushEntry(entries, seen, {
        url: absoluteUrl(collectionCategoryPath(slug)),
        lastModified: category.updatedAt ?? now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    const products = await Product.find({ status: 'active' })
      .select('slug updatedAt')
      .lean();

    for (const product of products) {
      const segment = (product.slug || String(product._id)).trim().toLowerCase();
      if (!segment) continue;

      pushEntry(entries, seen, {
        url: absoluteUrl(productDetailPath(segment)),
        lastModified: product.updatedAt ?? now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error('[sitemap] Database unavailable — serving static URLs only.', error);
  }

  return entries;
}
