"use client";

import { useState, useCallback } from "react";
import { mockMutation } from "@/lib/mock-mutation";

interface OnboardingData {
  businessProfile?: {
    name: string;
    legalName?: string;
    businessType: string;
    pan: string;
    gstin?: string;
    address: string;
    state: string;
    industry: string;
    dateOfIncorporation?: string;
  };
  moduleActivation?: Array<{ module: string; enabled: boolean }>;
  coa?: { seeded: boolean; accountCount: number; template?: string };
  fyGst?: {
    fiscalYearStart: string;
    gstRegistration: string;
    applicableGstRates: number[];
    itcEligible: boolean;
    tdsApplicable: boolean;
  };
  openingBalances?: { mode: "fresh_start" | "migration"; entryId?: string };
}

interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  data: OnboardingData;
  onboardingStatus: string;
  tenantId: string | null;
  isLoading: boolean;
}

const STEP_KEYS: Record<number, string> = {
  1: "businessProfile",
  2: "moduleActivation",
  3: "coa",
  4: "fyGst",
  5: "openingBalances",
};

export function useOnboarding(tenantId?: string, initialStep?: number) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: initialStep && initialStep >= 1 && initialStep <= 6 ? initialStep : 1,
    completedSteps: [],
    data: {},
    onboardingStatus: "in_progress",
    tenantId: tenantId || null,
    isLoading: false,
  });

  const saveProgress = mockMutation({ onSuccess: () => {} });
  const completeOnboarding = mockMutation({ onSuccess: () => {} });

  const updateStep = useCallback(
    async (step: number, data: Record<string, unknown>) => {
      if (!tenantId) return;
      await saveProgress.mutateAsync({ tenantId, step, data });
      setState((prev) => ({
        ...prev,
        currentStep: step + 1,
        completedSteps: prev.completedSteps.includes(step)
          ? prev.completedSteps
          : [...prev.completedSteps, step],
        data: { ...prev.data, [STEP_KEYS[step] || ""]: data },
      }));
    },
    [tenantId, saveProgress]
  );

  const goToStep = useCallback((step: number) => {
    setState((prev) => {
      // Moving forward: mark the departing step as completed
      const isForward = step > prev.currentStep;
      if (isForward) {
        const completed = prev.completedSteps.includes(prev.currentStep)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStep];
        return { ...prev, currentStep: step, completedSteps: completed };
      }
      // Moving backward or same step
      return { ...prev, currentStep: step };
    });
  }, []);

  return {
    ...state,
    updateStep,
    goToStep,
    completeOnboarding,
    refetch: () => {},
  };
}

export function useOnboardingRedirect(isComplete?: boolean) {
  const [redirected, setRedirected] = useState(false);
  if (!redirected && isComplete === false && typeof window !== "undefined") {
    setRedirected(true);
    window.location.href = "/onboarding";
  }
  return redirected;
}
