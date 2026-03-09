'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would normally send data to your backend
      console.log('Password change data:', formData);
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Password change error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-500' };
    if (strength <= 3) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h1>
              <p className="text-gray-600">
                Enter your new password below.
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Changed!</h2>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully updated.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password Field */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors.newPassword
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        } placeholder:text-gray-400`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.907a3 3 0 114.243 2.976m3.578-4.575a3 3 0 00-4.243 0m3.578 4.575a3 3 0 00-4.243 0" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2 5.291A7.962 7.962 0 0112 15H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                    {formData.newPassword && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Password strength:{' '}
                          <span className={`font-medium ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors.confirmPassword
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        } placeholder:text-gray-400`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.907a3 3 0 114.243 2.976m3.578-4.575a3 3 0 00-4.243 0m3.578 4.575a3 3 0 00-4.243 0" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2 5.291A7.962 7.962 0 0112 15H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
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
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
