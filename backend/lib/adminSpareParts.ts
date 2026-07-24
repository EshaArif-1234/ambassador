export function parseSparePartPrice(body: {
  price?: unknown;
  originalPrice?: unknown;
}): { ok: true; price?: number; originalPrice: number } | { ok: false; message: string } {
  const originalPrice = Number(body.originalPrice ?? body.price ?? 0);
  if (!originalPrice || originalPrice <= 0) {
    return { ok: false, message: 'A valid price is required.' };
  }

  const priceRaw = body.price;
  const price =
    priceRaw === '' || priceRaw == null || priceRaw === undefined ? undefined : Number(priceRaw);

  if (price != null && (Number.isNaN(price) || price < 0)) {
    return { ok: false, message: 'Invalid sale price.' };
  }
  if (price != null && price > originalPrice) {
    return { ok: false, message: 'Sale price cannot exceed original price.' };
  }

  return { ok: true, price, originalPrice };
}
