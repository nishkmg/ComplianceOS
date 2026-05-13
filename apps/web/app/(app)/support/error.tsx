'use client';

import { ErrorState } from '@/components/ui/error-state';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SupportError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="Support hub error"
        description={error.message || 'Failed to load support information. Please try again.'}
        onRetry={reset}
      />
    </div>
  );
}
