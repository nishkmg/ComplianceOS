'use client';

import { ErrorState } from '@/components/ui/error-state';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ItrError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="ITR module error"
        description={error.message || 'Failed to load ITR data. Please try again.'}
        onRetry={reset}
      />
    </div>
  );
}
