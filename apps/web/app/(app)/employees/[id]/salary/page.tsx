"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function EmployeeSalaryPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const utils = api.useUtils();
  const [saving, setSaving] = useState(false);

  const [components, setComponents] = useState<Array<{ componentCode: string; amount?: string; percentageOfBasic?: string }>>([
    { componentCode: "BASIC", amount: "0" }
  ]);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);

  const createStructure = api.salaryStructure.create.useMutation({
    onSuccess: () => {
      showToast.success("Salary structure saved.");
      void utils.employees.get.invalidate();
      router.push(`/employees/${employeeId}`);
    },
    onError: (e) => {
      showToast.error(e.message);
      setSaving(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const validComponents = components.filter((c) => c.componentCode);
    if (validComponents.length === 0) {
      showToast.error("Add at least one salary component.");
      return;
    }
    setSaving(true);
    createStructure.mutate({
      employeeId,
      effectiveFrom,
      components: validComponents,
    });
  };

  const addComponent = () => { setComponents([...components, { componentCode: "", amount: "" }]); };
  const updateComponent = (index: number, field: string, value: string) => {
    const updated = [...components];
    (updated[index] as any)[field] = value;
    setComponents(updated);
  };
  const removeComponent = (index: number) => { setComponents(components.filter((_, i) => i !== index)); };

  const salaryComponents = [
    { code: "BASIC", label: "Basic Salary" },
    { code: "HRA", label: "HRA" },
    { code: "SPECIAL_ALLOWANCE", label: "Special Allowance" },
    { code: "TRANSPORT_ALLOWANCE", label: "Transport Allowance" },
    { code: "MEDICAL_ALLOWANCE", label: "Medical Allowance" },
    { code: "PF_EE", label: "PF (Employee)" },
    { code: "TDS", label: "TDS" },
    { code: "PROFESSIONAL_TAX", label: "Professional Tax" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Employee Profile</p>
        <PageHeader title="Salary Structure" />
        <p className="text-ui-sm text-secondary font-ui mt-1">Configure employee compensation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
        <Card className="p-5">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-ui-2xs uppercase tracking-wide text-light">Effective From <span className="text-danger">*</span></label>
            <Input required type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} className="font-ui w-48" />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-ui text-ui-md font-normal text-dark">Components</div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-ui text-ui-2xs uppercase tracking-wide text-left">Component</th>
                <th className="font-ui text-ui-2xs uppercase tracking-wide text-right">Amount (₹)</th>
                <th className="font-ui text-ui-2xs uppercase tracking-wide text-right">% of Basic</th>
                <th className="font-ui text-ui-2xs uppercase tracking-wide text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Select value={comp.componentCode} onChange={(e) => updateComponent(idx, "componentCode", e.target.value)} className="font-ui w-full">
                      <option value="">Select Component</option>
                      {salaryComponents.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" step="0.01" value={comp.amount || ""} onChange={(e) => updateComponent(idx, "amount", e.target.value)} className="font-mono w-full text-right" placeholder="0.00" />
                  </td>
                  <td className="px-4 py-3">
                    <Input type="number" step="0.01" value={comp.percentageOfBasic || ""} onChange={(e) => updateComponent(idx, "percentageOfBasic", e.target.value)} className="font-mono w-full text-right" placeholder="% of Basic" />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => removeComponent(idx)} className="font-ui text-ui-xs text-danger hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button type="button" onClick={addComponent} variant="ghost" className="m-3">+ Add Component</Button>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Salary Structure"}
          </Button>
          <Button type="button" onClick={() => router.back()} variant="outline" aria-label="Go back">Cancel</Button>
        </div>
      </form>
    </div>
  );
}
