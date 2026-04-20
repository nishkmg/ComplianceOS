"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepCoaReview from "./step-coa-review";
import BusinessProfileStep from "./step-business-profile";
import { StepModuleActivation } from "./step-module-activation";
import StepCoATemplate from "./step-coa-template";
import FYGstStep from "./step-fy-gst";
import OpeningBalancesStep from "./step-opening-balances";

const STEPS = [
  { id: 1, label: "Business Profile" },
  { id: 2, label: "Module Activation" },
  { id: 3, label: "Chart of Accounts" },
  { id: 4, label: "Fiscal Year & GST" },
  { id: 5, label: "Opening Balances" },
];

interface SavedStep1Data {
  businessType?: string;
  industry?: string;
  [key: string]: unknown;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [savedData, setSavedData] = useState<Record<string, unknown>>({});
  const [coaSubStep, setCoaSubStep] = useState<"select" | "review">("select");
  const [coaTemplateData, setCoaTemplateData] = useState<{ templateName: string; templateKey: string } | null>(null);
  const router = useRouter();

  const saveProgress = async (stepNum: number, data?: Record<string, unknown>) => {
    const newData = data ? { ...savedData, ...data } : savedData;
    setSavedData(newData);
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_progress", JSON.stringify({ step: stepNum, data: newData }));
    }
  };

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
                step >= s.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              <span className={`ml-2 text-sm ${step >= s.id ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-2 ${step > s.id ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {step === 1 && (
            <BusinessProfileStep
              onNext={(tenantId) => {
                // BusinessProfileStep already saves via tRPC internally
                // Just advance to step 2
                setStep(2);
              }}
              tenantId={savedData?.tenantId as string | undefined}
              savedData={savedData}
            />
          )}
          {step === 2 && (
            <StepModuleActivation
              businessType={(savedData as SavedStep1Data)?.businessType}
              industry={(savedData as SavedStep1Data)?.industry}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              saveProgress={saveProgress}
            />
          )}
          {step === 3 && coaSubStep === "select" && (
            <StepCoATemplate
              businessType={(savedData as SavedStep1Data)?.businessType ?? ""}
              industry={(savedData as SavedStep1Data)?.industry ?? ""}
              onNext={(data) => { setCoaTemplateData(data); setCoaSubStep("review"); }}
              onBack={() => setStep(2)}
            />
          )}
          {step === 3 && coaSubStep === "review" && coaTemplateData && (
            <StepCoaReview
              templateKey={coaTemplateData.templateKey}
              onBack={() => setCoaSubStep("select")}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && <FYGstStep onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {step === 5 && <OpeningBalancesStep onComplete={() => router.push("/dashboard")} onBack={() => setStep(4)} />}
        </div>
      </div>
    </div>
  );
}

