'use client';

import NotFoundScreen from '@/components/NotFoundScreen';

export default function NotFoundPage() {
  return (
    <NotFoundScreen
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showGoHome={true}
      showBack={true}
    />
  );
}
