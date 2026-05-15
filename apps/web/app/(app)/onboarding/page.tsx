"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StepBusinessProfile } from "./step-business-profile";
import { StepModuleActivation } from "./step-module-activation";
import { StepCoaTemplate } from "./step-coa-template";
import { StepFyGst } from "./step-fy-gst";
import { StepOpeningBalances } from "./step-opening-balances";
import { StepCoaReview } from "./step-coa-review";
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
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Restore tenantId from URL on mount (survives page refresh)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("tenantId");
    if (tid) {
      setCreatedTenantId(tid);
    }
    setMounted(true);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (mounted && status !== "loading" && !session) {
      router.push("/login");
    }
  }, [mounted, status, session, router]);

  const { currentStep, completedSteps, isLoading, goToStep } =
    useOnboarding(createdTenantId ?? undefined);

  // Step 1 completion: advance + persist tenantId in URL
  const handleTenantCreated = useCallback(
    (id: string) => {
      setCreatedTenantId(id);
      const url = new URL(window.location.href);
      url.searchParams.set("tenantId", id);
      window.history.replaceState({}, "", url.toString());
      goToStep(2);
    },
    [goToStep]
  );

  if (!mounted || status === "loading" || !session) return null;

  return (
    <div className="bg-page-bg text-on-surface antialiased min-h-screen pt-12 pb-space-96 flex flex-col items-center">
      <div className="max-w-4xl w-full mx-auto px-gutter-desktop flex flex-col gap-space-48 text-left">
        {/* Header */}
        <header className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-border pb-6">
            <h1 className="font-display text-display-lg font-bold tracking-tight text-dark">
              Onboarding
            </h1>
            <div className="font-ui text-[11px] text-secondary uppercase tracking-widest">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>

          {/* Segmented Progress Bar - clickable on completed steps */}
          <div className="flex gap-2 w-full h-2">
            {STEPS.map((s) => {
              const isActive = currentStep >= s.number;
              const isCompleted = completedSteps.includes(s.number);
              return (
                <div
                  key={s.number}
                  title={`${s.title}${isCompleted ? " (click to revisit)" : ""}`}
                  onClick={() => isCompleted && goToStep(s.number)}
                  className={`flex-1 rounded-sm transition-all duration-500 ${
                    isActive ? "bg-amber" : "bg-border-subtle"
                  } ${isCompleted ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                />
              );
            })}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col gap-12 bg-surface border border-border p-8 md:p-12 shadow-sm relative overflow-hidden">
          {/* Status line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <StepBusinessProfile
                onTenantCreated={handleTenantCreated}
              />
            )}

            {currentStep >= 2 && !createdTenantId && (
              <div className="flex items-center justify-center h-full text-text-mid font-ui text-sm">
                Loading your onboarding session...
              </div>
            )}

            {currentStep === 2 && createdTenantId && (
              <StepModuleActivation
                tenantId={createdTenantId}
                onComplete={() => goToStep(3)}
              />
            )}
            {currentStep === 3 && createdTenantId && (
              <StepCoaTemplate
                tenantId={createdTenantId}
                onComplete={() => goToStep(4)}
              />
            )}
            {currentStep === 4 && createdTenantId && (
              <StepCoaReview
                tenantId={createdTenantId}
                onComplete={() => goToStep(5)}
              />
            )}
            {currentStep === 5 && createdTenantId && (
              <StepFyGst
                tenantId={createdTenantId}
                onComplete={() => goToStep(6)}
              />
            )}
            {currentStep === 6 && createdTenantId && (
              <StepOpeningBalances
                tenantId={createdTenantId}
                onComplete={() => router.push("/dashboard")}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
