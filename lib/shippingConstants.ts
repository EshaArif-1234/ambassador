export const SHIPPING_RATE_PKR_PER_KG = 100;

export function deliveryChargesFromWeightKg(totalWeightKg: number): number {
  if (totalWeightKg <= 0) return 0;
  return Math.ceil(totalWeightKg) * SHIPPING_RATE_PKR_PER_KG;
}
