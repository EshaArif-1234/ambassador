'use client';

import { useEffect } from 'react';
import NetworkErrorScreen from '@/components/NetworkErrorScreen';
import { getNetworkErrorInfo, clearNetworkErrorInfo } from '@/utils/networkErrorHandler';

export default function NetworkErrorPage() {
  const errorInfo = getNetworkErrorInfo();

  useEffect(() => {
    // Clear error info when component unmounts
    return () => {
      clearNetworkErrorInfo();
    };
  }, []);

  return (
    <NetworkErrorScreen
      title={errorInfo?.title || 'Network Error'}
      message={errorInfo?.message || 'Unable to connect to the server. Please check your internet connection and try again.'}
      showRetry={errorInfo?.showRetry !== false}
    />
  );
}
