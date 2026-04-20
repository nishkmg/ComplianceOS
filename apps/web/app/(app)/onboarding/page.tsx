"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BusinessProfileStep from "./step-business-profile";
import { StepModuleActivation } from "./step-module-activation";
import StepCoATemplate from "./step-coa-template";
import StepFYGst from "./step-fy-gst";
import StepOpeningBalances from "./step-opening-balances";

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
              onNext={() => setStep(2)}
              onSave={(data) => setSavedData((prev) => ({ ...prev, ...data }))}
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
          {step === 3 && coaSubStep === "review" && (
            <CoAReviewStep
              templateName={coaTemplateData?.templateName ?? ""}
              templateKey={coaTemplateData?.templateKey ?? ""}
              onNext={() => setStep(4)}
              onBack={() => setCoaSubStep("select")}
            />
          )}
          {step === 4 && <StepFYGst onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {step === 5 && <StepOpeningBalances onComplete={() => router.push("/dashboard")} onBack={() => setStep(4)} />}
        </div>
      </div>
    </div>
  );
}

function CoAReviewStep({ templateName, templateKey, onNext, onBack }: { templateName: string; templateKey: string; onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review Chart of Accounts</h2>
      <p className="text-sm text-gray-500">You selected: <span className="font-medium">{templateName}</span>. Review the accounts before proceeding.</p>
      <div className="p-4 bg-gray-50 rounded text-sm space-y-1">
        <p className="font-medium">{templateName}</p>
        <p className="text-gray-500">Template: {templateKey}</p>
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-sm">← Back</button>
        <button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Continue →</button>
      </div>
    </div>
  );
}