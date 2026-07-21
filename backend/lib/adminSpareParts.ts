import { Types } from 'mongoose';
import Product from '@/backend/models/Product.model';
import Category from '@/backend/models/Category.model';
import { uniqueObjectIds } from '@/backend/lib/spareParts';

export function parseSparePartPrice(body: {
  price?: unknown;
  originalPrice?: unknown;
}): { ok: true; price?: number; originalPrice: number } | { ok: false; message: string } {
  const originalPrice = Number(body.originalPrice ?? body.price ?? 0);
  if (!originalPrice || originalPrice <= 0) {
    return { ok: false, message: 'A valid price is required.' };
  }
  const priceRaw = body.price;
  const price =
    priceRaw === '' || priceRaw == null || priceRaw === undefined ? undefined : Number(priceRaw);
  if (price != null && (Number.isNaN(price) || price < 0)) {
    return { ok: false, message: 'Invalid sale price.' };
  }
  if (price != null && price > originalPrice) {
    return { ok: false, message: 'Sale price cannot exceed original price.' };
  }
  return { ok: true, price, originalPrice };
}

export async function validateSparePartLinks(
  linkedCategoryIds: unknown,
  linkedProductIds: unknown,
): Promise<
  | {
      ok: true;
      linkedCategoryIds: Types.ObjectId[];
      linkedProductIds: Types.ObjectId[];
    }
  | { ok: false; message: string }
> {
  const catIds = uniqueObjectIds(Array.isArray(linkedCategoryIds) ? linkedCategoryIds : []);
  const prodIds = uniqueObjectIds(Array.isArray(linkedProductIds) ? linkedProductIds : []);

  if (catIds.length === 0) {
    return { ok: false, message: 'Select at least one category.' };
  }

  const cats = await Category.find({ _id: { $in: catIds } }).select('_id status').lean();
  if (cats.length !== catIds.length) {
    return { ok: false, message: 'One or more selected categories were not found.' };
  }
  const inactive = cats.find((c) => c.status === 'inactive');
  if (inactive) {
    return { ok: false, message: 'Cannot link to an inactive category.' };
  }

  if (prodIds.length > 0) {
    const products = await Product.find({ _id: { $in: prodIds } })
      .select('_id status categories')
      .lean();
    if (products.length !== prodIds.length) {
      return { ok: false, message: 'One or more selected products were not found.' };
    }
    const invalid = products.find((p) => p.status === 'inactive');
    if (invalid) {
      return { ok: false, message: 'Only active main products can be linked.' };
    }

    const catIdSet = new Set(catIds.map(String));
    const outsideCategory = products.find((p) =>
      !(p.categories ?? []).some((c) => catIdSet.has(String(c))),
    );
    if (outsideCategory) {
      return {
        ok: false,
        message: 'Selected products must belong to one of the chosen categories.',
      };
    }
  }

  return {
    ok: true,
    linkedCategoryIds: catIds,
    linkedProductIds: prodIds,
  };
}
