"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// --- Types ---
interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  data: Record<string, unknown>;
}

interface UseOnboardingReturn {
  currentStep: number;
  completedSteps: number[];
  data: Record<string, unknown>;
  saveProgress: (step: number, stepData?: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

interface SaveProgressInput {
  tenantId: string;
  step: number;
  data: Record<string, unknown>;
}

// --- Storage helpers ---
const STORAGE_KEY_PREFIX = "onboarding_progress_";

function getStorageKey(tenantId: string | undefined): string {
  return `${STORAGE_KEY_PREFIX}${tenantId ?? "anonymous"}`;
}

function loadFromStorage(tenantId: string | undefined): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey(tenantId));
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

function saveToStorage(tenantId: string | undefined, state: OnboardingState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(tenantId), JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

// --- API helpers (tRPC or direct fetch) ---
async function fetchSaveProgress(input: SaveProgressInput): Promise<void> {
  const response = await fetch("/api/trpc/onboarding.saveProgress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) {
    throw new Error(`Save failed: ${response.statusText}`);
  }
}

interface GetProgressResult {
  currentStep: number;
  completedSteps: number[];
  data: Record<string, unknown>;
}

async function fetchGetProgress(tenantId: string): Promise<GetProgressResult> {
  const url = `/api/trpc/onboarding.getProgress?input=${encodeURIComponent(JSON.stringify({ tenantId }))}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Get failed: ${response.statusText}`);
  }
  const json = await response.json();
  return json.result?.data ?? { currentStep: 1, completedSteps: [], data: {} };
}

// --- useOnboarding ---
export function useOnboarding(tenantId?: string): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Restore state on mount
  useEffect(() => {
    async function restore() {
      setIsLoading(true);
      setError(null);

      // Try tRPC first
      if (tenantId) {
        try {
          const progress = await fetchGetProgress(tenantId);
          setCurrentStep(progress.currentStep);
          setCompletedSteps(progress.completedSteps);
          setData(progress.data ?? {});
          setIsLoading(false);
          return;
        } catch {
          // Fall back to localStorage
        }
      }

      // localStorage fallback
      const stored = loadFromStorage(tenantId);
      if (stored) {
        setCurrentStep(stored.currentStep);
        setCompletedSteps(stored.completedSteps);
        setData(stored.data);
      }

      setIsLoading(false);
    }

    restore();
  }, [tenantId]);

  const saveProgress = useCallback(
    async (step: number, stepData?: Record<string, unknown>) => {
      const newCompleted = completedSteps.includes(step)
        ? completedSteps
        : [...completedSteps, step];

      const newData = stepData ? { ...data, ...stepData } : data;

      // Update local state immediately for optimistic UX
      setCurrentStep(step);
      setCompletedSteps(newCompleted);
      setData(newData);

      // Persist to storage optimistically
      saveToStorage(tenantId, { currentStep: step, completedSteps: newCompleted, data: newData });

      // Try tRPC, but don't block on failure — localStorage is the source of truth
      if (tenantId) {
        try {
          await fetchSaveProgress({ tenantId, step, data: newData });
        } catch {
          // Already saved to localStorage, will retry on next mount
        }
      }
    },
    [completedSteps, data, tenantId]
  );

  return {
    currentStep,
    completedSteps,
    data,
    saveProgress,
    isLoading,
    error,
  };
}

// --- useOnboardingRedirect ---
export function useOnboardingRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const user = session.user as { tenantId?: string; onboardingStatus?: string };
    const hasTenant = !!user?.tenantId;
    const onboardingComplete = user?.onboardingStatus === "complete";

    if (!hasTenant || !onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [session, status, router]);
}
