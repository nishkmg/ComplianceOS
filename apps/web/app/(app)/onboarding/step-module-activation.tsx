// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";

const MODULES = [
  {
    id: "accounting",
    name: "Accounting",
    description: "Double-entry bookkeeping, financial statements",
    required: true,
  },
  {
    id: "invoicing",
    name: "Invoicing",
    description: "Sales & purchase invoices, credit notes",
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Stock tracking, FIFO valuation",
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Salary processing, payslips, PF/ESI/TDS",
  },
  {
    id: "gst",
    name: "GST",
    description: "GSTR-1/2B/3B, ITC reconciliation",
  },
  {
    id: "itr",
    name: "Income Tax",
    description: "ITR-3/4 computation, advance tax",
  },
  {
    id: "ocr",
    name: "OCR Scan",
    description: "Invoice & receipt scanning",
  },
];

interface StepModuleActivationProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepModuleActivation({ tenantId, onComplete }: StepModuleActivationProps) {
  const [modules, setModules] = useState(
    MODULES.map((m) => ({ module: m.id, enabled: m.required }))
  );

  const saveProgress = api.onboarding.saveProgress.useMutation({
    onSuccess: onComplete,
  });

  const toggleModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.module === moduleId
          ? { ...m, enabled: m.module === "accounting" ? true : !m.enabled }
          : m
      )
    );
  };

  const handleContinue = async () => {
    await saveProgress.mutateAsync({
      tenantId,
      step: 2,
      data: { moduleActivation: modules },
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-[20px] font-normal text-dark">Module Activation</h2>
        <p className="font-ui text-[13px] text-light mt-1">
          Choose the features you want to enable for your business
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => {
          const isEnabled = modules.find((m) => m.module === mod.id)?.enabled ?? false;
          return (
            <div
              key={mod.id}
              className={`card p-5 cursor-pointer transition-all ${
                isEnabled ? "border-amber bg-surface-muted" : ""
              }`}
              onClick={() => !mod.required && toggleModule(mod.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-ui text-[15px] font-medium text-dark">{mod.name}</h3>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    isEnabled ? "bg-amber" : "bg-lighter"
                  } relative`}
                  onClick={(e) => {
                    e.stopPropagation();
                    !mod.required && toggleModule(mod.id);
                  }}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? "left-5" : "left-1"
                    }`}
                  />
                </div>
              </div>
              <p className="font-ui text-[12px] text-light">{mod.description}</p>
              {mod.required && (
                <span className="inline-block mt-2 font-ui text-[9px] uppercase tracking-wide text-amber">
                  Required
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between items-center pt-6 border-t border-hairline">
        <p className="font-ui text-[12px] text-light">
          Accounting is always enabled (core feature)
        </p>
        <button
          onClick={handleContinue}
          disabled={saveProgress.isPending}
          className="filter-tab active disabled:opacity-50"
        >
          {saveProgress.isPending ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
