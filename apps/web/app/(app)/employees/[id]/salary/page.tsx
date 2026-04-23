// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

export default function EmployeeSalaryPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const { data: existingStructure } = api.salaryStructure.get.useQuery(employeeId);
  const createStructure = api.salaryStructure.create.useMutation({ onSuccess: () => router.push(`/employees/${employeeId}`) });
  const updateStructure = api.salaryStructure.update.useMutation({ onSuccess: () => router.push(`/employees/${employeeId}`) });

  const [components, setComponents] = useState<Array<{ componentCode: string; amount?: string; percentageOfBasic?: string }>>(
    existingStructure?.length ? existingStructure.map((c: any) => ({ componentCode: c.componentCode, amount: c.amount, percentageOfBasic: c.percentageOfBasic })) : [{ componentCode: "BASIC", amount: "0" }]
  );
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = { employeeId, effectiveFrom, components };
    if (existingStructure?.length) { updateStructure.mutate(input); } else { createStructure.mutate(input); }
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
        <h1 className="font-display text-[26px] font-normal text-dark">Salary Structure</h1>
        <p className="font-ui text-[12px] text-light mt-1">Configure employee compensation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
        <div className="card p-5">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Effective From <span className="text-danger">*</span></label>
            <input required type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} className="input-field font-ui w-48" />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-hairline font-display text-[14px] font-normal text-dark">Components</div>
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Component</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount (₹)</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">% of Basic</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, idx) => (
                <tr key={idx} className="border-b border-hairline">
                  <td className="px-4 py-3">
                    <select value={comp.componentCode} onChange={(e) => updateComponent(idx, "componentCode", e.target.value)} className="input-field font-ui w-full">
                      <option value="">Select Component</option>
                      {salaryComponents.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" step="0.01" value={comp.amount || ""} onChange={(e) => updateComponent(idx, "amount", e.target.value)} className="input-field font-mono w-full text-right" placeholder="0.00" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" step="0.01" value={comp.percentageOfBasic || ""} onChange={(e) => updateComponent(idx, "percentageOfBasic", e.target.value)} className="input-field font-mono w-full text-right" placeholder="% of Basic" />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => removeComponent(idx)} className="font-ui text-[12px] text-danger hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addComponent} className="font-ui text-[13px] text-amber hover:underline m-3 inline-block">+ Add Component</button>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={createStructure.isPending || updateStructure.isPending} className="filter-tab active disabled:opacity-50">
            {createStructure.isPending || updateStructure.isPending ? "Saving..." : "Save Salary Structure"}
          </button>
          <button type="button" onClick={() => router.back()} className="filter-tab">Cancel</button>
        </div>
      </form>
    </div>
  );
}
