'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import OtpCard from '@/components/forms/OtpCard';

export default function ForgotPasswordOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  /**
   * We do NOT verify the OTP here — the backend verifies it together with the
   * new password in a single reset-password call. We just collect it and pass
   * it to the ChangePasswordPage via URL params.
   */
  const handleVerify = async (otp: string[]) => {
    const otpCode = otp.join('');

    if (!email) throw new Error('Email is missing. Please restart the password reset flow.');

    // Small pause so the success state is visible
    await new Promise((resolve) => setTimeout(resolve, 1500));

    router.push(
      `/change-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`
    );
  };

  return (
    <OtpCard
      type="forgot-password"
      email={email}
      otpLength={6}
      expirationMinutes={10}
      onVerify={handleVerify}
      title="Verify Your Code"
      subtitle={`We've sent a 6-digit code to ${email || 'your email'}`}
    />
  );
}
