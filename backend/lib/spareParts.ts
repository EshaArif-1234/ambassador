import mongoose, { Types } from 'mongoose';
import SparePart from '@/backend/models/SparePart.model';
import { resolveProductImages } from '@/utils/productMedia.util';
import type { SparePartSummary } from '@/lib/spareParts.types';

export type { SparePartSummary };

export function uniqueObjectIds(ids: (string | Types.ObjectId)[]): Types.ObjectId[] {
  const seen = new Set<string>();
  const out: Types.ObjectId[] = [];
  for (const raw of ids) {
    const str = String(raw).trim();
    if (!str || !mongoose.Types.ObjectId.isValid(str)) continue;
    if (seen.has(str)) continue;
    seen.add(str);
    out.push(new mongoose.Types.ObjectId(str));
  }
  return out;
}

function toSparePartSummary(
  row: {
    _id: Types.ObjectId | string;
    slug?: string;
    name: string;
    price?: number | null;
    originalPrice: number;
    stock: number;
    images?: string[];
    imagePublicIds?: string[];
    specifications?: Record<string, string>;
  },
  source: 'product' | 'category',
): SparePartSummary {
  const images = resolveProductImages({
    images: row.images,
    imagePublicIds: row.imagePublicIds,
  });
  return {
    _id: String(row._id),
    slug: row.slug ?? String(row._id),
    name: row.name,
    price: row.price ?? undefined,
    originalPrice: row.originalPrice,
    stock: row.stock ?? 0,
    images,
    specifications: (row.specifications as Record<string, string>) ?? {},
    source,
  };
}

/** Spare parts to show on a main product detail page. */
export async function resolveSparePartsForProduct(product: {
  _id: Types.ObjectId | string;
  categories?: unknown[];
}): Promise<SparePartSummary[]> {
  const productId = new mongoose.Types.ObjectId(String(product._id));
  const categoryIds = uniqueObjectIds(
    (product.categories ?? []).flatMap((c) => {
      if (typeof c === 'string' || c instanceof mongoose.Types.ObjectId) return [String(c)];
      if (c && typeof c === 'object' && '_id' in c && (c as { _id?: unknown })._id) {
        return [String((c as { _id: Types.ObjectId | string })._id)];
      }
      return [];
    }),
  );

  const [byProduct, byCategory] = await Promise.all([
    SparePart.find({
      status: 'active',
      linkedProductIds: productId,
    })
      .select('slug name price originalPrice stock images imagePublicIds specifications linkedProductIds')
      .lean(),
    categoryIds.length > 0
      ? SparePart.find({
          status: 'active',
          linkedCategoryIds: { $in: categoryIds },
          $expr: {
            $eq: [{ $size: { $ifNull: ['$linkedProductIds', []] } }, 0],
          },
        })
          .select('slug name price originalPrice stock images imagePublicIds specifications linkedCategoryIds linkedProductIds')
          .lean()
      : Promise.resolve([]),
  ]);

  const ordered: { id: string; source: 'product' | 'category' }[] = [];
  const seen = new Set<string>();

  for (const row of byProduct) {
    const key = String(row._id);
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push({ id: key, source: 'product' });
  }
  for (const row of byCategory) {
    const key = String(row._id);
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push({ id: key, source: 'category' });
  }

  if (ordered.length === 0) return [];

  const rowMap = new Map([...byProduct, ...byCategory].map((r) => [String(r._id), r]));

  return ordered
    .map(({ id, source }) => {
      const row = rowMap.get(id);
      if (!row) return null;
      return toSparePartSummary(row, source);
    })
    .filter((x): x is SparePartSummary => x != null);
}
