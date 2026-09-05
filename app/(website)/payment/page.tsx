import PaymentGatewayPage from '@/client/pages/payment/page';
import { isCheckoutEnabled } from '@/lib/checkoutEnabled';

export const dynamic = 'force-dynamic';

export default function Payment() {
  return <PaymentGatewayPage checkoutEnabled={isCheckoutEnabled()} />;
}
