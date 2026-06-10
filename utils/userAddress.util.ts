import { PAKISTAN_CITIES } from '@/data/pakistanCities';

/** Cities with active online delivery (subset of Pakistan cities). */
export const SHIPPING_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
] as const;

export type ShippingCity = (typeof SHIPPING_CITIES)[number];

const PAKISTAN_CITY_SET = new Set(PAKISTAN_CITIES);

export interface CheckoutContactFields {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
}

/** Split a legacy single-line address (e.g. "street, Lahore") into street + city when possible. */
export function parseLegacyAddress(raw: string): { street: string; city: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { street: '', city: '' };

  const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const maybeCity = parts[parts.length - 1];
    if (PAKISTAN_CITY_SET.has(maybeCity)) {
      return {
        street: parts.slice(0, -1).join(', '),
        city: maybeCity,
      };
    }
  }

  return { street: trimmed, city: '' };
}

/** Build checkout form defaults from the logged-in user profile. */
export function checkoutDefaultsFromUser(user: {
  name: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
}): CheckoutContactFields {
  const storedCity = (user.city ?? '').trim();
  const storedAddress = (user.address ?? '').trim();

  let street = storedAddress;
  let city = storedCity;

  if (!city && storedAddress) {
    const parsed = parseLegacyAddress(storedAddress);
    street = parsed.street;
    city = parsed.city;
  }

  return {
    fullName: user.fullName ?? user.name,
    email: user.email,
    phone: (user.phoneNumber ?? '').trim(),
    city,
    address: street,
  };
}

/** Payload for PATCH /api/auth/me from checkout or order sync. */
export function profileUpdateFromCheckout(fields: {
  phone: string;
  city: string;
  address: string;
}): { phoneNumber: string; city: string; address: string } {
  return {
    phoneNumber: fields.phone.trim(),
    city: fields.city.trim(),
    address: fields.address.trim(),
  };
}
