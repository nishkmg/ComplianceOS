// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

interface GSTReturn {
  id: string;
  returnNumber: string;
  returnType: "gstr1" | "gstr2b" | "gstr3b" | "gstr9" | "gstr4" | "itc_reconciliation";
  taxPeriodMonth: string;
  taxPeriodYear: string;
  status: "draft" | "generated" | "filed" | "amended" | "completed";
  totalOutwardSupplies: string;
  totalEligibleItc: string;
  totalTaxPayable: string;
  totalTaxPaid: string;
  filingDate?: string;
  dueDate: string;
}

const statusConfig: Record<GSTReturn["status"], { label: string; variant: "gray" | "blue" | "success" | "amber" }> = {
  draft: { label: "Draft", variant: "gray" },
  generated: { label: "Generated", variant: "blue" },
  filed: { label: "Filed", variant: "success" },
  amended: { label: "Amended", variant: "amber" },
  completed: { label: "Completed", variant: "success" },
};

const returnTypes = ["all", "gstr1", "gstr2b", "gstr3b"] as const;
const statuses = ["all", "draft", "generated", "filed", "amended"] as const;
const months = [
  { value: 1, label: "April" },
  { value: 2, label: "May" },
  { value: 3, label: "June" },
  { value: 4, label: "July" },
  { value: 5, label: "August" },
  { value: 6, label: "September" },
  { value: 7, label: "October" },
  { value: 8, label: "November" },
  { value: 9, label: "December" },
  { value: 10, label: "January" },
  { value: 11, label: "February" },
  { value: 12, label: "March" },
];

export default function GSTReturnsPage() {
  const [periodMonth, setPeriodMonth] = useState<number | undefined>(undefined);
  const [periodYear, setPeriodYear] = useState<number | undefined>(undefined);
  const [returnType, setReturnType] = useState<(typeof returnTypes)[number]>("all");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: returns, isLoading } = api.gstReturns.list.useQuery({
    periodMonth,
    periodYear,
    returnType: returnType !== "all" ? returnType : undefined,
    status: status !== "all" ? status : undefined,
  });

  const filteredReturns = returns ?? [];

  const generateGSTR1 = api.gstReturns.generateGSTR1.useMutation();
  const generateGSTR2B = api.gstReturns.generateGSTR2B.useMutation();
  const generateGSTR3B = api.gstReturns.generateGSTR3B.useMutation();
  const fileReturn = api.gstReturns.file.useMutation();
  const amendReturn = api.gstReturns.amend.useMutation();

  const handleGenerate = async (month: number, year: number, type: GSTReturn["returnType"]) => {
    try {
      if (type === "gstr1") {
        await generateGSTR1.mutateAsync({ periodMonth: month, periodYear: year });
      } else if (type === "gstr2b") {
        await generateGSTR2B.mutateAsync({ periodMonth: month, periodYear: year });
      } else if (type === "gstr3b") {
        await generateGSTR3B.mutateAsync({ periodMonth: month, periodYear: year });
      }
    } catch (error) {
      console.error("Failed to generate return:", error);
    }
  };

  const handleFile = async (returnId: string) => {
    const arn = prompt("Enter ARN (Acknowledgement Reference Number):");
    if (!arn) return;

    try {
      await fileReturn.mutateAsync({ returnId, arn });
    } catch (error) {
      console.error("Failed to file return:", error);
    }
  };

  const handleAmend = async (returnId: string) => {
    const changesJson = prompt("Enter changes as JSON:");
    if (!changesJson) return;

    try {
      const changes = JSON.parse(changesJson);
      await amendReturn.mutateAsync({ returnId, changes });
    } catch (error) {
      console.error("Failed to amend return:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">GST Returns</h1>
          <p className="font-ui text-[12px] text-light mt-1">Generate and file GST returns</p>
        </div>
        <button className="filter-tab active">Generate All</button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Month</label>
          <select
            value={periodMonth ?? ""}
            onChange={(e) => { setPeriodMonth(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="input-field font-ui"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Year</label>
          <input
            type="number"
            placeholder="Year"
            value={periodYear ?? ""}
            onChange={(e) => { setPeriodYear(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className="input-field font-ui w-28"
            min={2000}
            max={2100}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Return Type</label>
          <select
            value={returnType}
            onChange={(e) => { setReturnType(e.target.value as (typeof returnTypes)[number]); setPage(1); }}
            className="input-field font-ui"
          >
            {returnTypes.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All Return Types" : t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Status</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as (typeof statuses)[number]); setPage(1); }}
            className="input-field font-ui"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Return #</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Type</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Period</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Due Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Liability</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">ITC</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Payable</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Filed Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center font-ui text-light">Loading GST returns...</td>
              </tr>
            ) : filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center font-ui text-light">No GST returns yet</td>
              </tr>
            ) : (
              filteredReturns.map((ret) => {
                const statusConf = statusConfig[ret.status] ?? { label: ret.status, variant: "gray" as const };
                return (
                  <tr key={ret.id} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/gst/returns/${ret.taxPeriodYear}-${ret.taxPeriodMonth}`} className="font-mono text-[13px] text-amber hover:underline">
                        {ret.returnNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-ui text-[13px] text-dark uppercase">{ret.returnType}</span>
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-mid">
                      {months.find((m) => m.value === Number(ret.taxPeriodMonth))?.label} {ret.taxPeriodYear}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-light">{ret.dueDate}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-right text-dark">{formatIndianNumber(Number(ret.totalTaxPayable))}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-right text-dark">{formatIndianNumber(Number(ret.totalEligibleItc))}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-right text-dark">{formatIndianNumber(Number(ret.totalTaxPaid))}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-light">{ret.filingDate ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {ret.status === "draft" && (
                          <button onClick={() => handleGenerate(Number(ret.taxPeriodMonth), Number(ret.taxPeriodYear), ret.returnType)} className="font-ui text-[12px] text-amber hover:underline">
                            Generate
                          </button>
                        )}
                        <Link href={`/gst/returns/${ret.taxPeriodYear}-${ret.taxPeriodMonth}/${ret.returnType}`} className="font-ui text-[12px] text-mid hover:underline">
                          View
                        </Link>
                        {ret.status === "generated" && (
                          <button onClick={() => handleFile(ret.id)} className="font-ui text-[12px] text-success hover:underline">
                            File
                          </button>
                        )}
                        {ret.status === "filed" && (
                          <button onClick={() => handleAmend(ret.id)} className="font-ui text-[12px] text-amber hover:underline">
                            Amend
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
        <div className="flex items-center justify-between text-sm font-ui text-mid">
          <span>Showing {filteredReturns.length} returns</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="filter-tab disabled:opacity-50">
              Previous
            </button>
            <span className="px-3 py-1">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={filteredReturns.length < pageSize} className="filter-tab disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
