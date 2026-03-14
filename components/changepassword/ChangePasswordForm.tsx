'use client';

import React from 'react';
import InputField from '../common/InputField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
}

interface ChangePasswordFormProps {
  formData: FormData;
  errors: Errors;
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onFormChange: (field: keyof FormData, value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChangePasswordForm({
  formData,
  errors,
  isLoading,
  showPassword,
  showConfirmPassword,
  onFormChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit
}: ChangePasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* New Password Field */}
      <InputField
        id="newPassword"
        label="New Password"
        value={formData.newPassword}
        onChange={(value) => onFormChange('newPassword', value)}
        placeholder="Enter new password"
        type="password"
        error={errors.newPassword}
        disabled={isLoading}
        showPasswordToggle={true}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />
      
      {/* Password Strength Indicator */}
      <PasswordStrengthIndicator password={formData.newPassword} />

      {/* Confirm Password Field */}
      <InputField
        id="confirmPassword"
        label="Confirm New Password"
        value={formData.confirmPassword}
        onChange={(value) => onFormChange('confirmPassword', value)}
        placeholder="Confirm new password"
        type="password"
        error={errors.confirmPassword}
        disabled={isLoading}
        showPasswordToggle={true}
        showPassword={showConfirmPassword}
        onTogglePassword={onToggleConfirmPassword}
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Changing Password...
          </>
        ) : (
          'Change Password'
        )}
      </button>
    </form>
  );
}
