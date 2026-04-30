'use client';

import { ErrorState } from '@/components/ui/error-state';
import { useRouter } from 'next/navigation';

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ErrorState
        title="Authentication error"
        description={error.message || 'Something went wrong. Please try again.'}
        onRetry={reset}
        onBack={() => router.push('/login')}
      />
    </div>
  );
}
