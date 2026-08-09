"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  number: number;
  title: string;
  group: string;
}

interface StepperProps {
  steps: readonly StepperStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
  visibleSteps?: number[];
}

export function Stepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  visibleSteps,
}: StepperProps) {
  const visible = visibleSteps
    ? steps.filter((s) => visibleSteps.includes(s.number))
    : [...steps];

  const groups = useMemo(() => {
    const map = new Map<string, StepperStep[]>();
    for (const step of visible) {
      const existing = map.get(step.group) || [];
      existing.push(step);
      map.set(step.group, existing);
    }
    return Array.from(map.entries());
  }, [visible]);

  const progressPercent = visible.length > 0
    ? Math.round((completedSteps.filter((s) => visible.some((v) => v.number === s)).length / visible.length) * 100)
    : 0;

  const visibleCompletedCount = completedSteps.filter(
    (s) => visible.some((v) => v.number === s)
  ).length;

  return (
    <nav aria-label="Onboarding progress" className="w-full">
      {/* Group labels */}
      <div className="flex gap-0 mb-2" aria-hidden="true">
        {groups.map(([group, groupSteps]) => {
          const groupWidth = (groupSteps.length / visible.length) * 100;
          return (
            <div key={group} className="text-center" style={{ width: `${groupWidth}%` }}>
              <span className="font-ui text-[9px] uppercase tracking-[0.15em] text-text-light">
                {group}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        className="flex gap-1 w-full h-2"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Onboarding progress: ${visibleCompletedCount} of ${visible.length} steps complete`}
      >
        {visible.map((step) => {
          const isActive = currentStep >= step.number;
          const isCompleted = completedSteps.includes(step.number);
          const isClickable = isCompleted && onStepClick;

          return (
            <div
              key={step.number}
              title={`${step.title}${isCompleted ? " (click to revisit)" : ""}`}
              onClick={() => isClickable && onStepClick(step.number)}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onStepClick(step.number);
                }
              }}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              className={cn(
                "flex-1 rounded-sm transition-[width] duration-500",
                isActive ? "bg-amber" : "bg-border-subtle",
                isClickable
                  ? "cursor-pointer hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:ring-2 focus:ring-amber focus:ring-offset-1"
                  : "cursor-default"
              )}
              aria-label={`Step ${step.number}: ${step.title}${isCompleted ? " (completed)" : ""}`}
            />
          );
        })}
      </div>

      {/* Step indicator */}
      <div className="flex justify-between mt-2">
        <span className="font-ui text-[10px] text-text-light uppercase tracking-widest">
          Step {currentStep} of {visible.length}
        </span>
        <span className="font-ui text-[10px] text-text-light uppercase tracking-widest">
          {visibleCompletedCount}/{visible.length} complete
        </span>
      </div>
    </nav>
  );
}
