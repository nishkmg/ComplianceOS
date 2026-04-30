"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";

interface ReportLine {
  note: string;
  label: string;
  currentYear: number;
  previousYear: number;
  isTotal?: boolean;
  isSection?: boolean;
  indent?: number;
}

const sections: { title: string; lines: ReportLine[] }[] = [
  {
    title: "I. Revenue From Operations",
    lines: [
      { note: "1", label: "Revenue from operations", currentYear: 856.4, previousYear: 724.8 },
      { note: "2", label: "Other income", currentYear: 24.6, previousYear: 18.2 },
      { note: "", label: "Total Revenue (I+II)", currentYear: 881.0, previousYear: 743.0, isTotal: true },
    ],
  },
  {
    title: "II. Expenses",
    lines: [
      { note: "3", label: "Cost of materials consumed", currentYear: 412.3, previousYear: 356.8 },
      { note: "4", label: "Employee benefits expense", currentYear: 124.5, previousYear: 108.2 },
      { note: "5", label: "Finance costs", currentYear: 18.5, previousYear: 15.2 },
      { note: "6", label: "Depreciation", currentYear: 24.8, previousYear: 22.1 },
      { note: "7", label: "Other expenses", currentYear: 86.3, previousYear: 72.4 },
      { note: "", label: "Total Expenses", currentYear: 666.4, previousYear: 574.7, isTotal: true },
    ],
  },
  {
    title: "III. Profit Before Tax",
    lines: [
      { note: "", label: "Profit Before Tax (I - II)", currentYear: 214.6, previousYear: 168.3, isTotal: true },
      { note: "8", label: "Tax expense", currentYear: 54.2, previousYear: 42.5 },
      { note: "", label: "Profit for the year", currentYear: 160.4, previousYear: 125.8, isSection: true },
    ],
  },
];

export default function PLScheduleIIIPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  return (
    <div className="bg-page-bg text-on-surface font-ui-md min-h-screen">
      <main className="flex-1 pb-space-64 pt-6">
        <div className="max-w-[1000px] mx-auto px-gutter-desktop">
          {/* Report Controls */}
          <div className="flex justify-between items-end mb-gutter-wide pb-4 border-b-[0.5px] border-border-subtle text-left">
            <div>
              <span className="font-ui-xs text-amber-text uppercase tracking-widest block mb-2">Schedule III Document</span>
              <h1 className="font-display-lg text-display-lg text-on-surface">Profit & Loss</h1>
            </div>
            <div className="flex gap-3">
              <select className="border-[0.5px] border-border-subtle px-4 py-2 text-ui-sm outline-none bg-white" value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
                <option>2026-27</option>
                <option>2025-26</option>
              </select>
              <button className="px-4 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
                <Icon name="download" className="text-[18px]" />
                Export
              </button>
            </div>
          </div>

          {/* Report Container */}
          <div className="bg-white border-[0.5px] border-border-subtle p-12 shadow-sm">
            {/* Report Header */}
            <header className="text-center mb-10 pb-8 border-b-[0.5px] border-border-subtle">
              <h1 className="font-display text-[26px] font-normal text-dark mb-1">ComplianceOS</h1>
              <h2 className="font-ui-lg text-text-mid uppercase tracking-widest mb-4">Statement of Profit and Loss</h2>
              <p className="font-ui-sm text-text-light italic">For the year ended 31 March 2027</p>
              <p className="font-ui-sm text-text-light mt-1">(All amounts in ₹ Lakhs, unless otherwise stated)</p>
            </header>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-[1px] border-on-background pb-2 mb-4 font-ui-xs text-text-mid uppercase tracking-widest">
              <div className="col-span-1 text-center">Note No.</div>
              <div className="col-span-7">Particulars</div>
              <div className="col-span-2 text-right">31-Mar-2027</div>
              <div className="col-span-2 text-right text-text-light">31-Mar-2026</div>
            </div>

            {/* Sections */}
            {sections.map((section) => (
              <div key={section.title} className="mb-6">
                {/* Section Title */}
                {section.title !== section.lines[section.lines.length - 1]?.label && (
                  <div className="grid grid-cols-12 gap-4 py-3 border-b-[0.5px] border-border-subtle bg-section-muted font-ui-sm text-on-surface font-semibold uppercase tracking-wider">
                    <div className="col-span-12">{section.title}</div>
                  </div>
                )}
                {section.lines.map((line, i) => (
                  <div key={i} className={`grid grid-cols-12 gap-4 py-3 border-b-[0.5px] border-border-subtle ${
                    line.isTotal ? 'border-t-[1px] border-on-surface font-bold' : ''
                  } ${line.isSection ? 'bg-success-bg' : ''} ${line.indent ? '' : ''} hover:bg-surface-muted transition-colors ledger-row`}>
                    <div className="col-span-1 text-center font-mono text-[12px] text-text-mid">{line.note}</div>
                    <div className={`col-span-7 font-ui-sm ${line.isTotal ? 'font-bold' : ''}`}>{line.label}</div>
                    <div className="col-span-2 text-right font-mono text-sm">{line.currentYear.toFixed(1)}</div>
                    <div className="col-span-2 text-right font-mono text-sm text-text-light">{line.previousYear.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            ))}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t-[0.5px] border-border-subtle text-center">
              <p className="font-ui-xs text-text-light">This is a system-generated statement. E&OE.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
