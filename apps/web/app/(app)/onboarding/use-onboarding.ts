"use client";

import { useState, useEffect, useCallback } from "react";
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

export function useOnboarding(tenantId?: string) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
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
        data: { ...prev.data, [getStepKey(step)]: data },
      }));
    },
    [tenantId, saveProgress]
  );

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  return {
    ...state,
    updateStep,
    goToStep,
    completeOnboarding,
    refetch: () => {},
  };
}

function getStepKey(step: number): string {
  const keys = ["businessProfile", "moduleActivation", "coa", "fyGst", "openingBalances"];
  return keys[step - 1] || "";
}

export function useOnboardingRedirect(isComplete?: boolean) {
  useEffect(() => {
    if (isComplete === false && typeof window !== "undefined") {
      window.location.href = "/onboarding";
    }
  }, [isComplete]);
}
