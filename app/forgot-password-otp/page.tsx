'use client';

import { Suspense } from 'react';
import ForgotPasswordOtpPage from '@/client/pages/auth/ForgotPasswordOtpPage';

export default function ForgotPasswordOtp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordOtpPage />
    </Suspense>
  );
}
