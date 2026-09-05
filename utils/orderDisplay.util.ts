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

export function displayText(value?: string | null): string {
  const v = value?.trim();
  return v ? v : '—';
}

export function formatOrderDateTime(value?: string | Date | null): string {
  if (value == null || value === '') return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function formatPaymentMethodLabel(method?: string): string {
  const raw = method?.trim();
  if (!raw) return '—';

  const apgSplit = raw.match(/^Bank Alfalah APG\s*[·•-]\s*(.+)$/i);
  if (apgSplit) return apgSplit[1].trim();
  if (/^bank alfalah apg$/i.test(raw)) return 'Bank Alfalah APG';

  const key = raw.toLowerCase();
  if (key === 'card' || key === 'credit/debit card') return 'Credit/Debit Card';
  if (key === 'bank' || key === 'bank transfer') return 'Bank Transfer';
  if (key === 'online') return 'Online Payment';
  if (key.includes('alfa wallet')) return 'Alfa Wallet';
  if (key.includes('alfalah bank')) return 'Alfalah Bank Account';
  if (key.includes('card on delivery')) return 'Card on Delivery';
  if (key.includes('jazzcash') || key.includes('jazz cash')) return 'JazzCash';
  if (key.includes('raast')) return 'RAAST QR';
  return raw;
}

export function normalizeLineItemTotal(item: {
  price?: number;
  quantity?: number;
  total?: number;
}): number {
  if (typeof item.total === 'number' && !Number.isNaN(item.total)) return item.total;
  return (Number(item.price) || 0) * (Number(item.quantity) || 0);
}

export function resolveOrderSubtotal(order: {
  subtotal?: number;
  items: { price?: number; quantity?: number; total?: number }[];
}): number {
  if (typeof order.subtotal === 'number' && !Number.isNaN(order.subtotal)) return order.subtotal;
  return order.items.reduce((sum, item) => sum + normalizeLineItemTotal(item), 0);
}

export function resolveOrderDeliveryCharges(order: {
  deliveryCharges?: number;
  subtotal?: number;
  totalAmount?: number;
}): number {
  if (typeof order.deliveryCharges === 'number' && !Number.isNaN(order.deliveryCharges)) {
    return order.deliveryCharges;
  }
  const subtotal = order.subtotal ?? 0;
  const total = order.totalAmount ?? 0;
  return Math.max(total - subtotal, 0);
}

export function formatFullShippingAddress(addr?: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string {
  if (!addr) return '—';
  const parts = [
    isValidAddressPart(addr.street) ? addr.street : null,
    isValidAddressPart(addr.city) ? addr.city : null,
    isValidAddressPart(addr.state) ? addr.state : null,
    isValidAddressPart(addr.zipCode) ? addr.zipCode : null,
    isValidAddressPart(addr.country) ? addr.country : null,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
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
