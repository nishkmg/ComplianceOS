"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge, BadgeVariant } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

const months = [
  { value: 1, label: "April" }, { value: 2, label: "May" }, { value: 3, label: "June" },
  { value: 4, label: "July" }, { value: 5, label: "August" }, { value: 6, label: "September" },
  { value: 7, label: "October" }, { value: 8, label: "November" }, { value: 9, label: "December" },
  { value: 10, label: "January" }, { value: 11, label: "February" }, { value: 12, label: "March" },
];

export default function GSTReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [period] = (params.period as string).split("-");
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);
  const [activeTab, setActiveTab] = useState<"gstr1" | "gstr2b" | "gstr3b">("gstr1");

  const { data: returns }: any = api.gstReturns.list.useQuery({ periodMonth: month, periodYear: year });
// @ts-ignore
  const gstr1 = returns?.find((r) => r.returnType === "gstr1");
// @ts-ignore
  const gstr2b = returns?.find((r) => r.returnType === "gstr2b");
// @ts-ignore
  const gstr3b = returns?.find((r) => r.returnType === "gstr3b");
  const currentReturn = activeTab === "gstr1" ? gstr1 : activeTab === "gstr2b" ? gstr2b : gstr3b;

  const generateGSTR1: any = api.gstReturns.generateGSTR1.useMutation();
  const generateGSTR2B: any = api.gstReturns.generateGSTR2B.useMutation();
  const generateGSTR3B: any = api.gstReturns.generateGSTR3B.useMutation();
  const fileReturn: any = api.gstReturns.file.useMutation();

  const handleGenerateAll = async () => {
    try {
      await Promise.all([
        generateGSTR1.mutateAsync({ periodMonth: month, periodYear: year }),
        generateGSTR2B.mutateAsync({ periodMonth: month, periodYear: year }),
        generateGSTR3B.mutateAsync({ periodMonth: month, periodYear: year }),
      ]);
    } catch (error: unknown) { console.error("Failed to generate returns:", error); }
  };

  const handleFileReturn = async (returnId: string) => {
    const arn = prompt("Enter ARN (Acknowledgement Reference Number):");
    if (!arn) return;
    try { await fileReturn.mutateAsync({ returnId, arn }); }
    catch (error: unknown) { console.error("Failed to file return:", error); }
  };

  const statusConfig: Record<string, { label: string; variant: "gray" | "blue" | "success" | "amber" }> = {
    draft: { label: "Draft", variant: "gray" },
    generated: { label: "Generated", variant: "blue" },
    filed: { label: "Filed", variant: "success" },
    amended: { label: "Amended", variant: "amber" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
// @ts-ignore
          <h1 className="font-display text-[26px] font-normal text-dark">GST Return - {months.find((m) => m.value === month)?.label} {year}</h1>
// @ts-ignore
          <p className="font-ui text-[12px] text-light mt-1">Tax Period: {months.find((m) => m.value === month)?.label} {year}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerateAll} className="filter-tab active">Generate All</button>
          {currentReturn && currentReturn.status === "generated" && (
            <button onClick={() => handleFileReturn(currentReturn.id)} className="filter-tab bg-success text-white hover:bg-success/90">File Return</button>
          )}
        </div>
      </div>

      <div className="border-b border-hairline">
        <nav className="flex gap-4">
// @ts-ignore
          {[{ id: "gstr1", label: "GSTR-1" }, { id: "gstr2b", label: "GSTR-2B" }, { id: "gstr3b", label: "GSTR-3B" }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`font-ui text-[13px] px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? "border-amber text-amber font-medium" : "border-transparent text-light hover:text-dark"}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Turnover</p>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(currentReturn ? Number(currentReturn.totalOutwardSupplies) : 0)}</p>
          <p className="font-ui text-[11px] text-light mt-1">Outward Supplies</p>
        </div>
        <div className="card p-5">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Tax Liability</p>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(currentReturn ? Number(currentReturn.totalTaxPayable) : 0)}</p>
          <p className="font-ui text-[11px] text-light mt-1">Total Tax</p>
        </div>
        <div className="card p-5">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">ITC Available</p>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(currentReturn ? Number(currentReturn.totalEligibleItc) : 0)}</p>
          <p className="font-ui text-[11px] text-light mt-1">Input Tax Credit</p>
        </div>
        <div className="card p-5">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Net Payable</p>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(currentReturn ? (Number(currentReturn.totalTaxPayable) - Number(currentReturn.totalEligibleItc)) : 0)}</p>
          <p className="font-ui text-[11px] text-light mt-1">After ITC</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Return Summary</h2>
        {currentReturn ? (
          <div className="space-y-2 font-ui text-[13px]">
            <div className="flex justify-between py-2 border-b border-hairline"><span className="text-light">Return Number</span><span className="font-mono text-dark">{currentReturn.returnNumber}</span></div>
            <div className="flex justify-between py-2 border-b border-hairline"><span className="text-light">Return Type</span><span className="font-mono text-dark uppercase">{currentReturn.returnType}</span></div>
            <div className="flex justify-between py-2 border-b border-hairline"><span className="text-light">Status</span><Badge variant={statusConfig[currentReturn.status]?.variant as BadgeVariant || "gray"}>{statusConfig[currentReturn.status]?.label || currentReturn.status}</Badge></div>
            <div className="flex justify-between py-2 border-b border-hairline"><span className="text-light">Due Date</span><span className="font-mono text-dark">{currentReturn.dueDate}</span></div>
            {currentReturn.filingDate && <div className="flex justify-between py-2 border-b border-hairline"><span className="text-light">Filed Date</span><span className="font-mono text-dark">{currentReturn.filingDate}</span></div>}
            <div className="flex justify-between py-2 border-b border-hairline"><span className="text-light">Total Tax Payable</span><span className="font-mono text-dark">{formatIndianNumber(Number(currentReturn.totalTaxPayable))}</span></div>
            <div className="flex justify-between py-2 border-b border-hairline"><span className="text-light">Total ITC</span><span className="font-mono text-dark">{formatIndianNumber(Number(currentReturn.totalEligibleItc))}</span></div>
            <div className="flex justify-between py-2"><span className="text-light">Tax Paid</span><span className="font-mono text-dark">{formatIndianNumber(Number(currentReturn.totalTaxPaid))}</span></div>
          </div>
        ) : (
          <p className="font-ui text-[13px] text-light">No data available for this return type</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href={`/gst/returns/${params.period}/gstr1`} className={`card p-5 hover:shadow-md transition ${activeTab === "gstr1" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">GSTR-1</h3>
          <p className="font-ui text-[12px] text-light">Outward supplies details</p>
          {gstr1 && <p className="font-ui text-[11px] text-success mt-2">✓ Generated</p>}
        </Link>
        <Link href={`/gst/returns/${params.period}/gstr2b`} className={`card p-5 hover:shadow-md transition ${activeTab === "gstr2b" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">GSTR-2B</h3>
          <p className="font-ui text-[12px] text-light">Input tax credit details</p>
          {gstr2b && <p className="font-ui text-[11px] text-success mt-2">✓ Generated</p>}
        </Link>
        <Link href={`/gst/returns/${params.period}/gstr3b`} className={`card p-5 hover:shadow-md transition ${activeTab === "gstr3b" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">GSTR-3B</h3>
          <p className="font-ui text-[12px] text-light">Summary return</p>
          {gstr3b && <p className="font-ui text-[11px] text-success mt-2">✓ Generated</p>}
        </Link>
      </div>
    </div>
  );
}
