'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/utils/auth.api';
import OtpCard from '@/components/forms/OtpCard';

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleVerify = async (otp: string[]) => {
    const otpCode = otp.join('');

    if (!email) throw new Error('Email is missing. Please register again.');

    // Verify the OTP — marks the user as isVerified in the DB
    await authApi.verifyOtp({ email, otp: otpCode });

    // Pause briefly so the OtpCard success animation is visible
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to login with a verified flag so the login page can show a success banner
    router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
  };

  return (
    <OtpCard
      type="signup"
      email={email}
      otpLength={6}
      expirationMinutes={10}
      onVerify={handleVerify}
      title="Verify Your Email"
      subtitle={`We've sent a 6-digit code to ${email || 'your email'}`}
    />
  );
}
