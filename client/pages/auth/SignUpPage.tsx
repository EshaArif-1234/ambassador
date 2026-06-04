'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/utils/auth.api';
import SignUpMarketingSection from '@/components/login/SignUpMarketingSection';
import PasswordInput from '@/components/auth/PasswordInput';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import {
  getPasswordStrength,
  PASSWORD_CHECKLIST,
  strengthBarClass,
  strengthLabel,
  strengthTextClass,
  validateSignupForm,
} from '@/utils/authValidation.util';

const INPUT_CLASS = (hasError: boolean) =>
  `w-full px-3 py-2.5 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm placeholder:text-gray-400 ${
    hasError ? 'border-red-500' : 'border-gray-300'
  }`;

const INITIAL_FORM = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);
  const passwordsMatch =
    Boolean(form.confirmPassword) && form.password === form.confirmPassword;

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateSignupForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      router.push(`/otp-verification?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err) {
      setErrors({ submit: (err as Error).message || 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-4 left-4 bg-white text-gray-700 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <SignUpMarketingSection />

            <div className="lg:w-1/2 p-6 lg:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="mt-2 text-gray-600">Full name, email, and password only</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 max-w-md" noValidate>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={updateField}
                    className={INPUT_CLASS(Boolean(errors.fullName))}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    className={INPUT_CLASS(Boolean(errors.email))}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  value={form.password}
                  onChange={updateField}
                  error={errors.password}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  inputClassName={INPUT_CLASS(Boolean(errors.password))}
                />

                {form.password && (
                  <div className="rounded-lg bg-gray-50 p-3 -mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Strength</span>
                      <span className={`text-xs font-medium ${strengthTextClass(passwordStrength)}`}>
                        {strengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-gray-200 mb-2">
                      <div
                        className={`h-1 rounded-full transition-all ${strengthBarClass(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 6) * 100}%` }}
                      />
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-500">
                      {PASSWORD_CHECKLIST.map(({ label, test }) => (
                        <li key={label} className={test(form.password) ? 'text-green-600' : undefined}>
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={updateField}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  inputClassName={INPUT_CLASS(Boolean(errors.confirmPassword))}
                />

                {form.confirmPassword && form.password && !errors.confirmPassword && (
                  <p className={`text-xs -mt-2 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}

                {errors.submit && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-orange-500 py-2.5 px-4 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account…' : 'Create Account'}
                </button>
              </form>

              <div className="relative my-5 max-w-md">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="max-w-md">
                <GoogleSignInButton label="Sign up with Google" disabled={isLoading} />
              </div>

              <p className="mt-4 text-center text-sm text-gray-600 max-w-md">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-orange-500 hover:text-orange-600">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
