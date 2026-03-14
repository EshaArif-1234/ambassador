'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import OtpCard from '@/components/forms/OtpCard';

export default function OtpVerificationPage() {
  const router = useRouter();
  const { login } = useUser();

  const handleVerify = async (otp: string[]) => {
    // Simulate API verification - auto-verify any 6-digit code for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // Create user object and login
      const user = {
        id: Date.now().toString(),
        name: otpCode.substring(0, 2).toUpperCase(), // Use first 2 digits as name for demo
        email: 'verified@user.com', // Will be set from URL params
        profileImage: '', // Will be set during registration
        initials: otpCode.substring(0, 2).toUpperCase()
      };
      
      // Login user
      login(user);
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } else {
      throw new Error('Invalid OTP code');
    }
  };

  return (
    <OtpCard
      type="signup"
      otpLength={6}
      expirationMinutes={5}
      onVerify={handleVerify}
      title="Verify Your Email"
      subtitle="We've sent a 6-digit code to your email"
    />
  );
}
