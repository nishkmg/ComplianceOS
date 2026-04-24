// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface StepCoaReviewProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepCoaReview({ tenantId, onComplete }: StepCoaReviewProps) {
  const saveProgress = api.onboarding.saveProgress.useMutation({
    onSuccess: onComplete,
  });

  const handleContinue = async () => {
    await saveProgress.mutateAsync({
      tenantId,
      step: 3,
      data: { coa: { seeded: true, reviewed: true } },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Review Chart of Accounts</h2>
        <p className="mt-1 text-sm text-gray-600">
          Your chart of accounts has been set up. You can customize it later from the Accounts page.
        </p>
      </div>

      <div className="rounded-lg bg-green-50 p-4 border border-green-200">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="ml-2 text-sm text-green-800">
            Chart of accounts seeded successfully
          </p>
        </div>
        <p className="mt-2 text-sm text-green-700">
          You can add, modify, or deactivate accounts from the Accounts page after setup.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleContinue} disabled={saveProgress.isPending}>
          Continue
        </Button>
      </div>
    </div>
  );
}
