import mongoose from 'mongoose';
import Product from '@/backend/models/Product.model';
import { sortPopulatedCategories } from '@/lib/storefrontCategories';
import type { IOrderItem } from '@/backend/models/Order.model';

export interface OrderItemLike {
  productId?: string;
  productName?: string;
  productImage?: string;
  productCode?: string;
  sku?: string;
  quantity?: number;
  price?: number;
  total?: number;
  [key: string]: unknown;
}

export type EnrichedOrderItem = IOrderItem & { productCode?: string; category?: string };

const UNKNOWN = 'Unknown Product';

function needsName(item: OrderItemLike): boolean {
  const n = (item.productName ?? '').trim();
  return !n || n === UNKNOWN;
}

function isMongoId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value) && String(value).length === 24;
}

function codeFromSpecs(specs?: Record<string, string>): string | undefined {
  if (!specs) return undefined;
  const code = specs['Product Code'] || specs['product code'];
  const trimmed = code?.trim();
  return trimmed || undefined;
}

function cloudinaryKey(url: string): string {
  if (!url) return '';
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return url;
    const after = parts[1].replace(/^v\d+\//, '');
    return after.split('?')[0];
  } catch {
    return url;
  }
}

type ProductHit = { name: string; images: string[]; productCode?: string; category?: string; id: string };

function categoryLabel(categories: unknown): string | undefined {
  if (!Array.isArray(categories) || !categories.length) return undefined;
  const sorted = sortPopulatedCategories(
    categories as { title?: string; sortOrder?: number }[],
  );
  const titles = sorted
    .map((c) => (typeof c === 'object' && c && 'title' in c ? String(c.title ?? '') : ''))
    .filter(Boolean);
  return titles.length ? titles.join(', ') : undefined;
}

function registerProduct(
  map: Map<string, ProductHit>,
  p: {
    _id: unknown;
    name: string;
    images?: string[];
    specifications?: Record<string, string>;
    categories?: unknown;
  }
) {
  const id = String(p._id);
  const entry: ProductHit = {
    id,
    name: String(p.name),
    images: p.images ?? [],
    productCode: codeFromSpecs(p.specifications as Record<string, string> | undefined),
    category: categoryLabel(p.categories),
  };
  map.set(id, entry);
  if (entry.productCode) map.set(entry.productCode, entry);
}

/** Resolve product name, image, and product code for order line items. */
export async function enrichOrderItems<T extends OrderItemLike>(items: T[]): Promise<T[]> {
  if (!items.length) return items;

  const out = items.map((it) => ({ ...it }));
  const idSet = new Set<string>();
  const codeLookups = new Set<string>();

  for (const it of out) {
    if (it.productId && isMongoId(String(it.productId))) idSet.add(String(it.productId));
    if (it.sku) {
      const s = String(it.sku).trim();
      if (isMongoId(s)) idSet.add(s);
      else if (s) codeLookups.add(s);
    }
    const rawCode = (it.productCode as string) || '';
    if (rawCode.trim() && !isMongoId(rawCode.trim())) codeLookups.add(rawCode.trim());
  }

  const catalog = new Map<string, ProductHit>();

  if (idSet.size > 0) {
    const rows = await Product.find({ _id: { $in: [...idSet] } })
      .select('name images specifications categories')
      .populate('categories', 'title sortOrder')
      .lean();
    for (const p of rows) registerProduct(catalog, p);
  }

  if (codeLookups.size > 0) {
    const codes = [...codeLookups];
    const rows = await Product.find({
      $or: [
        { 'specifications.Product Code': { $in: codes } },
        { 'specifications.product code': { $in: codes } },
      ],
    })
      .select('name images specifications categories')
      .populate('categories', 'title sortOrder')
      .lean();
    for (const p of rows) registerProduct(catalog, p);
  }

  const byImage = new Map<string, ProductHit>();

  for (const it of out) {
    if (!it.productImage || byImage.has(cloudinaryKey(String(it.productImage)))) continue;
    const key = cloudinaryKey(String(it.productImage));
    if (!key) continue;

    const url = String(it.productImage);
    const exact = await Product.findOne({ images: url })
      .select('name images specifications categories')
      .populate('categories', 'title sortOrder')
      .lean();
    if (exact) {
      const hit: ProductHit = {
        id: String(exact._id),
        name: String(exact.name),
        images: exact.images ?? [],
        productCode: codeFromSpecs(exact.specifications as Record<string, string>),
        category: categoryLabel(exact.categories),
      };
      byImage.set(key, hit);
      continue;
    }

    const tail = key.split('/').pop();
    if (tail && tail.length > 8) {
      const partial = await Product.findOne({
        images: { $elemMatch: { $regex: tail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
      })
        .select('name images specifications categories')
        .populate('categories', 'title sortOrder')
        .lean();
      if (partial) {
        byImage.set(key, {
          id: String(partial._id),
          name: String(partial.name),
          images: partial.images ?? [],
          productCode: codeFromSpecs(partial.specifications as Record<string, string>),
          category: categoryLabel(partial.categories),
        });
      }
    }
  }

  const resolveHit = (it: OrderItemLike): ProductHit | undefined => {
    if (it.productId) {
      const hit = catalog.get(String(it.productId));
      if (hit) return hit;
    }
    if (it.sku) {
      const s = String(it.sku).trim();
      const hit = catalog.get(s);
      if (hit) return hit;
    }
    if (it.productImage) {
      return byImage.get(cloudinaryKey(String(it.productImage)));
    }
    return undefined;
  };

  return out.map((it) => {
    const hit = resolveHit(it);
    const storedSku = it.sku ? String(it.sku).trim() : '';
    const legacyCode =
      storedSku && !isMongoId(storedSku) ? storedSku : undefined;

    const productId =
      (it.productId && isMongoId(String(it.productId)) ? String(it.productId) : undefined) ||
      (storedSku && isMongoId(storedSku) ? storedSku : undefined) ||
      hit?.id;

    const productCode = hit?.productCode ?? legacyCode;
    const productName = hit?.name ?? (needsName(it) ? it.productName : it.productName);
    const productImage =
      it.productImage || hit?.images[0] || '';

    const sku = productCode;

    return {
      ...it,
      productId,
      productName: productName ?? UNKNOWN,
      productImage,
      productCode,
      category: hit?.category ?? (it.category as string | undefined),
      sku,
    } as T;
  });
}

/** Ensure enriched items satisfy IOrderItem required fields. */
export function toOrderItems(items: OrderItemLike[]): EnrichedOrderItem[] {
  return items.map((it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.price) || 0;
    const storedSku = it.sku ? String(it.sku).trim() : '';
    const productCode =
      (it.productCode as string | undefined) ||
      (storedSku && !isMongoId(storedSku) ? storedSku : undefined);

    return {
      productId: it.productId,
      productName: it.productName ?? UNKNOWN,
      productImage: it.productImage ?? '',
      quantity: qty,
      price,
      total: Number(it.total) || price * qty,
      sku: productCode,
      productCode,
      category: it.category as string | undefined,
    };
  });
}

/** Enrich line items and return a typed list with catalog-backed fields. */
export async function enrichOrderItemsList(items: IOrderItem[]): Promise<EnrichedOrderItem[]> {
  return toOrderItems(await enrichOrderItems(items as OrderItemLike[]));
}

/** Map raw cart/payment payload to order item schema fields. */
export function mapRawOrderItem(item: Record<string, unknown>): IOrderItem {
  const rawId =
    (item._id as string) ||
    (item.productId as string) ||
    (item.id as string) ||
    undefined;

  const rawCode = String((item.productCode as string) || (item.sku as string) || '').trim();
  const codeIsId = rawCode && isMongoId(rawCode);

  const productId = rawId || (codeIsId ? rawCode : undefined);
  const productCode = rawCode && !codeIsId ? rawCode : undefined;

  const qty = Number(item.quantity) || 1;
  const price = Number(item.price) || 0;

  return {
    productId,
    productName:
      (item.title as string) ||
      (item.name as string) ||
      (item.productName as string) ||
      UNKNOWN,
    productImage: (item.image as string) || (item.productImage as string) || '',
    quantity: qty,
    price,
    total: price * qty,
    sku: productCode,
  };
}
