"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ITRReturnType, ITRReturnStatus } from "@complianceos/shared";

const statusConfig: Record<ITRReturnStatus, { bg: string; label: string }> = {
  draft: { bg: "bg-gray-100 text-gray-800", label: "Draft" },
  computed: { bg: "bg-blue-100 text-blue-800", label: "Computed" },
  generated: { bg: "bg-green-100 text-green-800", label: "Generated" },
  filed: { bg: "bg-green-100 text-green-800", label: "Filed" },
  verified: { bg: "bg-purple-100 text-purple-800", label: "Verified" },
  voided: { bg: "bg-red-100 text-red-800", label: "Voided" },
};

const returnTypes = ["all", "itr3", "itr4"] as const;
const statuses = ["all", "draft", "computed", "generated", "filed", "verified"] as const;

const currentFY = `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`;

export default function ITRReturnsPage() {
  const [financialYear, setFinancialYear] = useState<string>(currentFY);
  const [returnType, setReturnType] = useState<(typeof returnTypes)[number]>("all");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");

  const { data: returns, isLoading } = api.itrReturns.list.useQuery({
    financialYear,
    returnType: returnType !== "all" ? (returnType as ITRReturnType) : undefined,
    status: status !== "all" ? (status as ITRReturnStatus) : undefined,
  });

  const filteredReturns = returns ?? [];

  const createReturn = api.itrReturns.create.useMutation();
  const generateReturn = api.itrReturns.generate.useMutation();
  const fileReturn = api.itrReturns.file.useMutation();
  const amendReturn = api.itrReturns.amend.useMutation();
  const voidReturn = api.itrReturns.void.useMutation();

  const handleCreate = async (type: "itr3" | "itr4") => {
    try {
      const result = await createReturn.mutateAsync({ financialYear, returnType: type });
      window.location.href = `/itr/returns/${financialYear}/${result.itrReturnId}`;
    } catch (error) {
      console.error("Failed to create return:", error);
      alert("Failed to create return. Please try again.");
    }
  };

  const handleGenerate = async (returnId: string, type: "itr3" | "itr4") => {
    try {
      await generateReturn.mutateAsync({ itrReturnId: returnId, returnType: type });
    } catch (error) {
      console.error("Failed to generate return:", error);
      alert("Failed to generate return. Please try again.");
    }
  };

  const handleFile = async (returnId: string) => {
    const acknowledgmentNumber = prompt("Enter Acknowledgment Number:");
    if (!acknowledgmentNumber) return;

    const verificationMode = prompt("Verification Mode (EVC, EVC-AADHAAR, EVC-DSC):", "EVC");
    if (!verificationMode) return;

    try {
      await fileReturn.mutateAsync({ itrReturnId: returnId, acknowledgmentNumber, verificationMode });
    } catch (error) {
      console.error("Failed to file return:", error);
      alert("Failed to file return. Please try again.");
    }
  };

  const handleAmend = async (returnId: string) => {
    if (!confirm("This will create a new amended return. Continue?")) return;
    
    try {
      const result = await amendReturn.mutateAsync({ itrReturnId: returnId });
      window.location.href = `/itr/returns/${financialYear}/${result.amendedReturnId}`;
    } catch (error) {
      console.error("Failed to amend return:", error);
      alert("Failed to amend return. Please try again.");
    }
  };

  const handleVoid = async (returnId: string) => {
    const reason = prompt("Enter reason for voiding:");
    if (!reason) return;

    try {
      await voidReturn.mutateAsync({ itrReturnId: returnId, reason });
    } catch (error) {
      console.error("Failed to void return:", error);
      alert("Failed to void return. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ITR Returns</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleCreate("itr3")}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Create ITR-3
          </button>
          <button
            onClick={() => handleCreate("itr4")}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Create ITR-4
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="FY (e.g., 2026-27)"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-32"
        />

        <select
          value={returnType}
          onChange={(e) => setReturnType(e.target.value as (typeof returnTypes)[number])}
          className="px-3 py-2 border rounded text-sm"
        >
          {returnTypes.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Return Types" : t.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
          className="px-3 py-2 border rounded text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Return #</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Assessment Year</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Total Income</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Tax Payable</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Balance</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Filed Date</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No ITR returns yet. Create one to get started.
                </td>
              </tr>
            ) : (
              filteredReturns.map((ret) => {
                const statusConf = statusConfig[ret.status] ?? { bg: "bg-gray-100 text-gray-800", label: ret.status };
                return (
                  <tr key={ret.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/itr/returns/${ret.financialYear}/${ret.id}`} className="text-blue-600 hover:underline">
                        {ret.assessmentYear}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium uppercase">{ret.returnType}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ret.assessmentYear}</td>
                    <td className="px-4 py-3 text-gray-600">₹{Number(ret.totalIncome ?? "0").toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right text-gray-600">₹{Number(ret.taxPayable ?? "0").toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right text-gray-600">₹{Number(ret.balancePayable ?? "0").toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusConf.bg}`}>
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ret.filedAt ? new Date(ret.filedAt).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/itr/returns/${ret.financialYear}/${ret.id}`} className="text-blue-600 hover:underline text-xs">
                          View
                        </Link>
                        {ret.status === "draft" && (
                          <button
                            onClick={() => handleGenerate(ret.id, ret.returnType as "itr3" | "itr4")}
                            className="text-green-600 hover:underline text-xs"
                          >
                            Generate
                          </button>
                        )}
                        {ret.status === "generated" && (
                          <button onClick={() => handleFile(ret.id)} className="text-green-600 hover:underline text-xs">
                            File
                          </button>
                        )}
                        {ret.status === "filed" && (
                          <button onClick={() => handleAmend(ret.id)} className="text-yellow-600 hover:underline text-xs">
                            Amend
                          </button>
                        )}
                        {ret.status === "draft" && (
                          <button onClick={() => handleVoid(ret.id)} className="text-red-600 hover:underline text-xs">
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredReturns.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredReturns.length} return(s) for FY {financialYear}
        </div>
      )}
    </div>
  );
}
