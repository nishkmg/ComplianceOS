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

  if (!mounted || status === "loading") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 font-ui text-mid">Loading...</p>
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
          <p className="mt-4 font-ui text-mid">Loading your setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightest">
      {/* Progress Steps */}
      <nav aria-label="Onboarding progress" className="bg-white border-b border-hairline">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <ol className="flex items-center justify-between" role="list">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.number);
              const isCurrent = currentStep === step.number;
              const isPending = !isCompleted && !isCurrent;

              return (
                <div key={step.number} className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      role="step"
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Step ${step.number}: ${step.title}`}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-ui text-[13px] font-medium transition-colors ${
                        isCompleted
                          ? "bg-amber text-white"
                          : isCurrent
                          ? "border-2 border-amber text-amber"
                          : "border-2 border-lighter text-light"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    {/* Step Label */}
                    <div className="mt-2 text-center hidden lg:block">
                      <p className={`text-[11px] font-medium ${isCurrent ? "text-dark" : "text-light"}`}>
                        {step.title}
                      </p>
                      <p className="text-[9px] text-light mt-0.5">{step.description}</p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="w-16 lg:w-24 h-0.5 mx-2 lg:mx-4">
                      <div
                        className={`h-full transition-colors ${
                          completedSteps.includes(step.number + 1)
                            ? "bg-amber"
                            : "bg-lighter"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="card">
          <div className="p-8">
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
      </div>
    </div>
  );
}
