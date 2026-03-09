'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface NotFoundScreenProps {
  title?: string;
  message?: string;
  showGoHome?: boolean;
  showBack?: boolean;
  onGoHome?: () => void;
  onBack?: () => void;
  className?: string;
}

export default function NotFoundScreen({
  title = 'Page Not Found',
  message = "The page you're looking for doesn't exist or has been moved.",
  showGoHome = true,
  showBack = false,
  onGoHome,
  onBack,
  className = ''
}: NotFoundScreenProps) {
  const router = useRouter();

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-center mt-8">
                <Image
                  src="/Images/home/logo.webp"
                  alt="Ambassadors Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto mx-auto"
                />
              </div>
              <div className="text-6xl font-bold text-gray-900 mb-2">404</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600 text-center">{message}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </button>
              )}

              {showGoHome && (
                <button
                  onClick={handleGoHome}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go Home
                </button>
              )}
            </div>

            {/* Helpful Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p className="mb-2">Looking for something specific?</p>
                <div className="space-y-1">
                  <a href="/" className="text-orange-500 hover:text-orange-600 block">
                    → Homepage
                  </a>
                  <a href="/products" className="text-orange-500 hover:text-orange-600 block">
                    → Browse Products
                  </a>
                  <a href="/login" className="text-orange-500 hover:text-orange-600 block">
                    → Sign In
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}

      </div>
    </div>
  );
}
