import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { absoluteUrl } from '@/lib/siteUrl';

/** Parse Alfalah listener/return POST body (form or JSON). */
export async function parseAlfalahCallbackBody(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const json = (await req.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(json)) {
      if (value !== null && value !== undefined) out[key] = String(value);
    }
    return out;
  }

  const text = await req.text();
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/** Page redirection channel ID per Alfalah APG docs. */
export const ALFA_CHANNEL_ID = '1001';

/** Credit/debit card — Alfalah SSO shows all merchant-enabled methods on their portal. */
export const ALFA_TRANSACTION_TYPE_CARD = '3';

export type AlfaConfig = {
  merchantId: string;
  storeId: string;
  merchantHash: string;
  merchantUsername: string;
  merchantPassword: string;
  key1: string;
  key2: string;
  sandbox: boolean;
};

export type AlfaHandshakeResult = {
  success: boolean;
  authToken: string;
  returnUrl: string;
  requestHash: string;
};

export type AlfaIpnResult = {
  transactionRef: string | null;
  status: 'Paid' | 'Failed' | 'SessionEnded' | 'Pending' | null;
  raw: Record<string, unknown>;
  isPaid: boolean;
  isFailed: boolean;
  isDecided: boolean;
};

export class AlfaPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlfaPaymentError';
  }
}

export function isAlfaConfigured(): boolean {
  const cfg = loadAlfaConfig(false);
  return Boolean(
    cfg?.merchantId &&
      cfg.storeId &&
      cfg.merchantHash &&
      cfg.merchantUsername &&
      cfg.merchantPassword &&
      cfg.key1 &&
      cfg.key2,
  );
}

/** Load Alfalah credentials from environment. Returns null when incomplete. */
export function loadAlfaConfig(strict = true): AlfaConfig | null {
  const config: AlfaConfig = {
    merchantId: process.env.ALFA_MERCHANT_ID?.trim() ?? '',
    storeId: process.env.ALFA_STORE_ID?.trim() ?? '',
    merchantHash: process.env.ALFA_MERCHANT_HASH?.trim() ?? '',
    merchantUsername: process.env.ALFA_MERCHANT_USERNAME?.trim() ?? '',
    merchantPassword: process.env.ALFA_MERCHANT_PASSWORD?.trim() ?? '',
    key1: process.env.ALFA_KEY1?.trim() ?? '',
    key2: process.env.ALFA_KEY2?.trim() ?? '',
    sandbox: process.env.ALFA_SANDBOX !== 'false',
  };

  const missing = (
    [
      ['ALFA_MERCHANT_ID', config.merchantId],
      ['ALFA_STORE_ID', config.storeId],
      ['ALFA_MERCHANT_HASH', config.merchantHash],
      ['ALFA_MERCHANT_USERNAME', config.merchantUsername],
      ['ALFA_MERCHANT_PASSWORD', config.merchantPassword],
      ['ALFA_KEY1', config.key1],
      ['ALFA_KEY2', config.key2],
    ] as const
  )
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    if (strict) {
      throw new AlfaPaymentError(
        `Missing Alfalah APG configuration: ${missing.join(', ')}. Copy Merchant ID, Store ID, Key1, and Key2 from Integration → Page Redirection in the Alfalah merchant portal.`,
      );
    }
    return null;
  }

  return config;
}

function alfaBaseUrl(sandbox: boolean): string {
  return sandbox ? 'https://sandbox.bankalfalah.com' : 'https://payments.bankalfalah.com';
}

function normalizeCallbackUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/** Alfalah does not accept localhost — ignore local callback URLs in env. */
function isLocalCallbackUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Alfalah return URL — must exactly match the URL in your Alfalah APG merchant portal.
 * Always uses the live site URL (NEXT_PUBLIC_APP_URL). Localhost is not supported by Alfalah.
 */
export function resolveAlfalahReturnUrl(_req?: NextRequest): string {
  const explicit = process.env.ALFA_RETURN_URL?.trim();
  if (explicit && !isLocalCallbackUrl(explicit)) {
    return normalizeCallbackUrl(explicit);
  }
  return absoluteUrl('/order-success');
}

/**
 * Alfalah listener URL — must match the Listener URL in your Alfalah APG merchant portal.
 */
export function resolveAlfalahListenerUrl(_req?: NextRequest): string {
  const explicit = process.env.ALFA_LISTENER_URL?.trim();
  if (explicit && !isLocalCallbackUrl(explicit)) {
    return normalizeCallbackUrl(explicit);
  }
  return absoluteUrl('/payments');
}

export function alfaReturnUrl(): string {
  return resolveAlfalahReturnUrl();
}

export function alfaListenerUrl(): string {
  return resolveAlfalahListenerUrl();
}

/** AES-128-CBC encryption per Alfalah APG specification. */
export function encryptAlfaRequest(
  data: Record<string, string | number>,
  key1: string,
  key2: string,
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    parts.push(`${key}=${value}`);
  }
  const plaintext = parts.join('&');

  const key = Buffer.from(key1, 'utf8');
  const iv = Buffer.from(key2, 'utf8');

  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return encrypted.toString('base64');
}

async function alfaHttpPost(url: string, data: Record<string, string>): Promise<string> {
  const body = new URLSearchParams(data).toString();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
    redirect: 'manual',
    signal: AbortSignal.timeout(20_000),
  });

  const text = await res.text();

  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get('location') ?? '';
    throw new AlfaPaymentError(
      `Alfalah returned redirect (${res.status}) instead of JSON${location ? `: ${location}` : ''}. ` +
        'For server-side handshake use HS_IsRedirectionRequest=0.',
    );
  }

  if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
    throw new AlfaPaymentError(
      'Alfalah returned HTML instead of JSON. Check Key1/Key2 and use HS_IsRedirectionRequest=0 for API handshake.',
    );
  }

  if (!res.ok) {
    throw new AlfaPaymentError(
      `Alfalah gateway HTTP ${res.status}: ${text.slice(0, 200) || res.statusText}`,
    );
  }
  return text;
}

async function alfaHttpGet(url: string): Promise<string> {
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  const text = await res.text();
  if (!res.ok) {
    throw new AlfaPaymentError(
      `Alfalah IPN HTTP ${res.status}: ${text.slice(0, 200) || res.statusText}`,
    );
  }
  return text;
}

/** Step 1 — Handshake with Alfalah to obtain AuthToken. */
export async function alfaHandshake(params: {
  orderRef: string;
  returnUrl?: string;
  req?: NextRequest;
}): Promise<AlfaHandshakeResult> {
  const config = loadAlfaConfig(true)!;
  const returnUrl = params.returnUrl ?? resolveAlfalahReturnUrl(params.req);

  const post: Record<string, string> = {
    // 0 = server API returns JSON AuthToken; 1 = browser form redirect (portal test page only).
    HS_IsRedirectionRequest: '0',
    HS_ChannelId: ALFA_CHANNEL_ID,
    HS_MerchantId: config.merchantId,
    HS_StoreId: config.storeId,
    HS_ReturnURL: returnUrl,
    HS_MerchantHash: config.merchantHash,
    HS_MerchantUsername: config.merchantUsername,
    HS_MerchantPassword: config.merchantPassword,
    HS_TransactionReferenceNumber: params.orderRef,
  };

  const requestHash = encryptAlfaRequest(post, config.key1, config.key2);
  post.HS_RequestHash = requestHash;

  const url = `${alfaBaseUrl(config.sandbox)}/HS/HS/HS`;
  const body = await alfaHttpPost(url, post);

  if (!body.trim()) {
    throw new AlfaPaymentError('Empty response from Alfalah handshake endpoint.');
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new AlfaPaymentError(`Invalid JSON from Alfalah handshake: ${body.slice(0, 200)}`);
  }

  const authToken = typeof json.AuthToken === 'string' ? json.AuthToken : '';
  if (!authToken) {
    const msg =
      json.message ??
      json.Message ??
      json.ErrorMessage ??
      JSON.stringify(json);
    throw new AlfaPaymentError(
      `Alfalah rejected handshake: ${String(msg)}. Return URL sent: ${returnUrl}. ` +
        'It must exactly match the Return URL in your Alfalah APG portal (including http/https and no trailing slash). ' +
        'After resetting credentials, copy the new Merchant Hash, Username, and Password from the portal.',
    );
  }

  const successFlag = json.success;
  const success =
    successFlag === true ||
    successFlag === 'true' ||
    successFlag === 'True';

  return {
    success,
    authToken,
    // Always use our configured return URL — Alfalah may echo back the merchant homepage.
    returnUrl,
    requestHash,
  };
}

/** Step 2 — Build SSO redirect form fields for customer payment portal. */
export function buildAlfaSsoFields(params: {
  handshake: AlfaHandshakeResult;
  orderRef: string;
  amount: number;
  email?: string;
  phone?: string;
  currency?: string;
}): { actionUrl: string; fields: Record<string, string> } {
  const config = loadAlfaConfig(true)!;

  const post: Record<string, string> = {
    AuthToken: params.handshake.authToken,
    RequestHash: params.handshake.requestHash,
    ChannelId: ALFA_CHANNEL_ID,
    Currency: params.currency ?? 'PKR',
    ReturnURL: params.handshake.returnUrl,
    MerchantId: config.merchantId,
    StoreId: config.storeId,
    MerchantHash: config.merchantHash,
    MerchantUsername: config.merchantUsername,
    MerchantPassword: config.merchantPassword,
    TransactionTypeId: ALFA_TRANSACTION_TYPE_CARD,
    TransactionReferenceNumber: params.orderRef,
    TransactionAmount: String(params.amount),
  };

  if (params.email) post.EmailAddress = params.email;
  if (params.phone) post.MobileNumber = params.phone;

  post.RequestHash = encryptAlfaRequest(post, config.key1, config.key2);

  return {
    actionUrl: `${alfaBaseUrl(config.sandbox)}/SSO/SSO/SSO`,
    fields: post,
  };
}

function parseIpnPayload(body: string): Record<string, unknown> {
  const trimmed = body.trim();
  if (!trimmed) return {};

  try {
    const first = JSON.parse(trimmed) as unknown;
    if (typeof first === 'string') {
      try {
        const second = JSON.parse(first) as unknown;
        return typeof second === 'object' && second !== null
          ? (second as Record<string, unknown>)
          : {};
      } catch {
        return {};
      }
    }
    if (typeof first === 'object' && first !== null) {
      return first as Record<string, unknown>;
    }
  } catch {
    /* fall through */
  }
  return {};
}

function mapIpnStatus(raw: Record<string, unknown>): AlfaIpnResult['status'] {
  const statusRaw =
    raw.TransactionStatus ?? raw.transaction_status ?? raw.transactionStatus;

  if (typeof statusRaw === 'string') {
    const normalized = statusRaw.trim().toLowerCase();
    if (normalized === 'paid') return 'Paid';
    if (normalized === 'failed') return 'Failed';
    if (normalized === 'sessionended' || normalized === 'session ended') {
      return 'SessionEnded';
    }
    if (normalized === 'pending') return 'Pending';
  }

  const responseCode = raw.ResponseCode ?? raw.response_code ?? raw.RC;
  if (responseCode === '00' || responseCode === 0) return 'Paid';
  if (
    responseCode !== undefined &&
    responseCode !== null &&
    responseCode !== '' &&
    responseCode !== '00'
  ) {
    return 'Failed';
  }

  if (statusRaw === null || statusRaw === undefined || statusRaw === '') {
    return 'Pending';
  }
  return null;
}

function buildIpnResult(orderRef: string, raw: Record<string, unknown>): AlfaIpnResult {
  const status = mapIpnStatus(raw);
  const transactionRef =
    typeof raw.TransactionReferenceNumber === 'string'
      ? raw.TransactionReferenceNumber
      : typeof raw.O === 'string'
        ? raw.O
        : orderRef;

  return {
    transactionRef,
    status,
    raw,
    isPaid: status === 'Paid',
    isFailed: status === 'Failed' || status === 'SessionEnded',
    isDecided: status === 'Paid' || status === 'Failed' || status === 'SessionEnded',
  };
}

/** Step 3 — Verify payment status via Alfalah IPN endpoint. */
export async function alfaCheckStatus(orderRef: string): Promise<AlfaIpnResult> {
  const config = loadAlfaConfig(true)!;
  const url = `${alfaBaseUrl(config.sandbox)}/HS/api/IPN/OrderStatus/${config.merchantId}/${config.storeId}/${encodeURIComponent(orderRef)}`;
  const body = await alfaHttpGet(url);
  const raw = parseIpnPayload(body);
  return buildIpnResult(orderRef, raw);
}

/** Fetch IPN from Alfalah listener callback URL (POST body includes `url=...`). */
export async function alfaFetchIpnFromUrl(ipnUrl: string): Promise<AlfaIpnResult> {
  const orderRef = extractOrderRefFromIpnUrl(ipnUrl) ?? '';
  const body = await alfaHttpGet(ipnUrl);
  const raw = parseIpnPayload(body);
  return buildIpnResult(orderRef, raw);
}

/** Poll IPN when Alfalah may need a few seconds to finalize status. */
export async function alfaCheckStatusWithRetry(
  orderRef: string,
  maxRetries = 8,
  delayMs = 3000,
): Promise<AlfaIpnResult> {
  let last: AlfaIpnResult = {
    transactionRef: orderRef,
    status: 'Pending',
    raw: {},
    isPaid: false,
    isFailed: false,
    isDecided: false,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    last = await alfaCheckStatus(orderRef);
    if (last.isDecided) return last;
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return last;
}

/** Extract order reference from Alfalah return URL query (`?O=ORD-xxx`). */
export function extractOrderRefFromAlfalahReturn(
  searchParams: URLSearchParams,
): string | null {
  const directKeys = ['O', 'o', 'TransactionReferenceNumber', 'orderRef', 'orderNumber', 'OrderId'];
  for (const key of directKeys) {
    const value = searchParams.get(key)?.trim();
    if (value) return value;
  }
  return extractOrderRefFromCallback(
    Object.fromEntries(searchParams.entries()) as Record<string, string | undefined>,
  );
}

/** Extract order reference from Alfalah IPN callback URL path. */
export function extractOrderRefFromIpnUrl(url: string): string | null {
  const match = url.match(/IPN\/OrderStatus\/[^/]+\/[^/]+\/([^/?&#]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Extract Alfalah IPN URL from listener POST body or query string. */
export function extractIpnUrlFromListener(
  data: Record<string, string | undefined>,
  searchParams?: URLSearchParams,
): string | null {
  const raw = data.url ?? searchParams?.get('url') ?? undefined;
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  if (trimmed.includes('IPN/OrderStatus') || trimmed.includes('ipn/orderstatus')) {
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;
  }
  return null;
}

/** Extract order reference from Alfalah POST callback body. */
export function extractOrderRefFromCallback(
  data: Record<string, string | undefined>,
): string | null {
  const candidates = [
    data.O,
    data.o,
    data.TransactionReferenceNumber,
    data.HS_TransactionReferenceNumber,
    data.transactionReferenceNumber,
    data.orderRef,
    data.orderNumber,
    data.ORDER_ID,
    data.OrderId,
  ];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/** Parse transaction amount from Alfalah IPN or return callback payload. */
export function extractAlfalahTransactionAmount(raw: Record<string, unknown>): number | null {
  const candidates = [
    raw.TransactionAmount,
    raw.transaction_amount,
    raw.Transaction_Amount,
    raw.Amount,
    raw.amount,
  ];

  for (const val of candidates) {
    if (val === undefined || val === null || val === '') continue;
    const parsed =
      typeof val === 'number'
        ? val
        : Number.parseFloat(String(val).replace(/,/g, '').trim());
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return null;
}

export type AlfalahAmountVerifyOptions = {
  /** When true, missing Alfalah amount is treated as a verification failure. */
  strict: boolean;
};

/** Ensure Alfalah-reported amount matches the checkout session total. */
export function verifyAlfalahPaymentAmount(
  expectedTotal: number,
  ipnRaw: Record<string, unknown>,
  options: AlfalahAmountVerifyOptions,
): { ok: true } | { ok: false; reason: string } {
  const ipnAmount = extractAlfalahTransactionAmount(ipnRaw);

  if (ipnAmount === null) {
    if (options.strict) {
      return { ok: false, reason: 'Payment amount missing from Alfalah confirmation.' };
    }
    return { ok: true };
  }

  const expected = Math.round(expectedTotal * 100) / 100;
  const received = Math.round(ipnAmount * 100) / 100;

  if (Math.abs(expected - received) > 0.01) {
    return {
      ok: false,
      reason: `Payment amount mismatch: expected PKR ${expected}, received PKR ${received}.`,
    };
  }

  return { ok: true };
}

/** RC=00 return URL fallback is for local/dev testing only — production relies on IPN/listener. */
export function isAlfalahReturnFallbackAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/** Alfalah customer return uses RC=00 for successful payment. */
export function isAlfalahReturnSuccess(params: URLSearchParams): boolean {
  const rc = params.get('RC') ?? params.get('ResponseCode') ?? params.get('response_code');
  return rc === '00' || rc === '0';
}

export function isAlfalahReturnFailed(params: URLSearchParams): boolean {
  const rc = params.get('RC') ?? params.get('ResponseCode') ?? params.get('response_code');
  return Boolean(rc && rc !== '00' && rc !== '0');
}
