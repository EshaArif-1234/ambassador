/**
 * Bank Alfalah APG payment methods enabled on the merchant hosted checkout page.
 * TransactionTypeId values come from Alfalah APG integration docs / IPN responses.
 */
export const ALFA_TRANSACTION_TYPE_IDS = {
  ALFA_WALLET: '1',
  BANK_ACCOUNT: '2',
  CREDIT_DEBIT_CARD: '3',
  CARD_ON_DELIVERY: '6',
  JAZZCASH: '10',
  RAAST_QR: '12',
} as const;

export type AlfalahGatewayChannel =
  | 'all'
  | 'alfa_wallet'
  | 'bank_account'
  | 'card'
  | 'card_on_delivery'
  | 'jazzcash'
  | 'raast'
  | 'other';

export const ALFALAH_GATEWAY_CHANNELS: {
  id: Exclude<AlfalahGatewayChannel, 'all' | 'other'>;
  label: string;
  hint: string;
}[] = [
  { id: 'alfa_wallet', label: 'Alfa Wallet', hint: 'Alfalah wallet' },
  { id: 'bank_account', label: 'Alfalah Bank Account', hint: 'Bank account' },
  { id: 'card', label: 'Credit/Debit Card', hint: 'Card payment' },
  { id: 'card_on_delivery', label: 'Card on Delivery', hint: 'Pay on delivery' },
  { id: 'jazzcash', label: 'JazzCash', hint: 'Mobile wallet' },
  { id: 'raast', label: 'RAAST QR', hint: 'Instant payment' },
];

const TYPE_ID_LABELS: Record<string, string> = {
  [ALFA_TRANSACTION_TYPE_IDS.ALFA_WALLET]: 'Alfa Wallet',
  [ALFA_TRANSACTION_TYPE_IDS.BANK_ACCOUNT]: 'Alfalah Bank Account',
  [ALFA_TRANSACTION_TYPE_IDS.CREDIT_DEBIT_CARD]: 'Credit/Debit Card',
  [ALFA_TRANSACTION_TYPE_IDS.CARD_ON_DELIVERY]: 'Card on Delivery',
  [ALFA_TRANSACTION_TYPE_IDS.JAZZCASH]: 'JazzCash',
  '11': 'JazzCash',
  [ALFA_TRANSACTION_TYPE_IDS.RAAST_QR]: 'RAAST QR',
};

const ALFALAH_GATEWAY_PREFIX = 'Bank Alfalah APG';

export function extractAlfalahTransactionTypeId(raw: Record<string, unknown>): string | null {
  const keys = [
    'TransactionTypeId',
    'transaction_type_id',
    'transactionTypeId',
    'payment_method',
    'PaymentMethod',
  ];

  for (const key of keys) {
    const value = raw[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return null;
}

export function alfalahMethodLabelFromTypeId(typeId: string | null | undefined): string | null {
  if (!typeId) return null;
  return TYPE_ID_LABELS[typeId] ?? null;
}

/** Store a gateway label that admin + customer views can display consistently. */
export function formatAlfalahGatewayMethod(raw: Record<string, unknown>): string {
  const label = alfalahMethodLabelFromTypeId(extractAlfalahTransactionTypeId(raw));
  if (label) return `${ALFALAH_GATEWAY_PREFIX} · ${label}`;
  return ALFALAH_GATEWAY_PREFIX;
}

export function resolveAlfalahGatewayChannel(
  gatewayMethod: string,
  paymentMethod: string,
): AlfalahGatewayChannel {
  const raw = `${gatewayMethod} ${paymentMethod}`.toLowerCase();

  if (raw.includes('alfa wallet')) return 'alfa_wallet';
  if (raw.includes('alfalah bank') || raw.includes('bank account')) return 'bank_account';
  if (raw.includes('card on delivery')) return 'card_on_delivery';
  if (raw.includes('raast')) return 'raast';
  if (raw.includes('jazzcash') || raw.includes('jazz cash')) return 'jazzcash';
  if (
    raw.includes('credit/debit') ||
    raw.includes('debit card') ||
    raw.includes('prepaid card') ||
    (/\bcard\b/.test(raw) && !raw.includes('delivery'))
  ) {
    return 'card';
  }
  if (raw.includes('alfalah') || raw.includes('apg')) return 'card';
  return 'other';
}
