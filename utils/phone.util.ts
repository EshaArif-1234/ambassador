/** Strip spaces, dashes, and other formatting from a phone number. */
export function normalizePhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('92')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

/** Accept Pakistani mobile (3XXXXXXXXX) and common landline/UAN lengths. */
export function isValidPakistanPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) return false;

  const normalized = normalizePhoneDigits(raw);
  if (/^3[0-9]{9}$/.test(normalized)) return true;

  // Landline / UAN e.g. 042-111-313-106
  if (/^0[0-9]{9,11}$/.test(digits)) return true;

  return false;
}
