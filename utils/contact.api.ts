export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  /** Book-visit form (branches page) */
  visitBranch?: string;
  visitDate?: string;
  visitTimeSlot?: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

/** Submit contact / book-visit form — delivers to CONTACT_INBOX_EMAIL (default info@ambassador.pk). */
export async function submitContactForm(data: ContactFormData): Promise<ContactFormResponse> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = (await res.json()) as ContactFormResponse;

  if (!res.ok || !json.success) {
    const fieldErrors = json.errors ? Object.values(json.errors).filter(Boolean).join(' ') : '';
    throw new Error(fieldErrors || json.message || 'Failed to send message. Please try again.');
  }

  return json;
}
