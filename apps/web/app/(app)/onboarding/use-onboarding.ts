"use client";

import { useState, useCallback } from "react";

export function useOnboarding(_tenantId?: string, initialStep?: number) {
  const [state, setState] = useState<{
    currentStep: number;
    completedSteps: number[];
    isLoading: boolean;
  }>({
    currentStep: initialStep && initialStep >= 1 && initialStep <= 6 ? initialStep : 1,
    completedSteps: [],
    isLoading: false,
  });

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
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
    isLoading: state.isLoading,
    goToStep,
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
