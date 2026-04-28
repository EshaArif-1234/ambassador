import { Types } from 'mongoose';
import Category from '@/backend/models/Category.model';

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

export async function validateProductTaxonomy(
  categoryIds: string[]
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (categoryIds.length < 1) {
    return { ok: false, status: 400, message: 'At least one category is required.' };
  }

  const cats = await Category.find({ _id: { $in: categoryIds } })
    .select('_id')
    .lean();
  if (cats.length !== categoryIds.length) {
    return { ok: false, status: 404, message: 'One or more categories were not found.' };
  }

  return { ok: true };
}

export function toObjectIdArray(ids: string[]): Types.ObjectId[] {
  return ids.map((id) => new Types.ObjectId(id));
}
