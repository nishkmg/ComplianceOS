// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StepBusinessProfile } from "./step-business-profile";
import { StepModuleActivation } from "./step-module-activation";
import { StepCoaTemplate } from "./step-coa-template";
import { StepFyGst } from "./step-fy-gst";
import { StepOpeningBalances } from "./step-opening-balances";
import { useOnboarding } from "./use-onboarding";

export const dynamic = "force-dynamic";

const STEPS = [
  { number: 1, title: "Business Profile" },
  { number: 2, title: "Modules" },
  { number: 3, title: "CoA Template" },
  { number: 4, title: "CoA Review" },
  { number: 5, title: "Fiscal Year & GST" },
  { number: 6, title: "Opening Balances" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [createdTenantId, setCreatedTenantId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    currentStep,
    completedSteps,
    isLoading,
    goToStep,
  } = useOnboarding(createdTenantId);

  if (!mounted || status === "loading") return null;

  return (
    <div className="bg-page-bg text-on-surface antialiased min-h-screen pt-12 pb-space-96 flex flex-col items-center">
      <div className="max-w-4xl w-full mx-auto px-gutter-desktop flex flex-col gap-space-48 text-left">
        {/* Header */}
        <header className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-border-subtle pb-6">
            <div className="font-display-lg text-display-lg font-bold tracking-tight">ComplianceOS</div>
            <div className="font-ui-xs text-ui-xs text-text-mid uppercase tracking-widest">Step {currentStep} of {STEPS.length}</div>
          </div>
          {/* Segmented Progress Bar */}
          <div className="flex gap-2 w-full h-1">
            {STEPS.map((s) => (
              <div key={s.number} className={`flex-1 rounded-sm transition-colors duration-500 ${currentStep >= s.number ? 'bg-primary-container' : 'bg-border-subtle'}`}></div>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col gap-12 bg-white border border-border-subtle p-8 md:p-12 shadow-sm relative overflow-hidden">
          {/* Status line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
          
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <StepBusinessProfile onTenantCreated={(id) => setCreatedTenantId(id)} />
            )}
            {currentStep === 2 && createdTenantId && (
              <StepModuleActivation tenantId={createdTenantId} onComplete={() => goToStep(3)} />
            )}
            {currentStep === 3 && createdTenantId && (
              <StepCoaTemplate tenantId={createdTenantId} onComplete={() => goToStep(4)} />
            )}
            {currentStep === 4 && createdTenantId && (
              <StepCoaReview tenantId={createdTenantId} onComplete={() => goToStep(5)} />
            )}
            {currentStep === 5 && createdTenantId && (
              <StepFyGst tenantId={createdTenantId} onComplete={() => goToStep(6)} />
            )}
            {currentStep === 6 && createdTenantId && (
              <StepOpeningBalances tenantId={createdTenantId} onComplete={() => router.push("/dashboard")} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
