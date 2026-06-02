const PLACEHOLDER_ADDR = /^(n\/a|na|none|-|—|\.)$/i;

export function isValidAddressPart(value?: string): value is string {
  const v = value?.trim();
  return Boolean(v && !PLACEHOLDER_ADDR.test(v));
}

export function formatDeliveryAddress(addr?: {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}): string | null {
  if (!addr) return null;
  const parts = [addr.street, addr.city, addr.state, addr.country].filter(isValidAddressPart);
  return parts.length ? parts.join(', ') : null;
}

export function fmtOrderDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function totalItemQuantity(items: { quantity?: number }[]): number {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function quantityLabel(items: { quantity?: number }[]): string {
  const qty = totalItemQuantity(items);
  return `${qty} item${qty !== 1 ? 's' : ''}`;
}

type OrderMetaInput = {
  status: string;
  createdAt: string;
  updatedAt?: string;
  deliveryDate?: string;
  paidAt?: string;
  paymentStatus?: string;
  items: { quantity?: number }[];
};

export function paymentMeta(order: OrderMetaInput): string | null {
  if (order.status === 'cancelled') return null;
  if (!order.paymentStatus) return null;
  if (order.paymentStatus === 'paid') {
    return order.paidAt ? `Paid on ${fmtOrderDate(order.paidAt)}` : 'Paid';
  }
  if (order.paymentStatus === 'pending') return 'Payment pending';
  if (order.paymentStatus === 'failed') return 'Payment failed';
  if (order.paymentStatus === 'refunded') return 'Refunded';
  return null;
}

export function orderMetaLine(order: OrderMetaInput): string {
  const qty = quantityLabel(order.items);
  const pay = paymentMeta(order);

  switch (order.status) {
    case 'cancelled': {
      const when = fmtOrderDate(order.updatedAt ?? order.createdAt);
      return pay ? `Cancelled on ${when} · ${qty} · ${pay}` : `Cancelled on ${when} · ${qty}`;
    }
    case 'delivered': {
      const when = fmtOrderDate(order.deliveryDate ?? order.updatedAt ?? order.createdAt);
      return pay ? `Delivered on ${when} · ${qty} · ${pay}` : `Delivered on ${when} · ${qty}`;
    }
    case 'shipped':
      return pay
        ? `Shipped · ${qty} · Ordered ${fmtOrderDate(order.createdAt)} · ${pay}`
        : `Shipped · ${qty} · Ordered ${fmtOrderDate(order.createdAt)}`;
    case 'processing':
      return pay
        ? `Processing · ${qty} · Ordered ${fmtOrderDate(order.createdAt)} · ${pay}`
        : `Processing · ${qty} · Ordered ${fmtOrderDate(order.createdAt)}`;
    case 'confirmed':
      return pay
        ? `Confirmed · ${qty} · Ordered ${fmtOrderDate(order.createdAt)} · ${pay}`
        : `Confirmed · ${qty} · Ordered ${fmtOrderDate(order.createdAt)}`;
    default:
      return pay
        ? `Ordered on ${fmtOrderDate(order.createdAt)} · ${qty} · ${pay}`
        : `Ordered on ${fmtOrderDate(order.createdAt)} · ${qty}`;
  }
}
