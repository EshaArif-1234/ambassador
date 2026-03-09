'use client';

import { Suspense } from 'react';
import ForgotPasswordPage from '@/client/pages/auth/ForgotPasswordPage';

export default function ForgotPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
