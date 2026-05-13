'use client';

import { ErrorState } from '@/components/ui/error-state';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="Something went wrong"
        description={error.message || 'An unexpected error occurred. Please try again.'}
        onRetry={reset}
      />
    </div>
  );
}
