import mongoose from 'mongoose';
import Product from '@/backend/models/Product.model';
import SparePart from '@/backend/models/SparePart.model';
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

export const UNKNOWN_PRODUCT_LABEL = UNKNOWN;

export function isUnknownProductName(name?: string | null): boolean {
  const value = name?.trim();
  return !value || value === UNKNOWN;
}

/** Convert Mongoose subdocuments or plain objects into a strict order line item. */
export function normalizeStoredOrderItem(item: unknown): IOrderItem {
  const record =
    item &&
    typeof item === 'object' &&
    'toObject' in item &&
    typeof (item as { toObject?: () => unknown }).toObject === 'function'
      ? ((item as { toObject: () => Record<string, unknown> }).toObject() as Record<string, unknown>)
      : (item as Record<string, unknown>);

  const qty = Number(record.quantity) || 1;
  const price = Number(record.price) || 0;

  return {
    productId: record.productId ? String(record.productId) : undefined,
    productName: String(record.productName ?? UNKNOWN),
    productImage: String(record.productImage ?? ''),
    quantity: qty,
    price,
    total: Number(record.total) || price * qty,
    sku: record.sku ? String(record.sku) : undefined,
  };
}

export function finalizeOrderLineItems(items: IOrderItem[], subtotal: number): IOrderItem[] {
  return items.map((item) => {
    const quantity = Number(item.quantity) || 1;
    let price = Number(item.price) || 0;
    if (price <= 0 && items.length === 1 && subtotal > 0) {
      price = subtotal / quantity;
    }

    return {
      productId: item.productId,
      productName: item.productName?.trim() || UNKNOWN,
      productImage: item.productImage ?? '',
      quantity,
      price,
      total: Number(item.total) || price * quantity,
      sku: item.sku,
    };
  });
}

export function resolveCheckoutLineItems(payload: {
  orderItems?: Record<string, unknown>[];
  orderData?: { products?: Record<string, unknown>[] };
}): Record<string, unknown>[] {
  if (payload.orderItems?.length) return payload.orderItems;
  const products = payload.orderData?.products;
  if (Array.isArray(products) && products.length) return products;
  return [];
}

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

    const missingIds = [...idSet].filter((id) => !catalog.has(id));
    if (missingIds.length > 0) {
      const spareRows = await SparePart.find({ _id: { $in: missingIds } })
        .select('name images specifications')
        .lean();
      for (const sp of spareRows) {
        const id = String(sp._id);
        catalog.set(id, {
          id,
          name: String(sp.name),
          images: sp.images ?? [],
          productCode: codeFromSpecs(sp.specifications as Record<string, string> | undefined),
          category: 'Spare Part',
        });
      }
    }
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

  const rawCode = String(
    (item.productCode as string) || (item.sku as string) || '',
  ).trim();
  const codeIsId = rawCode && isMongoId(rawCode);

  const productId = rawId || (codeIsId ? rawCode : undefined);
  const productCode = rawCode && !codeIsId ? rawCode : undefined;

  const qty = Number(item.quantity) || 1;
  const price = Number(item.price ?? item.unitPrice ?? item.amount) || 0;
  const lineTotal = Number(item.total) || price * qty;

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
    total: lineTotal,
    sku: productCode,
  };
}

/** Keep checkout names/prices when catalog enrichment cannot improve them. */
export function mergePreservedOrderItem(original: IOrderItem, enriched: IOrderItem): IOrderItem {
  const price = enriched.price > 0 ? enriched.price : original.price;
  const quantity = enriched.quantity || original.quantity || 1;
  const total =
    enriched.total > 0
      ? enriched.total
      : original.total > 0
        ? original.total
        : price * quantity;

  return {
    ...enriched,
    productId: enriched.productId || original.productId,
    productName: isUnknownProductName(enriched.productName)
      ? original.productName || enriched.productName
      : enriched.productName ?? original.productName,
    productImage: enriched.productImage || original.productImage,
    price,
    quantity,
    total,
    sku: enriched.sku || original.sku,
  };
}
