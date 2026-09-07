import mongoose from 'mongoose';
import Product from '@/backend/models/Product.model';
import SparePart from '@/backend/models/SparePart.model';
import {
  deliveryChargesFromWeightKg,
  SHIPPING_RATE_PKR_PER_KG,
} from '@/lib/shippingConstants';

export { SHIPPING_RATE_PKR_PER_KG, deliveryChargesFromWeightKg };

export type ShippingLineItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type ShippingQuote = {
  subtotal: number;
  totalWeightKg: number;
  deliveryCharges: number;
  total: number;
  quoteReady: boolean;
};

export class ShippingQuoteError extends Error {
  code: string;

  constructor(message: string, code = 'SHIPPING_QUOTE_FAILED') {
    super(message);
    this.name = 'ShippingQuoteError';
    this.code = code;
  }
}

export function parseWeightKg(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}

function hasShippingAddress(city?: string, address?: string): boolean {
  return Boolean(city?.trim() && address?.trim());
}

/** Server-side shipping quote from cart line items and product weights in DB. */
export async function computeShippingQuote(
  items: ShippingLineItem[],
  options?: { city?: string; address?: string },
): Promise<ShippingQuote> {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) {
    return {
      subtotal: 0,
      totalWeightKg: 0,
      deliveryCharges: 0,
      total: 0,
      quoteReady: false,
    };
  }

  if (!hasShippingAddress(options?.city, options?.address)) {
    return {
      subtotal,
      totalWeightKg: 0,
      deliveryCharges: 0,
      total: subtotal,
      quoteReady: false,
    };
  }

  const ids = [
    ...new Set(
      items
        .map((item) => item.productId)
        .filter((id) => mongoose.Types.ObjectId.isValid(id)),
    ),
  ];

  if (ids.length !== items.length) {
    throw new ShippingQuoteError('One or more cart items could not be matched for shipping.');
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

  const [products, spareParts] = await Promise.all([
    Product.find({ _id: { $in: objectIds } }).select('name weightKg').lean(),
    SparePart.find({ _id: { $in: objectIds } }).select('name weightKg').lean(),
  ]);

  const catalog = new Map<string, { name: string; weightKg: number | null }>();
  for (const product of products) {
    catalog.set(String(product._id), {
      name: String(product.name),
      weightKg: parseWeightKg(product.weightKg),
    });
  }
  for (const part of spareParts) {
    catalog.set(String(part._id), {
      name: String(part.name),
      weightKg: parseWeightKg(part.weightKg),
    });
  }

  let totalWeightKg = 0;
  const missingWeight: string[] = [];

  for (const item of items) {
    const hit = catalog.get(item.productId);
    if (!hit) {
      throw new ShippingQuoteError('One or more products in your cart are no longer available.');
    }
    if (hit.weightKg == null) {
      missingWeight.push(hit.name);
      continue;
    }
    totalWeightKg += hit.weightKg * item.quantity;
  }

  if (missingWeight.length) {
    throw new ShippingQuoteError(
      `Shipping weight is not configured yet for: ${missingWeight.join(', ')}. Please contact support.`,
      'MISSING_PRODUCT_WEIGHT',
    );
  }

  const deliveryCharges = deliveryChargesFromWeightKg(totalWeightKg);

  return {
    subtotal,
    totalWeightKg,
    deliveryCharges,
    total: subtotal + deliveryCharges,
    quoteReady: true,
  };
}

export function shippingLineItemsFromCart(
  items: { id: string; price: number; quantity: number }[],
): ShippingLineItem[] {
  return items.map((item) => ({
    productId: item.id,
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Number(item.price) || 0,
  }));
}

/** Total order weight from DB. Use fallbackKgPerItem for M&P booking when product/weight is missing. */
export async function computeOrderWeightKg(
  items: { productId?: string; quantity: number }[],
  options?: { fallbackKgPerItem?: number },
): Promise<number> {
  if (!items.length) {
    throw new ShippingQuoteError('Order has no items for weight calculation.');
  }

  const validLines = items.map((item) => ({
    productId:
      item.productId && mongoose.Types.ObjectId.isValid(item.productId)
        ? String(item.productId)
        : null,
    quantity: Math.max(1, Number(item.quantity) || 1),
  }));

  const ids = [...new Set(validLines.map((line) => line.productId).filter(Boolean))] as string[];
  const catalog = new Map<string, { name: string; weightKg: number | null }>();

  if (ids.length) {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const [products, spareParts] = await Promise.all([
      Product.find({ _id: { $in: objectIds } }).select('name weightKg').lean(),
      SparePart.find({ _id: { $in: objectIds } }).select('name weightKg').lean(),
    ]);
    for (const product of products) {
      catalog.set(String(product._id), {
        name: String(product.name),
        weightKg: parseWeightKg(product.weightKg),
      });
    }
    for (const part of spareParts) {
      catalog.set(String(part._id), {
        name: String(part.name),
        weightKg: parseWeightKg(part.weightKg),
      });
    }
  }

  let totalWeightKg = 0;
  const missingWeight: string[] = [];
  const fallback = options?.fallbackKgPerItem;

  for (const line of validLines) {
    if (!line.productId) {
      if (fallback) {
        totalWeightKg += fallback * line.quantity;
        continue;
      }
      throw new ShippingQuoteError('Order items are missing product identifiers for weight calculation.');
    }

    const hit = catalog.get(line.productId);
    if (!hit) {
      if (fallback) {
        totalWeightKg += fallback * line.quantity;
        continue;
      }
      throw new ShippingQuoteError('One or more order items could not be matched for weight calculation.');
    }
    if (hit.weightKg == null) {
      if (fallback) {
        totalWeightKg += fallback * line.quantity;
        continue;
      }
      missingWeight.push(hit.name);
      continue;
    }
    totalWeightKg += hit.weightKg * line.quantity;
  }

  if (missingWeight.length) {
    throw new ShippingQuoteError(
      `Shipping weight is not configured for: ${missingWeight.join(', ')}.`,
      'MISSING_PRODUCT_WEIGHT',
    );
  }

  return totalWeightKg;
}
