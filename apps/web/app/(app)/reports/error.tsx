'use client';

import { ErrorState } from '@/components/ui/error-state';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReportsError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="Reports error"
        description={error.message || 'Failed to load report. Please try again.'}
        onRetry={reset}
      />
    </div>
  );
}
