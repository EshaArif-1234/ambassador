import { Types } from 'mongoose';
import Category from '@/backend/models/Category.model';
import SubCategory from '@/backend/models/SubCategory.model';

export function resolveProductCategoryIds(body: {
  categories?: unknown;
  category?: unknown;
}): string[] | null {
  if (Array.isArray(body.categories) && body.categories.length > 0) {
    const ids = [...new Set(body.categories.map(String).filter(Boolean))];
    return ids.length ? ids : null;
  }
  if (body.category != null && String(body.category).trim() !== '') {
    return [String(body.category)];
  }
  return null;
}

export function resolveProductSubCategoryIds(body: {
  subCategories?: unknown;
  subCategory?: unknown;
}): string[] | null {
  if (Array.isArray(body.subCategories) && body.subCategories.length > 0) {
    const ids = [...new Set(body.subCategories.map(String).filter(Boolean))];
    return ids.length ? ids : null;
  }
  if (body.subCategory != null && String(body.subCategory).trim() !== '') {
    return [String(body.subCategory)];
  }
  return null;
}

/** Ensure category ids exist; subcategories exist and each links to at least one product category. */
export async function validateProductTaxonomy(
  categoryIds: string[],
  subCategoryIds: string[]
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (categoryIds.length < 1) {
    return { ok: false, status: 400, message: 'At least one category is required.' };
  }
  if (subCategoryIds.length < 1) {
    return { ok: false, status: 400, message: 'At least one subcategory is required.' };
  }

  const cats = await Category.find({ _id: { $in: categoryIds } })
    .select('_id')
    .lean();
  if (cats.length !== categoryIds.length) {
    return { ok: false, status: 404, message: 'One or more categories were not found.' };
  }

  const subs = await SubCategory.find({ _id: { $in: subCategoryIds } }).lean();
  if (subs.length !== subCategoryIds.length) {
    return { ok: false, status: 404, message: 'One or more subcategories were not found.' };
  }

  const catSet = new Set(categoryIds.map(String));
  for (const sub of subs) {
    const parents = (sub.categoryIds ?? []).map(String);
    const linked = parents.some((pid) => catSet.has(pid));
    if (!linked) {
      return {
        ok: false,
        status: 400,
        message: `Subcategory "${sub.title}" must belong to at least one of the selected categories.`,
      };
    }
  }

  return { ok: true };
}

export function toObjectIdArray(ids: string[]): Types.ObjectId[] {
  return ids.map((id) => new Types.ObjectId(id));
}
