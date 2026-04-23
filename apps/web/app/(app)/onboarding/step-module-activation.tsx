"use client";

import { useState } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Module Activation</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose the features you want to enable for your business
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => {
          const isEnabled = modules.find((m) => m.module === mod.id)?.enabled ?? false;
          return (
            <Card key={mod.id} className={isEnabled ? "border-amber-500 bg-amber-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{mod.name}</CardTitle>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleModule(mod.id)}
                    disabled={mod.required}
                  />
                </div>
                <CardDescription className="text-sm">
                  {mod.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Accounting is always enabled (core feature)
        </p>
        <Button onClick={handleContinue} disabled={saveProgress.isPending}>
          Continue
        </Button>
      </div>
    </div>
  );
}
