'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import OtpCard from '@/components/forms/OtpCard';

export default function ForgotPasswordOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleVerify = async (otp: string[]) => {
    // Simulate API verification - auto-verify any 6-digit code for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // Redirect to change password page
      setTimeout(() => {
        router.push('/change-password');
      }, 2000);
    } else {
      throw new Error('Invalid OTP code');
    }
  };

  const handleResend = async () => {
    // Simulate API resend
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  return (
    <OtpCard
      type="forgot-password"
      email={email}
      otpLength={6}
      expirationMinutes={15}
      onVerify={handleVerify}
      onResend={handleResend}
      title="Verify Your Code"
      subtitle={`We've sent a 6-digit code to ${email}`}
    />
  );
}
