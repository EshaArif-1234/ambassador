'use client';

import { Suspense } from 'react';
import ChangePasswordPage from '@/client/pages/auth/ChangePasswordPage';

export default function ChangePassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChangePasswordPage />
    </Suspense>
  );
}
