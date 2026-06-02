import mongoose from 'mongoose';
import Product from '@/backend/models/Product.model';
import type { IOrderItem } from '@/backend/models/Order.model';

export interface OrderItemLike {
  productId?: string;
  productName?: string;
  productImage?: string;
  sku?: string;
  quantity?: number;
  price?: number;
  total?: number;
  [key: string]: unknown;
}

const UNKNOWN = 'Unknown Product';

function needsName(item: OrderItemLike): boolean {
  const n = (item.productName ?? '').trim();
  return !n || n === UNKNOWN;
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

/** Resolve product name/image for order line items (mutates copies, returns enriched array). */
export async function enrichOrderItems<T extends OrderItemLike>(items: T[]): Promise<T[]> {
  if (!items.length) return items;

  const out = items.map((it) => ({ ...it }));
  const pending = out.filter(needsName);
  if (!pending.length) return out;

  const idSet = new Set<string>();
  const skus = new Set<string>();

  for (const it of pending) {
    for (const raw of [it.productId, it.sku]) {
      if (raw && mongoose.Types.ObjectId.isValid(String(raw))) {
        idSet.add(String(raw));
      }
    }
    if (it.sku && String(it.sku).trim()) skus.add(String(it.sku).trim());
  }

  const byId = new Map<string, { name: string; images: string[] }>();
  const bySku = new Map<string, { name: string; images: string[] }>();
  const byImage = new Map<string, { name: string; images: string[] }>();

  if (idSet.size > 0) {
    const rows = await Product.find({ _id: { $in: [...idSet] } }).select('name images').lean();
    for (const p of rows) byId.set(String(p._id), { name: String(p.name), images: p.images ?? [] });
  }

  if (skus.size > 0) {
    const skuList = [...skus];
    const rows = await Product.find({
      $or: [
        { _id: { $in: skuList.filter((s) => mongoose.Types.ObjectId.isValid(s)) } },
        { 'specifications.Product Code': { $in: skuList } },
        { 'specifications.product code': { $in: skuList } },
      ],
    })
      .select('name images specifications')
      .lean();

    for (const p of rows) {
      const entry = { name: String(p.name), images: p.images ?? [] };
      byId.set(String(p._id), entry);
      const specs = (p.specifications ?? {}) as Record<string, string>;
      const code = specs['Product Code'] || specs['product code'];
      if (code) bySku.set(String(code).trim(), entry);
    }
  }

  for (const it of pending) {
    if (!it.productImage || !needsName(it)) continue;
    const key = cloudinaryKey(String(it.productImage));
    if (!key || byImage.has(key)) continue;

    const url = String(it.productImage);
    const exact = await Product.findOne({ images: url }).select('name images').lean();
    if (exact) {
      byImage.set(key, { name: String(exact.name), images: exact.images ?? [] });
      continue;
    }

    const tail = key.split('/').pop();
    if (tail && tail.length > 8) {
      const partial = await Product.findOne({
        images: { $elemMatch: { $regex: tail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
      })
        .select('name images')
        .lean();
      if (partial) {
        byImage.set(key, { name: String(partial.name), images: partial.images ?? [] });
      }
    }
  }

  return out.map((it) => {
    if (!needsName(it)) return it;

    let hit: { name: string; images: string[] } | undefined;
    if (it.productId) hit = byId.get(String(it.productId));
    if (!hit && it.sku) {
      hit = byId.get(String(it.sku)) ?? bySku.get(String(it.sku).trim());
    }
    if (!hit && it.productImage) {
      hit = byImage.get(cloudinaryKey(String(it.productImage)));
    }

    if (!hit) return it;

    return {
      ...it,
      productName: hit.name,
      productImage: it.productImage || hit.images[0] || '',
      productId: it.productId || (mongoose.Types.ObjectId.isValid(String(it.sku ?? '')) ? String(it.sku) : it.productId),
    };
  });
}

/** Ensure enriched items satisfy IOrderItem required fields. */
export function toOrderItems(items: OrderItemLike[]): IOrderItem[] {
  return items.map((it) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.price) || 0;
    return {
      productId: it.productId,
      productName: it.productName ?? UNKNOWN,
      productImage: it.productImage ?? '',
      quantity: qty,
      price,
      total: Number(it.total) || price * qty,
      sku: it.sku,
    };
  });
}

/** Enrich line items and return a typed IOrderItem[]. */
export async function enrichOrderItemsList(items: IOrderItem[]): Promise<IOrderItem[]> {
  return toOrderItems(await enrichOrderItems(items as OrderItemLike[]));
}

/** Map raw cart/payment payload to order item schema fields. */
export function mapRawOrderItem(item: Record<string, unknown>): IOrderItem {
  const productId =
    (item._id as string) ||
    (item.productId as string) ||
    (item.id as string) ||
    undefined;

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
    sku: (item.sku as string) || (item.productCode as string) || undefined,
  };
}
