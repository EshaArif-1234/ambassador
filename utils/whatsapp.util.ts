/** Ambassador business WhatsApp (international format, digits only). */
const DEFAULT_WHATSAPP_NUMBER = '923314937412';

/** Strip +, spaces, dashes — wa.me requires digits only. */
export function normalizeWhatsAppNumber(raw?: string): string {
  const cleaned = (raw ?? '').replace(/\D/g, '');
  return cleaned.length >= 10 ? cleaned : DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(message: string, phone?: string): string {
  const number = normalizeWhatsAppNumber(phone ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const text = message.trim();
  if (!text) {
    return `https://wa.me/${number}`;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Open WhatsApp — falls back when pop-ups are blocked (common on live sites). */
export function openWhatsApp(message: string, phone?: string): void {
  const url = buildWhatsAppUrl(message, phone);
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    window.location.assign(url);
  }
}
