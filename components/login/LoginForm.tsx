'use client';

import React from 'react';
import InputField from '../common/InputField';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface Errors {
  email?: string;
  password?: string;
  submit?: string;
}

interface LoginFormProps {
  formData: FormData;
  errors: Errors;
  isLoading: boolean;
  showPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  formData,
  errors,
  isLoading,
  showPassword,
  onInputChange,
  onTogglePassword,
  onSubmit
}: LoginFormProps) {
  return (
    <div className="lg:w-1/2 p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-gray-600">Welcome back to Ambassadors Kitchen Equipment</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Email Field */}
        <InputField
          id="email"
          label="Email Address"
          value={formData.email}
          onChange={(value) => onInputChange({
            target: { name: 'email', value }
          } as React.ChangeEvent<HTMLInputElement>)}
          placeholder="Enter your email address"
          type="email"
          error={errors.email}
          disabled={isLoading}
        />

        {/* Password Field */}
        <InputField
          id="password"
          label="Password"
          value={formData.password}
          onChange={(value) => onInputChange({
            target: { name: 'password', value }
          } as React.ChangeEvent<HTMLInputElement>)}
          placeholder="Enter your password"
          type="password"
          error={errors.password}
          disabled={isLoading}
          showPasswordToggle={true}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={onInputChange}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
            Forgot password?
          </a>
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
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
