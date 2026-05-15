import type { Collection } from 'mongodb';

/**
 * Move legacy single category / subCategory fields into arrays, then drop
 * subcategory fields. Idempotent.
 *
 * IMPORTANT: guarded by a module-level flag so it runs at most ONCE per
 * process lifetime, not on every API request. Before the fix this ran
 * 3 updateMany calls on every /api/products hit, adding ~200-400 ms.
 */
let migrationDone = false;

export async function migrateLegacyProductTaxonomy(collection: Collection) {
  if (migrationDone) return;
  migrationDone = true;

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
