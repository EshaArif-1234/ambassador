'use client';

import { Suspense } from 'react';
import SignUpPage from '@/client/pages/auth/SignUpPage';

export default function SignUp() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100/70" />}>
      <SignUpPage />
    </Suspense>
  );
}
