"use client";

import { useState, useEffect } from "react";

// --- Types ---
type ModuleId = "accounting" | "invoicing" | "inventory" | "payroll" | "gst" | "ocr" | "itr";

interface ModuleConfig {
  id: ModuleId;
  label: string;
  description: string;
}

interface ModuleState {
  module: ModuleId;
  enabled: boolean;
}

interface StepModuleActivationProps {
  businessType?: string;
  industry?: string;
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveProgress?: (step: number, data?: Record<string, any>) => Promise<void>;
}

// --- Constants ---
const MODULES: ModuleConfig[] = [
  { id: "accounting", label: "Accounting", description: "Core double-entry ledger, chart of accounts, journal entries" },
  { id: "invoicing", label: "Invoicing", description: "Create and track invoices, manage receivables" },
  { id: "inventory", label: "Inventory", description: "Track stock, BOM for manufacturing" },
  { id: "payroll", label: "Payroll", description: "Salary processing, TDS deductions" },
  { id: "gst", label: "GST Returns", description: "Generate GSTR-1, GSTR-3B reports" },
  { id: "ocr", label: "OCR Scan", description: "Image to ledger entry (future)" },
  { id: "itr", label: "ITR Filing", description: "Income tax return preparation" },
];

// Matrix key format: "${businessType}_${industry}"
type MatrixKey = string;

const MODULE_MATRIX: Record<MatrixKey, ModuleId[]> = {
  sole_proprietorship_trading: ["accounting", "invoicing", "inventory", "gst"],
  sole_proprietorship_services: ["accounting", "invoicing", "gst"],
  partnership_trading: ["accounting", "invoicing", "inventory", "gst"],
  partnership_services: ["accounting", "invoicing", "gst"],
  llp_services: ["accounting", "invoicing", "gst"],
  private_limited_manufacturing: ["accounting", "invoicing", "inventory", "payroll", "gst", "itr"],
  private_limited_trading: ["accounting", "invoicing", "inventory", "payroll", "gst", "itr"],
  private_limited_services: ["accounting", "invoicing", "payroll", "gst", "itr"],
  huf_trading: ["accounting", "gst"],
  regulated_professional: ["accounting", "invoicing", "gst"],
};

function getRecommendedModules(businessType: string, industry: string): Set<ModuleId> {
  const key = `${businessType}_${industry}` as MatrixKey;
  const recommended = MODULE_MATRIX[key];
  return new Set(recommended ?? []);
}

// --- Component ---
export function StepModuleActivation({
  businessType: businessTypeProp,
  industry: industryProp,
  onNext,
  onBack,
  saveProgress,
}: StepModuleActivationProps) {
  const [modules, setModules] = useState<ModuleState[]>(
    MODULES.map((m) => ({ module: m.id, enabled: false }))
  );
  const [businessType, setBusinessType] = useState<string>(businessTypeProp ?? "");
  const [industry, setIndustry] = useState<string>(industryProp ?? "");
  const [initialized, setInitialized] = useState(false);

  // Initialize from props or saved data
  useEffect(() => {
    const savedModules = businessTypeProp && industryProp
      ? getRecommendedModules(businessTypeProp, industryProp)
      : new Set<ModuleId>();

    // If we have saved data in parent context (passed via props), use that
    // For now, just set from props
    setModules(
      MODULES.map((m) => ({
        module: m.id,
        enabled: m.id === "accounting" ? true : savedModules.has(m.id),
      }))
    );
    setBusinessType(businessTypeProp ?? "");
    setIndustry(industryProp ?? "");
    setInitialized(true);
  }, [businessTypeProp, industryProp]);

  const toggleModule = (moduleId: ModuleId) => {
    if (moduleId === "accounting") return; // locked
    setModules((prev) =>
      prev.map((m) => (m.module === moduleId ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleSubmit = async () => {
    if (saveProgress) {
      await saveProgress(2, { modules, businessType, industry });
    }
    onNext();
  };

  if (!initialized) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Module Activation</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Module Activation</h2>
        <p className="text-sm text-gray-500 mt-1">
          Based on your business type{businessType ? ` (${businessType.replace(/_/g, " ")})` : ""},
          we recommend enabling the following modules. You can adjust any selection before continuing.
        </p>
      </div>

      <div className="space-y-3">
        {MODULES.map((mod) => {
          const state = modules.find((m) => m.module === mod.id);
          const isLocked = mod.id === "accounting";
          const isEnabled = state?.enabled ?? false;
          const isRecommended =
            mod.id !== "accounting" &&
            getRecommendedModules(businessType || "default", industry || "default").has(mod.id);

          return (
            <div
              key={mod.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                isLocked
                  ? "border-gray-200 bg-gray-50 opacity-75"
                  : isEnabled
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleModule(mod.id)}>
                  {/* Toggle Switch */}
                  <div
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? "bg-blue-600" : "bg-gray-200"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    onClick={(e) => {
                      if (!isLocked) {
                        e.stopPropagation();
                        toggleModule(mod.id);
                      }
                    }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {mod.label}
                      {isRecommended && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Recommended
                        </span>
                      )}
                      {isLocked && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Always on
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}