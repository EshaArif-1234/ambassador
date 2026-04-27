import type { Collection } from 'mongodb';

/** One-shot style migration: copy legacy categoryId into categoryIds and drop categoryId. Idempotent. */
export async function migrateLegacySubcategoryParents(collection: Collection) {
  await collection.updateMany(
    {
      categoryId: { $exists: true, $ne: null },
      $or: [{ categoryIds: { $exists: false } }, { categoryIds: { $size: 0 } }],
    },
    [{ $set: { categoryIds: ['$categoryId'] } }, { $unset: ['categoryId'] }]
  );
}
