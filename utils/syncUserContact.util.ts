import type { NextRequest } from 'next/server';
import User from '@/backend/models/User.model';
import { extractToken, verifyToken } from '@/utils/jwt.util';
import { profileUpdateFromCheckout } from '@/utils/userAddress.util';

/**
 * Update the logged-in user's default phone, city, and street address
 * when checkout/order contact matches their account email.
 */
export async function syncUserContactFromCheckout(
  req: NextRequest,
  customerEmail: string,
  contact: { phone: string; city: string; address: string }
): Promise<void> {
  const token = extractToken(req);
  if (!token) return;

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return;
  }

  const userId = typeof decoded.id === 'string' ? decoded.id : String(decoded.sub ?? '');
  if (!userId) return;

  const user = await User.findById(userId);
  if (!user) return;

  const normalizedOrderEmail = customerEmail.trim().toLowerCase();
  if (user.email.toLowerCase() !== normalizedOrderEmail) return;

  const { phoneNumber, city, address } = profileUpdateFromCheckout(contact);
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (city) user.city = city;
  if (address) user.address = address;

  await user.save();
}
