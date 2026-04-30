import { Suspense } from 'react';
import PaymentsPage from '@/admin/pages/payments/page';

function PaymentsFallback() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    </div>
  );
}

export default function Payments() {
  return (
    <Suspense fallback={<PaymentsFallback />}>
      <PaymentsPage />
    </Suspense>
  );
}
