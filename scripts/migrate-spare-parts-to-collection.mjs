/**
 * Move legacy spare parts from the products collection into spareparts.
 *
 * Usage: node scripts/migrate-spare-parts-to-collection.mjs
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set.');
  process.exit(1);
}

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const sparePartSchema = new mongoose.Schema({}, { strict: false, collection: 'spareparts' });

const Product = mongoose.models._MigrateProduct ?? mongoose.model('_MigrateProduct', productSchema);
const SparePart = mongoose.models._MigrateSparePart ?? mongoose.model('_MigrateSparePart', sparePartSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const legacy = await Product.find({ productType: 'spare_part' }).lean();
  console.log(`Found ${legacy.length} legacy spare part(s) in products collection.`);

  if (!legacy.length) {
    console.log('Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  let migrated = 0;
  for (const doc of legacy) {
    const exists = await SparePart.findById(doc._id).lean();
    if (exists) {
      await Product.deleteOne({ _id: doc._id });
      console.log(`Skipped (already in spareparts): ${doc.name}`);
      continue;
    }

    await SparePart.create({
      _id: doc._id,
      name: doc.name,
      slug: doc.slug,
      linkedCategoryIds: doc.linkedCategoryIds ?? doc.categories ?? [],
      linkedProductIds: doc.linkedProductIds ?? [],
      price: doc.price,
      originalPrice: doc.originalPrice,
      stock: doc.stock ?? 0,
      status: doc.status ?? 'active',
      images: doc.images ?? [],
      imagePublicIds: doc.imagePublicIds ?? [],
      specifications: doc.specifications ?? {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });

    await Product.deleteOne({ _id: doc._id });
    migrated += 1;
    console.log(`Migrated: ${doc.name}`);
  }

  console.log(`Done. Migrated ${migrated} document(s) to spareparts collection.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
