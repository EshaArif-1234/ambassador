'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, AuthApiError } from '@/utils/auth.api';
import { validatePasswordChange } from '@/utils/passwordValidation.util';
import { useUser } from '@/contexts/UserContext';
import { isManager } from '@/utils/dashboardRoles';
import AuthHeader from '../../../components/common/AuthHeader';
import ChangePasswordForm from '../../../components/changepassword/ChangePasswordForm';
import SuccessState from '../../../components/changepassword/SuccessState';

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  // No email + otp ⇒ logged-in user changing their own password (requires old password).
  const isAuthenticatedChange = !email || !otp;

  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = validatePasswordChange({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
      requireOldPassword: isAuthenticatedChange,
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, submit: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isAuthenticatedChange) {
        await authApi.changePassword({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        });
      } else {
        await authApi.resetPassword({
          email,
          otp,
          newPassword: formData.newPassword,
        });
      }
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof AuthApiError && error.errors) {
        setErrors({ ...error.errors, submit: error.message });
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: (error as Error).message || 'An error occurred. Please try again.',
        }));
      }
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
              description={isAuthenticatedChange
                ? 'Enter your current password and choose a new one.'
                : 'Enter your new password below.'}
            />

            {/* Success State */}
            {isAuthenticatedChange && isManager(user?.role) ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Manager accounts cannot change their password. Contact an administrator to reset it.
              </div>
            ) : isSuccess ? (
              <SuccessState 
                title="Password Changed!"
                message="Your password has been successfully updated."
                buttonText={isAuthenticatedChange ? 'Back to My Account' : 'Sign In'}
                onAction={() => router.push(isAuthenticatedChange ? '/profile' : '/login')}
                icon="check"
              />
            ) : isAuthenticatedChange && isManager(user?.role) ? null : (
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
                  showOldPasswordField={isAuthenticatedChange}
                  showOldPassword={showOldPassword}
                  onToggleOldPassword={() => setShowOldPassword(!showOldPassword)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
