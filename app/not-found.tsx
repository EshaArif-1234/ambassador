'use client';

import NotFoundScreen from '@/components/common/NotFoundScreen';

export default function NotFound() {
  return (
    <NotFoundScreen
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showGoHome={true}
      showBack={true}
    />
  );
}
