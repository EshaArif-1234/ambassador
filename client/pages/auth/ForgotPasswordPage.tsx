'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/utils/auth.api';
import AuthHeader from '../../../components/common/AuthHeader';
import ForgotPasswordForm from '../../../components/forgotpassword/ForgotPasswordForm';
import SuccessState from '../../../components/changepassword/SuccessState';

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

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email: formData.email });
      setIsSuccess(true);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: (error as Error).message || 'An error occurred. Please try again.',
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
            <AuthHeader 
              title="Forgot Password?"
              description="Enter your email address and we'll send you a verification code to reset your password."
            />

            {/* Success State */}
            {isSuccess ? (
              <SuccessState 
                title="Email Sent!"
                message={`We've sent a verification code to ${formData.email}`}
                buttonText="Continue"
                onAction={() => router.push(`/forgot-password-otp?email=${encodeURIComponent(formData.email)}`)}
                icon="email"
              />
            ) : (
              <>
                {/* Form */}
                <ForgotPasswordForm
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  onFormChange={handleFormChange}
                  onSubmit={handleSubmit}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
