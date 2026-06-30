import mongoose from 'mongoose';
import Product from '@/backend/models/Product.model';

export function isMongoObjectId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value) && String(value).length === 24;
}

type LeanProduct = Awaited<ReturnType<typeof findActiveProductByIdentifier>>;

/** Resolve storefront URL segment to an active product (_id or slug). */
export async function findActiveProductByIdentifier(identifier: string) {
  const raw = decodeURIComponent(identifier).trim();
  if (!raw) return null;

  if (isMongoObjectId(raw)) {
    const byId = await Product.findOne({ _id: raw, status: 'active' })
      .populate('categories', 'title slug')
      .lean();
    if (byId) return byId;
  }

  const slug = raw.toLowerCase();
  return Product.findOne({ slug, status: 'active' }).populate('categories', 'title slug').lean();
}

/** Check whether a product exists but is hidden from the storefront. */
export async function findInactiveProductByIdentifier(identifier: string) {
  const raw = decodeURIComponent(identifier).trim();
  if (!raw) return null;

  if (isMongoObjectId(raw)) {
    return Product.findOne({ _id: raw, status: 'inactive' }).select('_id name status').lean();
  }

  const slug = raw.toLowerCase();
  return Product.findOne({ slug, status: 'inactive' }).select('_id name status').lean();
}

export type { LeanProduct };
