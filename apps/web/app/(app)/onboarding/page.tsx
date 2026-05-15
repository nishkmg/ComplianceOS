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
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
  const [mounted, setMounted] = useState(false);

  const tenantId: string | null =
    (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null ?? null;

  const [initialStep] = useState(() => {
    if (typeof window !== "undefined") {
      const s = parseInt(new URLSearchParams(window.location.search).get("step") || "", 10);
      if (s >= 1 && s <= 6) return s;
    }
    return undefined;
  });

  const { currentStep, completedSteps, goToStep } =
    useOnboarding(tenantId || undefined, initialStep);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (mounted && status !== "loading" && !session) {
      router.push("/login");
    }
  }, [mounted, status, session, router]);

  const persistState = useCallback(
    (step: number) => {
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(step));
      if (tenantId) url.searchParams.set("tenantId", tenantId);
      window.history.replaceState({}, "", url.toString());
    },
    [tenantId]
  );

  const handleGoToStep = useCallback(
    (step: number) => {
      goToStep(step);
      persistState(step);
    },
    [goToStep, persistState]
  );

  const handleStepComplete = useCallback(
    (nextStep: number) => {
      handleGoToStep(nextStep);
    },
    [handleGoToStep]
  );

  if (!mounted || status === "loading" || !session) return null;

  if (!tenantId) {
    return (
      <div className="bg-page-bg text-on-surface antialiased min-h-screen pt-12 flex items-center justify-center">
        <div className="font-ui text-text-mid text-sm">No tenant found. Please contact support.</div>
      </div>
    );
  }

  return (
    <div className="bg-page-bg text-on-surface antialiased min-h-screen pt-12 pb-space-96 flex flex-col items-center">
      <div className="max-w-4xl w-full mx-auto px-gutter-desktop flex flex-col gap-space-48 text-left">
        <header className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-border pb-6">
            <h1 className="font-display text-display-lg font-bold tracking-tight text-dark">
              Onboarding
            </h1>
            <div className="font-ui text-[11px] text-secondary uppercase tracking-widest">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>

          <div className="flex gap-2 w-full h-2">
            {STEPS.map((s) => {
              const isActive = currentStep >= s.number;
              const isCompleted = completedSteps.includes(s.number);
              return (
                <div
                  key={s.number}
                  title={`${s.title}${isCompleted ? " (click to revisit)" : ""}`}
                  onClick={() => isCompleted && handleGoToStep(s.number)}
                  className={`flex-1 rounded-sm transition-all duration-500 ${
                    isActive ? "bg-amber" : "bg-border-subtle"
                  } ${isCompleted ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                />
              );
            })}
          </div>
        </header>

        <main className="flex flex-col gap-12 bg-surface border border-border p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>

          <div className="min-h-[400px]">
            <ErrorBoundary key={`step-${currentStep}`}>
              {currentStep === 1 && (
                <StepBusinessProfile
                  tenantId={tenantId}
                  onComplete={() => handleStepComplete(2)}
                />
              )}
              {currentStep === 2 && (
                <StepModuleActivation
                  tenantId={tenantId}
                  onComplete={() => handleStepComplete(3)}
                />
              )}
              {currentStep === 3 && (
                <StepCoaTemplate
                  tenantId={tenantId}
                  onComplete={() => handleStepComplete(4)}
                />
              )}
              {currentStep === 4 && (
                <StepCoaReview
                  tenantId={tenantId}
                  onComplete={() => handleStepComplete(5)}
                />
              )}
              {currentStep === 5 && (
                <StepFyGst
                  tenantId={tenantId}
                  onComplete={() => handleStepComplete(6)}
                />
              )}
              {currentStep === 6 && (
                <StepOpeningBalances
                  tenantId={tenantId}
                  onComplete={() => router.push("/dashboard")}
                />
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
