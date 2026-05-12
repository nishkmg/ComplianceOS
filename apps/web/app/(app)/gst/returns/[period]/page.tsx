"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/lib/toast";

const months = [
  { value: 1, label: "April" }, { value: 2, label: "May" }, { value: 3, label: "June" },
  { value: 4, label: "July" }, { value: 5, label: "August" }, { value: 6, label: "September" },
  { value: 7, label: "October" }, { value: 8, label: "November" }, { value: 9, label: "December" },
  { value: 10, label: "January" }, { value: 11, label: "February" }, { value: 12, label: "March" },
];

export default function GSTReturnDetailPage() {
  const params = useParams();
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);
  const [activeTab, setActiveTab] = useState<"gstr1" | "gstr2b" | "gstr3b">("gstr1");
  const [generating, setGenerating] = useState(false);

  const handleGenerateAll = async () => {
    setGenerating(true);
    showToast.loading("Generating all returns…");
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(false);
    showToast.success("All returns generated successfully.");
  };

  const handleFileReturn = async () => {
    const arn = prompt("Enter ARN (Acknowledgement Reference Number):");
    if (!arn) return;
    showToast.success("Return filed successfully.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-lg font-semibold text-dark">GST Return - {months.find((m) => m.value === month)?.label} {year}</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">Tax Period: {months.find((m) => m.value === month)?.label} {year}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerateAll} disabled={generating} className="px-4 py-2 border border-border text-dark font-ui text-[12px] font-bold uppercase tracking-widest rounded-md hover:bg-surface-muted transition-colors cursor-pointer bg-transparent">
            {generating ? "Generating…" : "Generate All"}
          </button>
          <button onClick={() => handleFileReturn()} className="px-4 py-2 bg-success text-white font-ui text-[12px] font-bold uppercase tracking-widest rounded-md hover:bg-success/90 transition-colors cursor-pointer border-none shadow-sm">
            File Return
          </button>
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-4">
          {[{ id: "gstr1" as const, label: "GSTR-1" }, { id: "gstr2b" as const, label: "GSTR-2B" }, { id: "gstr3b" as const, label: "GSTR-3B" }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`font-ui text-[13px] px-4 py-3 border-b-2 transition-colors bg-transparent cursor-pointer ${activeTab === tab.id ? "border-amber text-amber font-medium" : "border-transparent text-light hover:text-dark"}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-5 rounded-md">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Turnover</p>
          <p className="font-mono text-[22px] font-medium text-dark">₹ 12,45,600</p>
          <p className="font-ui text-[11px] text-light mt-1">Outward Supplies</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-md">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Tax Liability</p>
          <p className="font-mono text-[22px] font-medium text-dark">₹ 2,24,208</p>
          <p className="font-ui text-[11px] text-light mt-1">Total Tax</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-md">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">ITC Available</p>
          <p className="font-mono text-[22px] font-medium text-dark">₹ 1,26,500</p>
          <p className="font-ui text-[11px] text-light mt-1">Input Tax Credit</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-md">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Net Payable</p>
          <p className="font-mono text-[22px] font-medium text-dark">₹ 97,708</p>
          <p className="font-ui text-[11px] text-light mt-1">After ITC</p>
        </div>
      </div>

      <div className="bg-surface border border-border p-5 rounded-md">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Return Summary</h2>
        <p className="font-ui text-[13px] text-light">Generate returns to see detailed summary.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href={`/gst/returns/${params.period}/gstr1`} className={`bg-surface border border-border p-5 rounded-md hover:shadow-md transition ${activeTab === "gstr1" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">GSTR-1</h3>
          <p className="font-ui text-[12px] text-light">Outward supplies details</p>
          <p className="font-ui text-[11px] text-success mt-2">Generate →</p>
        </Link>
        <Link href={`/gst/returns/${params.period}/gstr2b`} className={`bg-surface border border-border p-5 rounded-md hover:shadow-md transition ${activeTab === "gstr2b" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">GSTR-2B</h3>
          <p className="font-ui text-[12px] text-light">Input tax credit details</p>
          <p className="font-ui text-[11px] text-success mt-2">Generate →</p>
        </Link>
        <Link href={`/gst/returns/${params.period}/gstr3b`} className={`bg-surface border border-border p-5 rounded-md hover:shadow-md transition ${activeTab === "gstr3b" ? "ring-2 ring-amber" : ""}`}>
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">GSTR-3B</h3>
          <p className="font-ui text-[12px] text-light">Summary return</p>
          <p className="font-ui text-[11px] text-success mt-2">Generate →</p>
        </Link>
      </div>
    </div>
  );
}
