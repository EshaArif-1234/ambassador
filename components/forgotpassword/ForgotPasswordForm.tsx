'use client';

import React from 'react';
import InputField from '../common/InputField';

interface FormData {
  email: string;
}

interface Errors {
  email?: string;
  submit?: string;
}

interface ForgotPasswordFormProps {
  formData: FormData;
  errors: Errors;
  isLoading: boolean;
  onFormChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForgotPasswordForm({
  formData,
  errors,
  isLoading,
  onFormChange,
  onSubmit
}: ForgotPasswordFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Email Field */}
        <InputField
          id="email"
          label="Email Address"
          value={formData.email}
          onChange={(value) => onFormChange('email', value)}
          placeholder="Enter your email address"
          type="email"
          error={errors.email}
          disabled={isLoading}
        />

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
  );
}
