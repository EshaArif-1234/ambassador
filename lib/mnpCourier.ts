export type MnpConfig = {
  baseUrl: string;
  username: string;
  password: string;
  accountNo: string;
  locationId: string;
  insertType: number;
  returnLocation: number;
  subAccountId: number;
  service: 'Overnight' | 'Second Day';
  trackingId: string;
};

export class MnpCourierError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'MnpCourierError';
    this.statusCode = statusCode;
  }
}

const DEFAULT_BASE_URL = 'https://mnpcourier.com/mycodapi/api';
const DEFAULT_TRACKING_BASE = 'https://tracking.mulphilog.com.pk';
const CITIES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let citiesCache: { fetchedAt: number; cities: string[] } | null = null;

function parseIntEnv(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function loadMnpConfig(required: boolean): MnpConfig | null {
  const username = process.env.MNP_USERNAME?.trim();
  const password = process.env.MNP_PASSWORD?.trim();
  const accountNo = process.env.MNP_ACCOUNT_NO?.trim();
  const locationId = process.env.MNP_LOCATION_ID?.trim() ?? '';
  const baseUrl = (process.env.MNP_API_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');

  if (!username || !password || !accountNo) {
    if (required) {
      throw new MnpCourierError(
        'M&P Courier credentials are not configured. Set MNP_USERNAME, MNP_PASSWORD, and MNP_ACCOUNT_NO.',
      );
    }
    return null;
  }

  const serviceRaw = process.env.MNP_SERVICE?.trim();
  const service: MnpConfig['service'] =
    serviceRaw === 'Second Day' ? 'Second Day' : 'Overnight';

  return {
    baseUrl,
    username,
    password,
    accountNo,
    locationId,
    insertType: parseIntEnv(process.env.MNP_INSERT_TYPE, 19),
    returnLocation: parseIntEnv(
      process.env.MNP_RETURN_LOCATION,
      parseIntEnv(process.env.MNP_LOCATION_ID, 0),
    ),
    subAccountId: parseIntEnv(process.env.MNP_SUB_ACCOUNT_ID, 0),
    service,
    trackingId: process.env.MNP_TRACKING_ID?.trim() || '4',
  };
}

export function isMnpConfigured(): boolean {
  return loadMnpConfig(false) !== null;
}

export function isMnpBookingConfigured(): boolean {
  const config = loadMnpConfig(false);
  return Boolean(config?.locationId);
}

/** Strip characters M&P rejects in text fields. */
export function sanitizeMnpText(value: string, maxLength: number): string {
  return value.replace(/'/g, '').trim().slice(0, maxLength);
}

/** Parse M&P Get_Cities_All response: [{ City: ["LAHORE", ...] }] */
export function parseMnpCitiesResponse(body: unknown): string[] {
  let rawCities: unknown[] = [];

  if (Array.isArray(body)) {
    for (const entry of body) {
      if (entry && typeof entry === 'object' && Array.isArray((entry as { City?: unknown }).City)) {
        rawCities = (entry as { City: unknown[] }).City;
        break;
      }
    }
  } else if (body && typeof body === 'object' && Array.isArray((body as { City?: unknown }).City)) {
    rawCities = (body as { City: unknown[] }).City;
  }

  const cities = rawCities
    .filter((city): city is string => typeof city === 'string' && city.trim().length > 0)
    .map((city) => city.trim());

  return [...new Set(cities)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function resolveMnpCityName(input: string, mnpCities: string[]): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  const exact = mnpCities.find((city) => city === trimmed);
  if (exact) return exact;
  const lower = trimmed.toLowerCase();
  const match = mnpCities.find((city) => city.toLowerCase() === lower);
  return match ?? trimmed;
}

async function mnpFetchJson(url: string, init?: RequestInit): Promise<{ status: number; body: unknown }> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    throw new MnpCourierError(`Could not reach M&P Courier API: ${message}`);
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new MnpCourierError('M&P Courier returned an invalid response.', res.status);
    }
  }

  return { status: res.status, body };
}

function authQuery(config: MnpConfig): URLSearchParams {
  const params = new URLSearchParams();
  params.set('username', config.username);
  params.set('password', config.password);
  params.set('AccountNo', config.accountNo);
  return params;
}

/** GET /Branches/Get_Cities_All */
export async function mnpGetCitiesAll(): Promise<string[]> {
  const config = loadMnpConfig(true)!;
  const url = new URL(`${config.baseUrl}/Branches/Get_Cities_All`);
  const params = authQuery(config);
  url.search = params.toString();

  const { status, body } = await mnpFetchJson(url.toString(), { method: 'GET' });
  if (status >= 400) {
    const detail =
      body && typeof body === 'object' && 'Message' in body
        ? String((body as { Message: unknown }).Message)
        : `M&P Get Cities failed (${status}).`;
    throw new MnpCourierError(detail, status);
  }

  const cities = parseMnpCitiesResponse(body);
  if (!cities.length) {
    throw new MnpCourierError('M&P Courier returned an empty city list.');
  }

  return cities;
}

export async function mnpGetCitiesAllCached(forceRefresh = false): Promise<string[]> {
  if (!forceRefresh && citiesCache && Date.now() - citiesCache.fetchedAt < CITIES_CACHE_TTL_MS) {
    return citiesCache.cities;
  }

  const cities = await mnpGetCitiesAll();
  citiesCache = { fetchedAt: Date.now(), cities };
  return cities;
}

export function clearMnpCitiesCache(): void {
  citiesCache = null;
}

export type MnpLocation = {
  locationId: string;
  locationName: string;
  locationAddress?: string;
};

/** GET /Locations/Get_locations */
export async function mnpGetLocations(): Promise<MnpLocation[]> {
  const config = loadMnpConfig(true)!;
  const url = new URL(`${config.baseUrl}/Locations/Get_locations`);
  url.search = authQuery(config).toString();

  const { status, body } = await mnpFetchJson(url.toString(), { method: 'GET' });
  if (status >= 400) {
    throw new MnpCourierError(`M&P Get Locations failed (${status}).`, status);
  }

  if (process.env.MNP_DEBUG === 'true') {
    console.log('[mnpGetLocations raw]', JSON.stringify(body).slice(0, 2000));
  }

  if (!Array.isArray(body)) return [];

  const locations: MnpLocation[] = [];
  for (const row of body) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const locationId = String(
      record.LocationID ??
        record.locationID ??
        record.locationId ??
        record.LocationId ??
        record.ID ??
        record.id ??
        '',
    ).trim();
    const locationName = String(
      record.LocationName ?? record.locationName ?? record.Name ?? record.name ?? '',
    ).trim();
    if (!locationId || !locationName) continue;
    locations.push({
      locationId,
      locationName,
      locationAddress: String(record.LocationAddress ?? record.locationAddress ?? '').trim() || undefined,
    });
  }

  return locations;
}

export type MnpBookingInput = {
  consigneeName: string;
  consigneeAddress: string;
  consigneeMobNo: string;
  consigneeEmail: string;
  destinationCityName: string;
  pieces: number;
  weight: number;
  codAmount: number;
  custRefNo: string;
  productDetails: string;
  fragile?: 'YES' | 'NO';
  remarks?: string;
  insuranceValue?: string;
  service?: 'Overnight' | 'Second Day';
};

export type MnpBookingResult = {
  isSuccess: boolean;
  message: string;
  orderReferenceId: string;
};

function parseBookingResponse(body: unknown): MnpBookingResult {
  const rows = Array.isArray(body) ? body : body ? [body] : [];
  const first = rows[0];
  if (!first || typeof first !== 'object') {
    throw new MnpCourierError('M&P booking returned an unexpected response.');
  }

  const record = first as Record<string, unknown>;
  const isSuccessRaw = String(record.isSuccess ?? record.IsSuccess ?? '').toLowerCase();
  const isSuccess = isSuccessRaw === 'true' || isSuccessRaw === '1' || isSuccessRaw === 'yes';

  return {
    isSuccess,
    message: String(record.message ?? record.Message ?? '').trim(),
    orderReferenceId: String(
      record.orderReferenceId ?? record.OrderReferenceId ?? record.orderReferenceID ?? '',
    ).trim(),
  };
}

/** POST /Booking/InsertBookingData */
export async function mnpInsertBooking(input: MnpBookingInput): Promise<MnpBookingResult> {
  const config = loadMnpConfig(true)!;
  if (!config.locationId) {
    throw new MnpCourierError(
      'M&P booking location is not configured. Set MNP_LOCATION_ID from your M&P portal.',
    );
  }

  const payload = {
    username: config.username,
    password: config.password,
    AccountNo: config.accountNo,
    InsertType: config.insertType,
    ReturnLocation: config.returnLocation,
    subAccountId: config.subAccountId,
    locationID: config.locationId,
    consigneeName: sanitizeMnpText(input.consigneeName, 50),
    consigneeAddress: sanitizeMnpText(input.consigneeAddress, 200),
    consigneeMobNo: sanitizeMnpText(input.consigneeMobNo.replace(/[^\d-]/g, ''), 16),
    consigneeEmail: sanitizeMnpText(input.consigneeEmail, 50),
    destinationCityName: sanitizeMnpText(input.destinationCityName, 100),
    pieces: Math.max(1, Math.floor(input.pieces)),
    weight: Math.max(0.1, Number(input.weight) || 0.1),
    codAmount: Math.max(0, Math.floor(input.codAmount)),
    custRefNo: sanitizeMnpText(input.custRefNo, 50),
    productDetails: sanitizeMnpText(input.productDetails, 200),
    fragile: input.fragile === 'YES' ? 'YES' : 'NO',
    service: input.service ?? config.service,
    remarks: sanitizeMnpText(input.remarks ?? '', 200),
    insuranceValue: sanitizeMnpText(input.insuranceValue ?? '0', 20),
  };

  const url = `${config.baseUrl}/Booking/InsertBookingData`;
  const { status, body } = await mnpFetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (status >= 400) {
    throw new MnpCourierError(`M&P booking request failed (${status}).`, status);
  }

  const result = parseBookingResponse(body);
  if (!result.isSuccess) {
    throw new MnpCourierError(result.message || 'M&P booking was rejected.');
  }
  if (!result.orderReferenceId) {
    throw new MnpCourierError('M&P booking succeeded but no consignment reference was returned.');
  }

  return result;
}

export type MnpTrackingEvent = {
  status: string;
  narration: string;
  location?: string;
  time?: string;
};

export type MnpTrackingResult = {
  success: boolean;
  message: string;
  consignmentNumber?: string;
  destinationCity?: string;
  originCity?: string;
  trackingStatus?: string;
  events: MnpTrackingEvent[];
};

/** GET tracking.mulphilog.com.pk/api/CNTracking */
export async function mnpTrackConsignment(consignment: string): Promise<MnpTrackingResult> {
  const config = loadMnpConfig(true)!;
  const cn = consignment.trim();
  if (!cn) {
    throw new MnpCourierError('Consignment number is required.');
  }

  const trackingBase = (process.env.MNP_TRACKING_BASE_URL?.trim() || DEFAULT_TRACKING_BASE).replace(
    /\/+$/,
    '',
  );
  const url = new URL(`${trackingBase}/api/CNTracking`);
  url.searchParams.set('consignment', cn);
  url.searchParams.set('id', config.trackingId);

  const { status, body } = await mnpFetchJson(url.toString(), { method: 'GET' });
  if (status >= 400) {
    throw new MnpCourierError(`M&P tracking request failed (${status}).`, status);
  }

  const rows = Array.isArray(body) ? body : [];
  const first = rows[0];
  if (!first || typeof first !== 'object') {
    return { success: false, message: 'No tracking data returned.', events: [] };
  }

  const envelope = first as Record<string, unknown>;
  const isSuccess = String(envelope.isSuccess ?? '').toLowerCase() === 'true';
  const message = String(envelope.message ?? '').trim();
  const details = Array.isArray(envelope.tracking_Details) ? envelope.tracking_Details : [];
  const detail = (details[0] ?? null) as Record<string, unknown> | null;

  const events: MnpTrackingEvent[] = [];
  const history = detail && Array.isArray(detail.CNTrackingDetail) ? detail.CNTrackingDetail : [];
  for (const row of history) {
    if (!row || typeof row !== 'object') continue;
    const event = row as Record<string, unknown>;
    events.push({
      status: String(event.TrackingStatus ?? '').trim(),
      narration: String(event.TrackingNarration ?? '').trim(),
      location: String(event.Location ?? '').trim() || undefined,
      time: String(event.TransactionTime ?? '').trim() || undefined,
    });
  }

  const latestStatus = events[0]?.status;

  return {
    success: isSuccess,
    message: message || (isSuccess ? 'Tracking loaded.' : 'Tracking unavailable.'),
    consignmentNumber: detail ? String(detail.ConsignmentNumber ?? cn) : cn,
    destinationCity: detail ? String(detail.DestinationCity ?? '').trim() || undefined : undefined,
    originCity: detail ? String(detail.OriginCity ?? '').trim() || undefined : undefined,
    trackingStatus: latestStatus,
    events,
  };
}
