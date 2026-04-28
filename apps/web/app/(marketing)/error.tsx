'use client';

import { ErrorState } from '@/components/ui/error-state';
import { useRouter } from 'next/navigation';

export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ErrorState
        title="Something went wrong"
        description={error.message || 'Please try again or return to the homepage.'}
        onRetry={reset}
        onBack={() => router.push('/')}
      />
    </div>
  );
}
