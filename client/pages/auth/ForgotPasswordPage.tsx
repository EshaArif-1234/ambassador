'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FormData {
  email: string;
}

interface Errors {
  email?: string;
  submit?: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would normally send email to your backend
      console.log('Password reset requested for:', formData.email);
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0l7.89-4.26a2 2 0 002.22 0L30 8a2 2 0 012.22 0l7.89 4.26a2 2 0 010 2.72L15.11 19.26a2 2 0 01-2.22 0L5 15a2 2 0 01-2.22 0L5 8a2 2 0 012.22 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Sent!</h2>
                <p className="text-gray-600 mb-6">
                  We've sent a verification code to {formData.email}
                </p>
                <button
                  onClick={() => router.push(`/forgot-password-otp?email=${encodeURIComponent(formData.email)}`)}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Continue
                </button>
              </div>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.email
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      } placeholder:text-gray-400`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errors.submit}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Code...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                      Sign In
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
