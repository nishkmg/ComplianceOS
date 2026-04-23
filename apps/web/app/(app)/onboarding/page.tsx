"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { StepBusinessProfile } from "./step-business-profile";
import { StepModuleActivation } from "./step-module-activation";
import { StepCoaTemplate } from "./step-coa-template";
import { StepCoaReview } from "./step-coa-review";
import { StepFyGst } from "./step-fy-gst";
import { StepOpeningBalances } from "./step-opening-balances";
import { useOnboarding } from "./use-onboarding";

export const dynamic = "force-dynamic";

const STEPS = [
  { number: 1, title: "Business Profile", description: "Tell us about your business" },
  { number: 2, title: "Modules", description: "Activate the features you need" },
  { number: 3, title: "Chart of Accounts", description: "Customize your accounting structure" },
  { number: 4, title: "Fiscal Year & GST", description: "Set up your tax configuration" },
  { number: 5, title: "Opening Balances", description: "Enter starting balances (optional)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tenantId, setTenantId] = useState<string | undefined>();
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTenantId = createdTenantId || tenantId;

  const {
    currentStep,
    completedSteps,
    data,
    isLoading,
    updateStep,
    goToStep,
    completeOnboarding,
  } = useOnboarding(activeTenantId);

  // Wait for client-side mount and session
  if (!mounted || status === "loading") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleTenantCreated = (newTenantId: string) => {
    setCreatedTenantId(newTenantId);
    setTenantId(newTenantId);
  };

  const handleComplete = async () => {
    if (tenantId) {
      await completeOnboarding.mutateAsync({ tenantId });
      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center space-x-8 overflow-x-auto pb-4">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isUpcoming = currentStep < step.number;

            return (
              <li key={step.number} className="relative flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "border-amber-500 bg-amber-500 text-white"
                        : isCurrent
                        ? "border-amber-500 text-amber-500"
                        : "border-gray-300 text-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium ${isCurrent ? "text-gray-900" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {step.number < STEPS.length && (
                  <div className="absolute left-14 top-5 hidden h-0.5 w-24 sm:block">
                    <div
                      className={`h-full ${
                        completedSteps.includes(step.number + 1)
                          ? "bg-amber-500"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {currentStep === 1 && (
          <StepBusinessProfile onTenantCreated={handleTenantCreated} />
        )}
        {currentStep === 2 && activeTenantId && (
          <StepModuleActivation
            tenantId={activeTenantId}
            onComplete={() => goToStep(3)}
          />
        )}
        {currentStep === 3 && activeTenantId && (
          <StepCoaTemplate
            tenantId={activeTenantId}
            onComplete={() => goToStep(4)}
          />
        )}
        {currentStep === 4 && activeTenantId && (
          <StepFyGst
            tenantId={activeTenantId}
            onComplete={() => goToStep(5)}
          />
        )}
        {currentStep === 5 && activeTenantId && (
          <StepOpeningBalances
            tenantId={activeTenantId}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
