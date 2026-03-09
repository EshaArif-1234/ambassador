import { useRouter } from 'next/navigation';

export interface NetworkErrorOptions {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  redirectPath?: string;
}

export const handleNetworkError = (options: NetworkErrorOptions = {}) => {
  const router = useRouter();
  
  const {
    title = 'Network Error',
    message = 'Unable to connect to the server. Please check your internet connection and try again.',
    showRetry = true,
    onRetry,
    redirectPath = '/network-error'
  } = options;

  // Store error info in sessionStorage for the error page to use (client-side only)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('networkError', JSON.stringify({
      title,
      message,
      showRetry,
      hasCustomRetry: !!onRetry
    }));
  }

  // Redirect to network error page
  router.push(redirectPath);
};

export const getNetworkErrorInfo = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const errorInfo = sessionStorage.getItem('networkError');
  if (errorInfo) {
    return JSON.parse(errorInfo);
  }
  return null;
};

export const clearNetworkErrorInfo = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('networkError');
  }
};

// Global error handler for API calls
export const handleApiError = (error: any, options: NetworkErrorOptions = {}) => {
  console.error('API Error:', error);
  
  // Handle different error types
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
    handleNetworkError({
      title: 'Connection Failed',
      message: 'Unable to connect to the server. Please check your internet connection.',
      ...options
    });
  } else if (error?.status === 401) {
    handleNetworkError({
      title: 'Authentication Error',
      message: 'Your session has expired. Please log in again.',
      showRetry: false,
      redirectPath: '/login',
      ...options
    });
  } else if (error?.status === 403) {
    handleNetworkError({
      title: 'Access Denied',
      message: 'You do not have permission to access this resource.',
      showRetry: false,
      ...options
    });
  } else if (error?.status === 404) {
    handleNetworkError({
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved.',
      showRetry: false,
      redirectPath: '/not-found',
      ...options
    });
  } else if (error?.status >= 500) {
    handleNetworkError({
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      ...options
    });
  } else {
    handleNetworkError({
      title: 'Error',
      message: error?.message || 'An unexpected error occurred.',
      ...options
    });
  }
};

// Retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
