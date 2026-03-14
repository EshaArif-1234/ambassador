'use client';

import { Suspense } from 'react';
import LoginPage from '@/client/pages/auth/LoginPage';

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
