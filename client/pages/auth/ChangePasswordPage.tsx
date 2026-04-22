'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/utils/auth.api';
import AuthHeader from '../../../components/common/AuthHeader';
import ChangePasswordForm from '../../../components/changepassword/ChangePasswordForm';
import SuccessState from '../../../components/changepassword/SuccessState';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // New Password Validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (formData.newPassword.length > 50) {
      newErrors.newPassword = 'Password must be less than 50 characters';
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character (@$!%*?&)';
    }

    // Confirm Password Validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    if (!email || !otp) {
      setErrors(prev => ({
        ...prev,
        submit: 'Reset session expired. Please start the forgot password flow again.',
      }));
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({
        email,
        otp,
        newPassword: formData.newPassword,
      });
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
              title="Change Password"
              description="Enter your new password below."
            />

            {/* Success State */}
            {isSuccess ? (
              <SuccessState 
                title="Password Changed!"
                message="Your password has been successfully updated."
                buttonText="Sign In"
                onAction={() => router.push('/login')}
                icon="check"
              />
            ) : (
              <>
                {/* Form */}
                <ChangePasswordForm
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  showConfirmPassword={showConfirmPassword}
                  onFormChange={handleFormChange}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
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
