/** POST a hidden form to Alfalah — fastest path to the hosted payment page. */
export function submitAlfalahRedirectForm(
  actionUrl: string,
  fields: Record<string, string>,
): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl;
  form.style.display = 'none';
  form.setAttribute('accept-charset', 'UTF-8');

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export const ALFA_REDIRECT_STORAGE_KEY = 'alfaPaymentRedirect';

export type AlfalahRedirectPayload = {
  actionUrl: string;
  fields: Record<string, string>;
  orderId: string;
};

export function storeAlfalahRedirect(payload: AlfalahRedirectPayload): void {
  sessionStorage.setItem(ALFA_REDIRECT_STORAGE_KEY, JSON.stringify(payload));
}

export function readAlfalahRedirect(): AlfalahRedirectPayload | null {
  try {
    const raw = sessionStorage.getItem(ALFA_REDIRECT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AlfalahRedirectPayload;
    if (!parsed?.actionUrl || !parsed?.fields) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAlfalahRedirect(): void {
  sessionStorage.removeItem(ALFA_REDIRECT_STORAGE_KEY);
}

export async function initAlfalahPayment(paymentData: unknown): Promise<{
  ok: boolean;
  status: number;
  json: Record<string, unknown>;
}> {
  const res = await fetch('/api/payment/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ paymentData }),
  });
  const json = (await res.json()) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, json };
}
