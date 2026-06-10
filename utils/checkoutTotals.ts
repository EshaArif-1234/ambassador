export const SHIPPING_CHARGE_PKR = 200;

type PricedItem = { price: number; quantity: number };

export function getCheckoutTotals(items: PricedItem[]) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCharges = subtotal > 0 ? SHIPPING_CHARGE_PKR : 0;
  return {
    subtotal,
    shippingCharges,
    /** Alias used in orders API / DB */
    deliveryCharges: shippingCharges,
    total: subtotal + shippingCharges,
  };
}
