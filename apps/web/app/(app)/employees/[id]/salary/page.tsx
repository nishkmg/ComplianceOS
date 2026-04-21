"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function EmployeeSalaryPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const { data: existingStructure } = api.salaryStructure.get.useQuery(employeeId);
  const createStructure = api.salaryStructure.create.useMutation({
    onSuccess: () => router.push(`/employees/${employeeId}`),
  });
  const updateStructure = api.salaryStructure.update.useMutation({
    onSuccess: () => router.push(`/employees/${employeeId}`),
  });

  const [components, setComponents] = useState<Array<{
    componentCode: string;
    amount?: string;
    percentageOfBasic?: string;
  }>>(existingStructure?.length ? existingStructure.map((c: any) => ({
    componentCode: c.componentCode,
    amount: c.amount,
    percentageOfBasic: c.percentageOfBasic,
  })) : [{ componentCode: "BASIC", amount: "0" }]);

  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = { employeeId, effectiveFrom, components };
    if (existingStructure?.length) {
      updateStructure.mutate(input);
    } else {
      createStructure.mutate(input);
    }
  };

  const addComponent = () => {
    setComponents([...components, { componentCode: "", amount: "" }]);
  };

  const updateComponent = (index: number, field: string, value: string) => {
    const updated = [...components];
    (updated[index] as any)[field] = value;
    setComponents(updated);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salary Structure</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
        <div>
          <label className="block text-sm font-medium mb-1">Effective From *</label>
          <input
            required
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="border rounded">
          <div className="bg-gray-50 px-4 py-2 border-b font-medium">Components</div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2 text-left">Component</th>
                <th className="border px-4 py-2 text-right">Amount (₹)</th>
                <th className="border px-4 py-2 text-right">% of Basic</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">
                    <select
                      value={comp.componentCode}
                      onChange={(e) => updateComponent(idx, "componentCode", e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="">Select Component</option>
                      <option value="BASIC">Basic Salary</option>
                      <option value="HRA">HRA</option>
                      <option value="SPECIAL_ALLOWANCE">Special Allowance</option>
                      <option value="TRANSPORT_ALLOWANCE">Transport Allowance</option>
                      <option value="MEDICAL_ALLOWANCE">Medical Allowance</option>
                      <option value="PF_EE">PF (Employee)</option>
                      <option value="TDS">TDS</option>
                      <option value="PROFESSIONAL_TAX">Professional Tax</option>
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={comp.amount || ""}
                      onChange={(e) => updateComponent(idx, "amount", e.target.value)}
                      className="w-full border rounded px-2 py-1 text-right"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={comp.percentageOfBasic || ""}
                      onChange={(e) => updateComponent(idx, "percentageOfBasic", e.target.value)}
                      className="w-full border rounded px-2 py-1 text-right"
                      placeholder="% of Basic"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      type="button"
                      onClick={() => removeComponent(idx)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addComponent}
            className="m-2 text-blue-600 hover:underline text-sm"
          >
            + Add Component
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createStructure.isPending || updateStructure.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createStructure.isPending || updateStructure.isPending ? "Saving..." : "Save Salary Structure"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
