'use client';

import { Suspense } from 'react';
import OtpVerificationPage from '@/client/pages/auth/OtpVerificationPage';

export default function OtpVerification() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerificationPage />
    </Suspense>
  );
}
