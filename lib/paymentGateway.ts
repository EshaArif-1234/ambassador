/** True when a live payment provider is configured in environment variables. */
import { isAlfaConfigured } from '@/lib/alfaPayment';

export function isPaymentGatewayConfigured(): boolean {
  return Boolean(
    isAlfaConfigured() ||
      process.env.JAZZCASH_MERCHANT_ID?.trim() ||
      process.env.EASYPAISA_STORE_ID?.trim() ||
      process.env.STRIPE_SECRET_KEY?.trim() ||
      process.env.PAYMENT_GATEWAY_ENABLED === 'true',
  );
}

/** Demo / test mode — used when no live gateway credentials exist. */
export function isPaymentDemoMode(): boolean {
  if (process.env.PAYMENT_DEMO_MODE === 'false') return false;
  if (process.env.PAYMENT_DEMO_MODE === 'true') return true;
  return !isPaymentGatewayConfigured();
}

export type PaymentErrorCode =
  | 'CARD_INVALID'
  | 'GATEWAY_NOT_CONFIGURED'
  | 'GATEWAY_DECLINED'
  | 'ORDER_SAVE_FAILED'
  | 'MISSING_ORDER_DATA'
  | 'SERVER_ERROR';

export type PaymentProcessResult =
  | {
      success: true;
      paymentId: string;
      orderId: string;
      dbOrderId?: string;
      demoMode: boolean;
    }
  | {
      success: false;
      code: PaymentErrorCode;
      message: string;
      detail?: string;
      fieldErrors?: Record<string, string>;
    };

export function isAlfaPaymentEnabled(): boolean {
  return isAlfaConfigured() && !isPaymentDemoMode();
}
