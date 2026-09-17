export type SparePartVariant = {
  id: string;
  name: string;
  originalPrice?: number;
  price?: number;
  stock: number;
  sku?: string;
  image?: string;
  imagePublicId?: string;
};

export type SparePartPricing = {
  originalPrice: number;
  price?: number;
  stock: number;
};

export function normalizeSparePartVariants(raw: unknown): SparePartVariant[] {
  if (!Array.isArray(raw)) return [];

  const variants: SparePartVariant[] = [];
  const seenNames = new Set<string>();

  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const name = String(record.name ?? '').trim();
    if (!name) continue;

    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;
    seenNames.add(nameKey);

    const id = String(record.id ?? '').trim() || crypto.randomUUID();
    const stock = Math.max(0, Number(record.stock ?? 0));
    const originalPriceRaw = record.originalPrice;
    const priceRaw = record.price;

    const originalPrice =
      originalPriceRaw === '' || originalPriceRaw == null
        ? undefined
        : Number(originalPriceRaw);
    const price =
      priceRaw === '' || priceRaw == null ? undefined : Number(priceRaw);

    const image = String(record.image ?? '').trim();
    const imagePublicId = String(record.imagePublicId ?? '').trim();

    variants.push({
      id,
      name,
      stock,
      ...(originalPrice != null && !Number.isNaN(originalPrice) && originalPrice > 0
        ? { originalPrice }
        : {}),
      ...(price != null && !Number.isNaN(price) && price >= 0 ? { price } : {}),
      ...(String(record.sku ?? '').trim()
        ? { sku: String(record.sku).trim() }
        : {}),
      ...(image ? { image, ...(imagePublicId ? { imagePublicId } : {}) } : {}),
    });
  }

  return variants;
}

/** Create/edit form: every variation must have name, price, and stock. Images optional. */
export function validateSparePartVariationForm(variants: SparePartVariant[]): string | null {
  if (!variants.length) return 'Add at least one variation.';
  for (const variant of variants) {
    if (!variant.name.trim()) return 'Each variation needs a name.';
    if (variant.stock < 0) return 'Variation stock cannot be negative.';
    const price = variant.price ?? variant.originalPrice;
    if (price == null || price <= 0) {
      return `Variation "${variant.name.trim()}" needs a valid price.`;
    }
  }
  return null;
}

/** Derive listing price, stock, and gallery from variations. */
export function syncSparePartFieldsFromVariants(variants: SparePartVariant[]): {
  originalPrice: number;
  price?: number;
  stock: number;
  images: string[];
  imagePublicIds: string[];
} {
  const prices = variants.map((v) => v.price ?? v.originalPrice ?? 0).filter((p) => p > 0);
  const originalPrice = prices.length ? Math.min(...prices) : 0;
  const stock = variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0);
  const images: string[] = [];
  const imagePublicIds: string[] = [];
  for (const v of variants) {
    const url = v.image?.trim();
    if (!url) continue;
    images.push(url);
    imagePublicIds.push(v.imagePublicId?.trim() ?? '');
  }
  return { originalPrice, stock, images, imagePublicIds };
}

export function validateSparePartVariants(
  variants: SparePartVariant[],
  base: SparePartPricing,
): string | null {
  for (const variant of variants) {
    if (!variant.name.trim()) return 'Each variant must have a name.';
    if (variant.stock < 0) return 'Variant stock cannot be negative.';

    const price =
      variant.price ?? variant.originalPrice ?? base.price ?? base.originalPrice;

    if (!price || price <= 0) {
      return `Variant "${variant.name}" needs a valid price (set a variant price or base price).`;
    }

    if (
      variant.originalPrice != null &&
      variant.originalPrice > 0 &&
      variant.price != null &&
      variant.price > variant.originalPrice
    ) {
      return `Variant "${variant.name}" sale price cannot exceed its original price.`;
    }
  }
  return null;
}

export function sparePartHasVariants(part: { variants?: SparePartVariant[] | null }): boolean {
  return Array.isArray(part.variants) && part.variants.length > 0;
}

export function sparePartEffectiveStock(part: {
  stock: number;
  variants?: SparePartVariant[] | null;
}): number {
  if (sparePartHasVariants(part)) {
    return part.variants!.reduce((sum, v) => sum + Math.max(0, v.stock), 0);
  }
  return Math.max(0, part.stock ?? 0);
}

export function resolveSparePartVariantPricing(
  part: SparePartPricing & { variants?: SparePartVariant[] | null },
  variant?: SparePartVariant | null,
): { originalPrice: number; price: number; stock: number } {
  if (variant) {
    const price =
      variant.price != null && variant.price > 0
        ? variant.price
        : part.price != null && part.price > 0
          ? part.price
          : part.originalPrice;
    const originalPrice =
      variant.originalPrice != null && variant.originalPrice > 0
        ? variant.originalPrice
        : price;
    return {
      originalPrice,
      price,
      stock: Math.max(0, variant.stock),
    };
  }

  const price = part.price != null && part.price > 0 ? part.price : part.originalPrice;
  return {
    originalPrice: part.originalPrice,
    price,
    stock: Math.max(0, part.stock),
  };
}

export function sparePartDisplayPrice(part: SparePartPricing & { variants?: SparePartVariant[] | null }): {
  price: number;
  originalPrice: number;
  fromPrice?: number;
} {
  if (!sparePartHasVariants(part)) {
    const resolved = resolveSparePartVariantPricing(part);
    return { price: resolved.price, originalPrice: resolved.originalPrice };
  }

  const prices = part.variants!.map((v) => resolveSparePartVariantPricing(part, v).price);
  const originals = part.variants!.map((v) => resolveSparePartVariantPricing(part, v).originalPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minOriginal = Math.min(...originals);

  return {
    price: minPrice,
    originalPrice: minOriginal,
    ...(minPrice !== maxPrice ? { fromPrice: minPrice } : {}),
  };
}

export function findSparePartVariant(
  part: { variants?: SparePartVariant[] | null },
  variantId?: string | null,
): SparePartVariant | undefined {
  if (!variantId || !sparePartHasVariants(part)) return undefined;
  return part.variants!.find((v) => v.id === variantId);
}
