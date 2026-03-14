'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import LoginMarketingSection from '../../../components/login/LoginMarketingSection';
import LoginForm from '../../../components/login/LoginForm';

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUser();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is verified from OTP
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      // Show success message
      const timer = setTimeout(() => {
        // Clear the URL parameter
        router.replace('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [router, searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
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
      console.log('Login data:', formData);
      
      // Create user object (in real app, get from API)
      const user = {
        id: '1',
        name: formData.email.split('@')[0], // Use email prefix as name
        email: formData.email,
        profileImage: '', // Will be set during registration
        initials: formData.email.substring(0, 2).toUpperCase()
      };
      
      // Login user
      login(user);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Invalid email or password. Please try again.'
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

      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <LoginMarketingSection />
            <LoginForm
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              showPassword={showPassword}
              onInputChange={handleInputChange}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
