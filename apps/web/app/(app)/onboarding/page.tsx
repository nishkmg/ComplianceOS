"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StepCoaReview from "./step-coa-review";
import BusinessProfileStep from "./step-business-profile";
import { StepModuleActivation } from "./step-module-activation";
import StepCoATemplate from "./step-coa-template";
import FYGstStep from "./step-fy-gst";
import OpeningBalancesStep from "./step-opening-balances";
import { useOnboarding } from "./use-onboarding";

const STEPS = [
  { id: 1, label: "Business Profile" },
  { id: 2, label: "Module Activation" },
  { id: 3, label: "Chart of Accounts" },
  { id: 4, label: "Fiscal Year & GST" },
  { id: 5, label: "Opening Balances" },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as { tenantId?: string })?.tenantId;
  const { currentStep, data: savedData, saveProgress, isLoading } = useOnboarding(tenantId);
  const router = useRouter();

  // COA sub-step state — persisted in savedData.coa for resume support
  const coaData = savedData?.coa as { templateKey?: string; refinements?: unknown } | undefined;
  const coaSubStep: "select" | "review" = coaData?.templateKey ? "review" : "select";
  const coaTemplateData = coaData?.templateKey
    ? { templateKey: coaData.templateKey, templateName: "" }
    : null;

  // Redirect if already complete
  useEffect(() => {
    if (!isLoading && savedData?.onboardingStatus === "complete") {
      router.replace("/dashboard");
    }
  }, [isLoading, savedData, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ComplianceOS</h1>
          <p className="text-gray-500">Let&apos;s set up your business in a few steps</p>
        </div>

        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= s.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {currentStep > s.id ? "✓" : s.id}
              </div>
              <span className={`ml-2 text-sm ${currentStep >= s.id ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-2 ${currentStep > s.id ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {currentStep === 1 && (
            <BusinessProfileStep
              onNext={(newTenantId) => {
                saveProgress(1, { tenantId: newTenantId });
              }}
              tenantId={tenantId ?? (savedData?.tenantId as string | undefined)}
              savedData={savedData as Record<string, unknown>}
            />
          )}
          {currentStep === 2 && (
            <StepModuleActivation
              businessType={(savedData as Record<string, unknown>)?.businessType as string}
              industry={(savedData as Record<string, unknown>)?.industry as string}
              onNext={() => saveProgress(2)}
              onBack={() => saveProgress(1)}
              saveProgress={saveProgress}
            />
          )}
          {currentStep === 3 && coaSubStep === "select" && (
            <StepCoATemplate
              businessType={(savedData as Record<string, unknown>)?.businessType as string ?? ""}
              industry={(savedData as Record<string, unknown>)?.industry as string ?? ""}
              onNext={(data) => {
                // Save template selection immediately for resume support
                saveProgress(3, { coa: { templateKey: data.templateKey, templateName: data.templateName } });
              }}
              onBack={() => saveProgress(2)}
            />
          )}
          {currentStep === 3 && coaSubStep === "review" && coaTemplateData && (
            <StepCoaReview
              templateKey={coaTemplateData.templateKey}
              tenantId={tenantId ?? ""}
              onBack={() => {
                // Clear CoA selection to go back to template select
                saveProgress(3, { coa: null });
              }}
              onNext={() => {
                saveProgress(3);
              }}
              onSaveProgress={(data) => saveProgress(3, data)}
            />
          )}
          {currentStep === 4 && (
            <FYGstStep
              onNext={() => saveProgress(4)}
              onBack={() => saveProgress(3)}
            />
          )}
          {currentStep === 5 && (
            <OpeningBalancesStep
              onComplete={() => router.push("/dashboard")}
              onBack={() => saveProgress(4)}
              savedData={savedData as Record<string, unknown>}
              tenantId={tenantId ?? undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
