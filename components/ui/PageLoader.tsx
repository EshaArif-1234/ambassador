import { cn } from '@/lib/utils';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

/** Shared full-page / section loader (matches admin dashboard auth loading UI). */
export default function PageLoader({
  message = 'Loading...',
  fullScreen = true,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gray-50',
        fullScreen ? 'min-h-screen' : 'min-h-[28rem] w-full',
        className
      )}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
