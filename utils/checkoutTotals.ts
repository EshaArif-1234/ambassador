type PricedItem = { price: number; quantity: number };

export function getCheckoutTotals(items: PricedItem[], deliveryCharges = 0) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCharges = subtotal > 0 ? Math.max(0, deliveryCharges) : 0;
  return {
    subtotal,
    shippingCharges,
    /** Alias used in orders API / DB */
    deliveryCharges: shippingCharges,
    total: subtotal + shippingCharges,
  };
}
