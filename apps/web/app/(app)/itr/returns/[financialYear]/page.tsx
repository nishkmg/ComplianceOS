"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
// @ts-ignore
import { ITRReturnType, ITRReturnStatus } from "@complianceos/shared";
import { Badge, BadgeVariant } from "@/components/ui";

const statusConfig: Record<ITRReturnStatus, { variant: "gray" | "blue" | "success" | "purple" | "danger"; label: string }> = {
  draft: { variant: "gray", label: "Draft" },
  computed: { variant: "blue", label: "Computed" },
  generated: { variant: "success", label: "Generated" },
  filed: { variant: "success", label: "Filed" },
  verified: { variant: "purple", label: "Verified" },
  voided: { variant: "danger", label: "Voided" },
};

export default function ITRFinancialYearPage() {
  const params = useParams();
  const router = useRouter();
  const financialYear = params.financialYear as string;
  const [activeTab, setActiveTab] = useState<"itr3" | "itr4">("itr3");

  const { data: returns, isLoading }: any = api.itrReturns.list.useQuery({ financialYear });
  const createReturn: any = api.itrReturns.create.useMutation();

  const handleCreate = async (returnType: "itr3" | "itr4") => {
    try {
      const result = await createReturn.mutateAsync({ financialYear, returnType });
      router.push(`/itr/returns/${financialYear}/${result.itrReturnId}`);
    } catch (error: unknown) {
      console.error("Failed to create return:", error);
    }
  };

// @ts-ignore
  const itr3Return = returns?.find((r) => r.returnType === "itr3");
// @ts-ignore
  const itr4Return = returns?.find((r) => r.returnType === "itr4");
  const currentReturn = activeTab === "itr3" ? itr3Return : itr4Return;

  if (isLoading) return <div className="text-center py-12 font-ui text-light">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/itr/returns" className="font-ui text-[13px] text-light hover:text-amber hover:underline">← Back to ITR Returns</Link>
        <h1 className="font-display text-display-lg font-semibold text-dark mt-1">ITR Returns - FY {financialYear}</h1>
        <p className="font-ui text-[13px] text-secondary mt-1">Assessment Year: {financialYear.replace(/^(\d{4})-(\d{2})$/, (_, start) => `${Number(start) + 1}-${(Number(start) + 2).toString().slice(-2)}`)}</p>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-4">
// @ts-ignore
          {[{ id: "itr3", label: "ITR-3" }, { id: "itr4", label: "ITR-4 (Sugam)" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`font-ui text-[13px] px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? "border-amber text-amber font-medium" : "border-transparent text-light hover:text-dark"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {currentReturn ? (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[16px] font-normal text-dark">{currentReturn.returnType.toUpperCase()} Return</h2>
            <Badge variant={statusConfig[currentReturn.status as ITRReturnStatus].variant as BadgeVariant}>{statusConfig[currentReturn.status as ITRReturnStatus].label}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Gross Total Income</p>
              <p className="font-mono text-[20px] font-medium text-dark">₹{Number(currentReturn.grossTotalIncome ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="card p-4">
              <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Total Income</p>
              <p className="font-mono text-[20px] font-medium text-dark">₹{Number(currentReturn.totalIncome ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="card p-4">
              <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Tax Payable</p>
              <p className="font-mono text-[20px] font-medium text-dark">₹{Number(currentReturn.taxPayable ?? "0").toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/itr/returns/${financialYear}/${currentReturn.id}`} className="filter-tab active">View Details</Link>
            {currentReturn.status === "draft" && (
              <Link href={`/itr/computation?returnId=${currentReturn.id}`} className="filter-tab bg-success text-white hover:bg-success/90">Compute Income</Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="font-display text-[16px] font-normal text-dark mb-3">Create {activeTab.toUpperCase()} Return</h2>
          <p className="font-ui text-[13px] text-light mb-5">
            {activeTab === "itr3"
              ? "ITR-3 is for individuals and HUFs having income from business or profession."
              : "ITR-4 (Sugam) is for individuals, HUFs and firms (other than LLP) with presumptive income."}
          </p>
          <button onClick={() => handleCreate(activeTab)} className="filter-tab active">Create {activeTab.toUpperCase()} Return</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href={`/itr/returns/${financialYear}/itr3`} className={`card p-5 hover:shadow-md transition ${activeTab === "itr3" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">ITR-3</h3>
          <p className="font-ui text-[12px] text-light">For individuals/HUFs with business income</p>
          {itr3Return && <p className="font-ui text-[11px] text-success mt-2">✓ Return exists</p>}
        </Link>
        <Link href={`/itr/returns/${financialYear}/itr4`} className={`card p-5 hover:shadow-md transition ${activeTab === "itr4" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">ITR-4 (Sugam)</h3>
          <p className="font-ui text-[12px] text-light">For presumptive income scheme</p>
          {itr4Return && <p className="font-ui text-[11px] text-success mt-2">✓ Return exists</p>}
        </Link>
      </div>
    </div>
  );
}
