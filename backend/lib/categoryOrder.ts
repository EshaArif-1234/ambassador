import Category from '@/backend/models/Category.model';

/** Assign sortOrder 1..n when every category still has the default (0). */
export async function ensureCategorySortOrders(): Promise<void> {
  const categories = await Category.find().select('_id sortOrder createdAt').lean();
  if (categories.length === 0) return;

  const needsInit = categories.every((c) => !c.sortOrder);
  if (!needsInit) return;

  const ordered = [...categories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  await Promise.all(
    ordered.map((cat, index) =>
      Category.updateOne({ _id: cat._id }, { $set: { sortOrder: index + 1 } }),
    ),
  );
}

export async function getNextCategorySortOrder(): Promise<number> {
  await ensureCategorySortOrders();
  const top = await Category.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
  return (top?.sortOrder ?? 0) + 1;
}

export const categoryListSort = { sortOrder: 1 as const, createdAt: -1 as const };
