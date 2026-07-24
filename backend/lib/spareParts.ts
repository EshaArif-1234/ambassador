import SparePart from '@/backend/models/SparePart.model';
import { resolveProductImages } from '@/utils/productMedia.util';
import type { SparePartSummary } from '@/lib/spareParts.types';

export type { SparePartSummary };

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function toSparePartSummary(row: {
  _id: { toString(): string } | string;
  slug?: string;
  name: string;
  price?: number | null;
  originalPrice: number;
  stock: number;
  images?: string[];
  imagePublicIds?: string[];
  specifications?: Record<string, string>;
  description?: string;
}): SparePartSummary {
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
    description: row.description?.trim() ?? '',
  };
}

const LIST_SELECT =
  'slug name price originalPrice stock status images imagePublicIds specifications description createdAt';

const ADMIN_LIST_SELECT =
  'name slug price originalPrice stock status images description createdAt';

/** Admin dashboard listing — all statuses, paginated. */
export async function listAdminSpareParts(options: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Record<string, unknown>[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  const search = options.search?.trim();
  if (search) {
    filter.$or = [
      { name: { $regex: escapeRegex(search), $options: 'i' } },
      { slug: { $regex: escapeRegex(search), $options: 'i' } },
    ];
  }
  const status = options.status?.trim();
  if (status === 'active' || status === 'inactive') filter.status = status;

  const [rows, total] = await Promise.all([
    SparePart.find(filter).select(ADMIN_LIST_SELECT).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SparePart.countDocuments(filter),
  ]);

  return {
    data: rows.map((row) => ({
      ...row,
      _id: String(row._id),
      images: Array.isArray(row.images) ? row.images.slice(0, 1) : [],
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** Active spare parts for the storefront listing page. */
export async function listActiveSpareParts(options: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: SparePartSummary[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(48, Math.max(1, options.limit ?? 12));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'active' };
  const search = options.search?.trim();
  if (search) {
    filter.$or = [
      { name: { $regex: escapeRegex(search), $options: 'i' } },
      { slug: { $regex: escapeRegex(search), $options: 'i' } },
    ];
  }

  const [rows, total] = await Promise.all([
    SparePart.find(filter).select(LIST_SELECT).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SparePart.countDocuments(filter),
  ]);

  return {
    items: rows.map((row) => toSparePartSummary(row)),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
