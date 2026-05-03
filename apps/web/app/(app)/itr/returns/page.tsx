"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/lib/toast";

interface ITRReturn {
  id: string;
  financialYear: string;
  assessmentYear: string;
  formType: string;
  assesseeName: string;
  status: "draft" | "generated" | "filed" | "pending";
  filedDate?: string;
  dueDate: string;
  daysRemaining: number;
}

const mockReturns: ITRReturn[] = [
  { id: "1", financialYear: "2026-27", assessmentYear: "2027-28", formType: "ITR-3", assesseeName: "TechCorp India Pvt Ltd", status: "draft", dueDate: "31 Oct 2027", daysRemaining: 182 },
  { id: "2", financialYear: "2026-27", assessmentYear: "2027-28", formType: "ITR-4", assesseeName: "Sharma Associates", status: "generated", dueDate: "31 Jul 2027", daysRemaining: 91 },
  { id: "3", financialYear: "2025-26", assessmentYear: "2026-27", formType: "ITR-3", assesseeName: "Global Exports LLC", status: "filed", filedDate: "12 Aug 2026", dueDate: "31 Oct 2026", daysRemaining: 0 },
  { id: "4", financialYear: "2025-26", assessmentYear: "2026-27", formType: "ITR-1", assesseeName: "Rajesh Kumar", status: "pending", dueDate: "31 Jul 2026", daysRemaining: -15 },
  { id: "5", financialYear: "2024-25", assessmentYear: "2025-26", formType: "ITR-3", assesseeName: "Mehta Textiles Pvt Ltd", status: "filed", filedDate: "28 Sep 2025", dueDate: "31 Oct 2025", daysRemaining: 0 },
];

export default function ITRReturnsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "recent" | "drafts" | "archived">("all");
  const [returns, setReturns] = useState<ITRReturn[]>(mockReturns);

  const filtered = filter === "all"
    ? returns
    : filter === "recent"
    ? returns.filter(r => r.status !== "filed")
    : filter === "drafts"
    ? returns.filter(r => r.status === "draft" || r.status === "generated")
    : returns.filter(r => r.status === "filed");

  const handlePrintLedger = () => {
    window.print();
    showToast.success("Print dialog opened");
  };

  const handleExportCSV = () => {
    const rows = [["FY", "AY", "Form", "Assessee", "Status", "Due Date", "Filed Date"]];
    returns.forEach(r => {
      rows.push([r.financialYear, r.assessmentYear, r.formType, r.assesseeName, r.status, r.dueDate, r.filedDate ?? ""]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "itr-returns.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast.success("CSV exported successfully");
  };

  const handleComputeTax = () => {
    router.push("/itr/computation");
  };

  const handleFileReturn = (id: string) => {
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status: "filed" as const, filedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), daysRemaining: 0 } : r));
    showToast.success(`Return filed successfully!`);
  };

  const handleView = (id: string) => {
    router.push(`/itr/returns/${id}`);
  };

  const handleDownload = (r: ITRReturn) => {
    const json = JSON.stringify(r, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ITR-${r.formType}-${r.financialYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success("Return downloaded");
  };

  return (
    <div className="space-y-0 text-left">
      <div className="p-8 max-w-[1200px] mx-auto w-full">
        {/* Sub-Nav */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-border pb-4 gap-4 print:hidden">
          <nav className="flex gap-8 font-ui text-sm uppercase tracking-[0.15em] font-medium">
            {(["all", "recent", "drafts", "archived"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`border-none bg-transparent cursor-pointer transition-opacity pb-4 -mb-[17px] ${
                  filter === f
                    ? "text-amber border-b-2 border-amber"
                    : "text-light hover:text-dark"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </nav>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handlePrintLedger}>
              Print Ledger
            </Button>
            <Button size="sm" className="gap-2" onClick={handleExportCSV}>
              Export CSV <Icon name="download" className="text-sm" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2 print:text-black">Income Tax Department</p>
            <h1 className="font-display text-display-lg font-semibold text-dark mb-2 print:text-black">Income Tax Returns</h1>
            <p className="font-ui text-[13px] text-secondary">Manage and compute statutory filings for the current fiscal period.</p>
          </div>
          <Button size="sm" className="gap-2 group" onClick={handleComputeTax}>
            Compute Tax
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Button>
        </div>

        {/* FY Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {Array.from(new Set(returns.map(r => r.financialYear))).map(fy => {
            const fyReturns = returns.filter(r => r.financialYear === fy);
            const filedCount = fyReturns.filter(r => r.status === "filed").length;
            const pendingCount = fyReturns.filter(r => r.status !== "filed").length;
            const urgent = fyReturns.some(r => r.daysRemaining > 0 && r.daysRemaining <= 30 && r.status !== "filed");

            return (
              <Card key={fy} className="shadow-sm border border-border overflow-hidden print:border-black">
                <div className="px-6 py-4 bg-surface-muted border-b border-border flex justify-between items-center">
                  <div>
                    <p className="font-ui text-[10px] uppercase tracking-widest text-mid font-bold">Financial Year</p>
                    <p className="font-display text-xl font-semibold text-dark">{fy}</p>
                  </div>
                  {urgent && (
                    <Badge variant="danger" className="text-[10px]">Urgent</Badge>
                  )}
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-ui text-[13px] text-mid">Total Returns</span>
                    <span className="font-mono text-[13px] font-bold tabular-nums">{fyReturns.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-ui text-[13px] text-mid">Filed</span>
                    <span className="font-mono text-[13px] font-bold text-success tabular-nums">{filedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-ui text-[13px] text-mid">Pending</span>
                    <span className="font-mono text-[13px] font-bold text-amber-text tabular-nums">{pendingCount}</span>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="w-full bg-surface-muted rounded-full h-2">
                      <div
                        className="bg-amber h-2 rounded-full transition-all"
                        style={{ width: `${(filedCount / fyReturns.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Returns Table */}
        <Card className="bg-surface border border-border border-t-2 border-t-amber-text shadow-sm overflow-hidden print:border-black">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b-[0.5px] border-border bg-surface-muted font-ui text-[11px] text-mid uppercase tracking-widest text-left">
            <div className="col-span-2">FY / AY</div>
            <div className="col-span-1">Form</div>
            <div className="col-span-3">Assessee Name</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px] text-dark">
            {filtered.map((r) => (
              <div key={r.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-surface-variant transition-colors cursor-pointer group text-left">
                <div className="col-span-2">
                  <p className="font-mono text-[13px]">{r.financialYear}</p>
                  <p className="font-ui text-[10px] text-light">AY {r.assessmentYear}</p>
                </div>
                <div className="col-span-1">
                  <span className="bg-surface-muted px-2 py-1 border border-border font-ui text-[10px] tracking-wider font-bold">{r.formType}</span>
                </div>
                <div className="col-span-3 font-ui text-[13px] font-medium">{r.assesseeName}</div>
                <div className="col-span-2">
                  <span className={`font-ui text-[10px] tracking-wider border-b uppercase ${
                    r.status === 'draft' ? 'text-amber-text border-amber-text/30' :
                    r.status === 'generated' ? 'text-blue-600 border-blue-600/30' :
                    r.status === 'pending' ? 'text-danger border-danger/30' :
                    'text-mid border-transparent'
                  }`}>
                    {r.status}
                    {r.filedDate && <span className="font-mono text-light ml-1 lowercase">{r.filedDate}</span>}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="font-mono text-[12px] tabular-nums">{r.dueDate}</p>
                  {r.daysRemaining > 0 && r.status !== "filed" && (
                    <p className={`font-ui text-[10px] ${r.daysRemaining <= 30 ? 'text-danger' : 'text-light'}`}>
                      {r.daysRemaining} days left
                    </p>
                  )}
                  {r.daysRemaining <= 0 && r.status !== "filed" && (
                    <p className="font-ui text-[10px] text-danger font-bold">Overdue</p>
                  )}
                </div>
                <div className="col-span-2 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity print:opacity-100">
                  {(r.status === "draft" || r.status === "pending") && (
                    <button onClick={() => handleFileReturn(r.id)} className="text-amber hover:text-dark font-ui text-[13px] border-none bg-transparent cursor-pointer border-b-[0.5px] border-transparent hover:border-border">File</button>
                  )}
                  {r.status === "generated" && (
                    <button onClick={() => router.push(`/itr/returns/review/${r.id}`)} className="text-amber hover:text-dark font-ui text-[13px] border-none bg-transparent cursor-pointer border-b-[0.5px] border-transparent hover:border-border">Review</button>
                  )}
                  <button onClick={() => handleView(r.id)} className="text-mid hover:text-dark font-ui text-[13px] border-none bg-transparent cursor-pointer border-b-[0.5px] border-transparent hover:border-border">View</button>
                  <button onClick={() => handleDownload(r)} className="text-mid hover:text-dark font-ui text-[13px] border-none bg-transparent cursor-pointer border-b-[0.5px] border-transparent hover:border-border">Download</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t-[0.5px] border-border flex justify-between items-center text-mid font-ui text-[13px]">
            <div>Showing 1-{filtered.length} of {returns.length} records</div>
            <div className="flex gap-4">
              <button className="hover:text-dark transition-colors disabled:opacity-30 border-none bg-transparent cursor-pointer" disabled>Previous</button>
              <button className="hover:text-dark transition-colors border-none bg-transparent cursor-pointer">Next</button>
            </div>
          </div>
        </Card>

        <div className="mt-12 text-center">
          <p className="font-mono text-light text-[10px] uppercase tracking-widest">ComplianceOS ensures alignment with Income Tax Dept schema updates (v1.2.4).</p>
        </div>
      </div>
    </div>
  );
}
