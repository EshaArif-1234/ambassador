import type { Collection } from 'mongodb';

/** Move legacy single category / subCategory fields into arrays, then drop subcategory fields. Idempotent. */
export async function migrateLegacyProductTaxonomy(collection: Collection) {
  await collection.updateMany(
    {
      category: { $exists: true, $ne: null },
      $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }],
    },
    [{ $set: { categories: ['$category'] } }, { $unset: ['category'] }]
  );
  await collection.updateMany(
    {
      subCategory: { $exists: true, $ne: null },
      $or: [{ subCategories: { $exists: false } }, { subCategories: { $size: 0 } }],
    },
    [{ $set: { subCategories: ['$subCategory'] } }, { $unset: ['subCategory'] }]
  );
  await collection.updateMany(
    { $or: [{ subCategories: { $exists: true } }, { subCategory: { $exists: true } }] },
    [{ $unset: ['subCategories', 'subCategory'] }]
  );
}
