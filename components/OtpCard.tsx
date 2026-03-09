'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import OtpInput from './OtpInput';

interface OtpCardProps {
  type: 'signup' | 'forgot-password';
  title?: string;
  subtitle?: string;
  email?: string;
  onVerify: (otp: string[]) => Promise<void>;
  onResend?: () => Promise<void>;
  otpLength?: number;
  expirationMinutes?: number;
  className?: string;
}

export default function OtpCard({
  type = 'signup',
  title,
  subtitle,
  email,
  onVerify,
  onResend,
  otpLength = 6,
  expirationMinutes = 5,
  className = ''
}: OtpCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = email || searchParams.get('email') || '';
  
  const [otp, setOtp] = useState(Array(otpLength).fill(''));
  const [timeLeft, setTimeLeft] = useState(expirationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isExpired) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsExpired(true);
    }
  }, [timeLeft, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== otpLength) {
      setError(`Please enter all ${otpLength} digits`);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Auto-verify for development - always succeed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      
      // Call parent verification handler
      await onVerify(otp);
      
      // Auto-redirect based on type
      setTimeout(() => {
        if (type === 'signup') {
          // Signup flow - will redirect to login page
          // Parent component handles this
        } else {
          // Forgot password flow - will redirect to change password page  
          // Parent component handles this
        }
      }, 2000);
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || !onResend) return;
    
    setIsResending(true);
    setError('');
    
    try {
      await onResend();
      setOtp(Array(otpLength).fill(''));
      setTimeLeft(expirationMinutes * 60);
      setIsExpired(false);
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const defaultTitles = {
    'signup': 'Verify Your Email',
    'forgot-password': 'Verify Your Code'
  };

  const defaultSubtitles = {
    'signup': `We've sent a ${otpLength}-digit code to ${userEmail}`,
    'forgot-password': `We've sent a ${otpLength}-digit code to ${userEmail}`
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative ${className}`}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 bg-white text-gray-700 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Logo and Header */}
            <div className="text-center mb-6">
              <div className="mb-4">
                <Image
                  src="/Images/home/logo.webp"
                  alt="Ambassadors Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto mx-auto"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {title || defaultTitles[type]}
              </h1>
              <p className="text-gray-600">
                {subtitle || defaultSubtitles[type]}
              </p>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {type === 'signup' ? 'Email Verified!' : 'Code Verified!'}
                </h2>
                <p className="text-gray-600">
                  {type === 'signup' ? 'Redirecting to login page...' : 'Redirecting to change password...'}
                </p>
              </div>
            ) : (
              <>
                {/* OTP Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Enter verification code
                  </label>
                  <OtpInput
                    length={otpLength}
                    value={otp}
                    onChange={setOtp}
                    disabled={isExpired || isVerifying}
                    placeholder={`Enter ${otpLength}-digit code`}
                  />
                </div>

                {/* Timer */}
                <div className="mb-6 text-center">
                  {!isExpired ? (
                    <p className="text-sm text-gray-600">
                      Code expires in <span className="font-semibold text-orange-500">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-red-500 font-medium">Code has expired</p>
                      <p className="text-sm text-gray-500">Please request a new code</p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Verify Button */}
                <button
                  onClick={handleVerify}
                  disabled={otp.join('').length !== otpLength || isExpired || isVerifying}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    type === 'signup' ? 'Verify Email' : 'Verify Code'
                  )}
                </button>

                {/* Resend Code */}
                {onResend && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Didn't receive the code?{' '}
                      <button
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-orange-500 hover:text-orange-600 font-medium transition-colors disabled:opacity-50"
                      >
                        {isResending ? 'Resending...' : 'Resend Code'}
                      </button>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
