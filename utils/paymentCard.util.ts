export type CardPaymentInput = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
};

export function validateCardPayment(input: CardPaymentInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const digits = input.cardNumber.replace(/\D/g, '');

  if (!digits) {
    errors.cardNumber = 'Card number is required.';
  } else if (digits.length < 13 || digits.length > 19) {
    errors.cardNumber = `Card number must be 13–19 digits (you entered ${digits.length}).`;
  }

  if (!input.expiryMonth) {
    errors.expiryMonth = 'Expiry month is required.';
  }

  if (!input.expiryYear) {
    errors.expiryYear = 'Expiry year is required.';
  }

  if (input.expiryMonth && input.expiryYear) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expiryYear = parseInt(input.expiryYear, 10);
    const expiryMonth = parseInt(input.expiryMonth, 10);

    if (Number.isNaN(expiryYear) || Number.isNaN(expiryMonth)) {
      errors.expiryYear = 'Invalid expiry date.';
    } else if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      errors.expiryYear = 'This card has expired. Use a valid expiry date.';
    }
  }

  if (!input.cvv.trim()) {
    errors.cvv = 'CVV is required.';
  } else if (!/^\d{3,4}$/.test(input.cvv.trim())) {
    errors.cvv = 'CVV must be 3 or 4 digits.';
  }

  if (!input.cardholderName.trim()) {
    errors.cardholderName = 'Cardholder name is required.';
  }

  return errors;
}
