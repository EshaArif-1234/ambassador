import { Suspense } from 'react';
import OrdersPage from '@/admin/pages/admin-orders/page';

function OrdersFallback() {
  return (
    <div className="p-6">
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    </div>
  );
}

export default function Orders() {
  return (
    <Suspense fallback={<OrdersFallback />}>
      <OrdersPage />
    </Suspense>
  );
}
