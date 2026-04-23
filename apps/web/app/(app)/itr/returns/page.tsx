// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

const statusConfig: Record<string, { label: string; variant: "gray" | "blue" | "success" | "purple" | "danger" }> = {
  draft: { label: "Draft", variant: "gray" },
  computed: { label: "Computed", variant: "blue" },
  generated: { label: "Generated", variant: "success" },
  filed: { label: "Filed", variant: "success" },
  verified: { label: "Verified", variant: "purple" },
  voided: { label: "Voided", variant: "danger" },
};

const returnTypes = ["all", "itr3", "itr4"] as const;
const statuses = ["all", "draft", "computed", "generated", "filed", "verified"] as const;
const currentFY = `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`;

export default function ITRReturnsPage() {
  const [financialYear, setFinancialYear] = useState<string>(currentFY);
  const [returnType, setReturnType] = useState<(typeof returnTypes)[number]>("all");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");

  const { data: returns } = api.itrReturns.list.useQuery({ financialYear, returnType: returnType !== "all" ? returnType : undefined, status: status !== "all" ? status : undefined });
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
    } catch (error) { console.error("Failed to create return:", error); }
  };

  const handleGenerate = async (returnId: string, type: "itr3" | "itr4") => {
    try { await generateReturn.mutateAsync({ itrReturnId: returnId, returnType: type }); }
    catch (error) { console.error("Failed to generate return:", error); }
  };

  const handleFile = async (returnId: string) => {
    const acknowledgmentNumber = prompt("Enter Acknowledgment Number:");
    if (!acknowledgmentNumber) return;
    const verificationMode = prompt("Verification Mode (EVC, EVC-AADHAAR, EVC-DSC):", "EVC");
    if (!verificationMode) return;
    try { await fileReturn.mutateAsync({ itrReturnId: returnId, acknowledgmentNumber, verificationMode }); }
    catch (error) { console.error("Failed to file return:", error); }
  };

  const handleAmend = async (returnId: string) => {
    if (!confirm("This will create a new amended return. Continue?")) return;
    try { const result = await amendReturn.mutateAsync({ itrReturnId: returnId }); window.location.href = `/itr/returns/${financialYear}/${result.amendedReturnId}`; }
    catch (error) { console.error("Failed to amend return:", error); }
  };

  const handleVoid = async (returnId: string) => {
    const reason = prompt("Enter reason for voiding:");
    if (!reason) return;
    try { await voidReturn.mutateAsync({ itrReturnId: returnId, reason }); }
    catch (error) { console.error("Failed to void return:", error); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">ITR Returns</h1>
          <p className="font-ui text-[12px] text-light mt-1">File income tax returns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleCreate("itr3")} className="filter-tab active">New ITR-3</button>
          <button onClick={() => handleCreate("itr4")} className="filter-tab active">New ITR-4</button>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Financial Year</label>
          <select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} className="input-field font-ui">
            <option value="2025-26">FY 2025-26</option>
            <option value="2026-27">FY 2026-27</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Return Type</label>
          <select value={returnType} onChange={(e) => setReturnType(e.target.value as (typeof returnTypes)[number])} className="input-field font-ui">
            {returnTypes.map((t) => (<option key={t} value={t}>{t === "all" ? "All Return Types" : t.toUpperCase()}</option>))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])} className="input-field font-ui">
            {statuses.map((s) => (<option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Return ID</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Type</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">FY</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Filed Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((ret) => {
                const statusConf = statusConfig[ret.status] ?? { label: ret.status, variant: "gray" as const };
                return (
                  <tr key={ret.id} className="border-b border-hairline">
                    <td className="px-4 py-3"><Link href={`/itr/returns/${financialYear}/${ret.itrReturnId}`} className="font-mono text-[13px] text-amber hover:underline">{ret.returnNumber || "Draft"}</Link></td>
                    <td className="font-ui text-[13px] text-dark px-4 py-3 uppercase">{ret.returnType}</td>
                    <td className="font-ui text-[13px] text-mid px-4 py-3">{ret.financialYear}</td>
                    <td className="px-4 py-3"><Badge variant={statusConf.variant}>{statusConf.label}</Badge></td>
                    <td className="font-mono text-[13px] text-light px-4 py-3">{ret.filedAt ? new Date(ret.filedAt).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/itr/returns/${financialYear}/${ret.itrReturnId}`} className="font-ui text-[12px] text-amber hover:underline">View</Link>
                        {ret.status === "draft" && <button onClick={() => handleGenerate(ret.itrReturnId, ret.returnType)} className="font-ui text-[12px] text-mid hover:underline">Generate</button>}
                        {ret.status === "generated" && <button onClick={() => handleFile(ret.itrReturnId)} className="font-ui text-[12px] text-success hover:underline">File</button>}
                        {ret.status === "filed" && <button onClick={() => handleAmend(ret.itrReturnId)} className="font-ui text-[12px] text-amber hover:underline">Amend</button>}
                        {ret.status === "computed" && <button onClick={() => handleVoid(ret.itrReturnId)} className="font-ui text-[12px] text-danger hover:underline">Void</button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center font-ui text-light">No returns found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
