"use client";

import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

// ─── Mock data ────────────────────────────────────────────────────────────────

interface CfItem { label: string; amount: number }
interface CfSection { title: string; items: CfItem[]; total: number }

const cfDataByFy: Record<string, { sections: CfSection[]; openingCash: number }> = {
  '2026-27': {
    sections: [
      {
        title: "A. Cash Flow from Operating Activities",
        items: [
          { label: "Profit Before Tax",                    amount: 2146000 },
          { label: "Adjustments for Depreciation",          amount: 248000 },
          { label: "Interest Income",                       amount: -24600 },
          { label: "Working Capital Changes",               amount: -452000 },
        ],
        total: 1917400,
      },
      {
        title: "B. Cash Flow from Investing Activities",
        items: [
          { label: "Purchase of Property, Plant & Equipment", amount: -450000 },
          { label: "Proceeds from Sale of Investments",     amount: 125000 },
          { label: "Interest Received",                     amount: 24600 },
        ],
        total: -300400,
      },
      {
        title: "C. Cash Flow from Financing Activities",
        items: [
          { label: "Repayment of Long-term Borrowings",     amount: -250000 },
          { label: "Interest Paid",                         amount: -18500 },
          { label: "Dividends Paid",                        amount: -100000 },
        ],
        total: -368500,
      },
    ],
    openingCash: 4876390,
  },
  '2025-26': {
    sections: [
      {
        title: "A. Cash Flow from Operating Activities",
        items: [
          { label: "Profit Before Tax",                    amount: 1683000 },
          { label: "Adjustments for Depreciation",          amount: 220000 },
          { label: "Interest Income",                       amount: -18200 },
          { label: "Working Capital Changes",               amount: -380000 },
        ],
        total: 1483800,
      },
      {
        title: "B. Cash Flow from Investing Activities",
        items: [
          { label: "Purchase of Property, Plant & Equipment", amount: -350000 },
          { label: "Proceeds from Sale of Investments",     amount: 98000 },
          { label: "Interest Received",                     amount: 18200 },
        ],
        total: -233800,
      },
      {
        title: "C. Cash Flow from Financing Activities",
        items: [
          { label: "Repayment of Long-term Borrowings",     amount: -200000 },
          { label: "Interest Paid",                         amount: -15000 },
          { label: "Dividends Paid",                        amount: -80000 },
        ],
        total: -295000,
      },
    ],
    openingCash: 4120000,
  },
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CashFlowPage() {
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();
  const fyCf = cfDataByFy[fiscalYear] ?? cfDataByFy['2026-27'];
  const sections = fyCf.sections;
  const netChange = sections.reduce((s, sec) => s + sec.total, 0);
  const openingCash = fyCf.openingCash;
  const closingCash = openingCash + netChange;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">
            Financial Report
          </p>
          <h1 className="font-display text-2xl font-semibold text-dark">Statement of Cash Flows</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">For the year ended March 31, 2027 (Indirect Method)</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="bg-surface border border-border px-3 py-1.5 text-[12px] font-ui outline-none rounded-md"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Icon name="print" size={14} /> Print
          </Button>
          <Link
            href="/audit-log?report=cash-flow"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 disabled:pointer-events-none disabled:opacity-50 border border-border bg-surface text-dark shadow-sm hover:bg-surface-muted hover:text-amber hover:border-amber h-9 px-3 no-underline"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report card */}
      <Card className="bg-surface border border-border shadow-sm rounded-md max-w-[1100px] mx-auto print:shadow-none print:border-black">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border print:border-black">
          <h2 className="font-display text-[24px] text-dark mb-1 print:text-black">Mehta Textiles Private Limited</h2>
          <p className="font-ui text-[12px] text-mid uppercase tracking-widest mb-1">Cash Flow Statement</p>
          <p className="font-mono text-[11px] text-light italic">For the year ended 31 March 2027 · FY {fiscalYear}</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-4 px-8 pt-6 pb-2 border-b border-dark font-ui text-[10px] text-light uppercase tracking-widest print:border-black">
          <div className="col-span-8">Particulars</div>
          <div className="col-span-2 text-right">Current Period (₹)</div>
          <div className="col-span-2 text-right text-light/60">Previous Period (₹)</div>
        </div>

        {/* Sections */}
        <CardContent className="p-8 space-y-10">
          {sections.map(section => (
            <div key={section.title}>
              <div className="px-4 py-2 border-t-2 border-amber mb-0 print:border-black">
                <h3 className="font-display text-display-sm text-dark uppercase tracking-wider print:text-black">{section.title}</h3>
              </div>
              <div className="divide-y-[0.5px] divide-border-subtle">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-surface-muted/50 transition-colors"
                  >
                    <div className="col-span-8 font-ui text-[13px] text-dark pl-4">{item.label}</div>
                    <div className={`col-span-2 text-right font-mono text-[13px] tabular-nums ${
                      item.amount < 0 ? 'text-danger' : 'text-dark'
                    } print:text-black`}>
                      {item.amount < 0
                        ? `(${formatIndianNumber(Math.abs(item.amount))})`
                        : formatIndianNumber(item.amount)}
                    </div>
                    <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-light">
                      {formatIndianNumber(Math.abs(Math.round(item.amount * 0.85)))}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-12 gap-4 items-center py-3 bg-surface-muted font-semibold border-t border-border">
                  <div className="col-span-8 font-ui text-[11px] uppercase tracking-wider text-dark print:text-black">
                    Net Cash from {section.title.split(" ").slice(2, 4).join(" ")}
                  </div>
                  <div className={`col-span-2 text-right font-mono text-[13px] tabular-nums ${
                    section.total < 0 ? 'text-danger' : 'text-dark'
                  } print:text-black`}>
                    {section.total < 0
                      ? `(${formatIndianNumber(Math.abs(section.total))})`
                      : formatIndianNumber(section.total)}
                  </div>
                  <div className="col-span-2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Consolidation */}
        <div className="mx-8 mb-8 space-y-4">
          <div className="grid grid-cols-12 gap-4 items-center py-3 border-t-2 border-dark print:border-black">
            <div className="col-span-8 font-ui text-[11px] uppercase tracking-widest font-bold text-dark print:text-black">
              Net Increase / (Decrease) in Cash & Cash Equivalents
            </div>
            <div className={`col-span-2 text-right font-mono text-[14px] tabular-nums font-bold ${
              netChange < 0 ? 'text-danger' : 'text-dark'
            } print:text-black`}>
              {netChange < 0
                ? `(${formatIndianNumber(Math.abs(netChange))})`
                : formatIndianNumber(netChange)}
            </div>
            <div className="col-span-2" />
          </div>

          <div className="grid grid-cols-12 gap-4 items-center py-3 border-t border-border print:border-black">
            <div className="col-span-8 font-ui text-[11px] uppercase tracking-widest text-mid print:text-black">Cash & Cash Equivalents at Beginning of Period</div>
            <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-dark print:text-black">{formatIndianNumber(openingCash)}</div>
            <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-light">{formatIndianNumber(Math.round(openingCash * 0.92))}</div>
          </div>

          <div className="bg-surface-muted px-6 py-5 flex justify-between items-center border-t-2 border-dark rounded-md print:bg-transparent print:border-black print:rounded-none">
            <div>
              <span className="font-ui text-[13px] font-bold text-dark uppercase tracking-widest print:text-black">
                Cash & Cash Equivalents at End of Period
              </span>
            </div>
            <span className="font-mono text-2xl font-bold text-dark tabular-nums print:text-black">
              ₹ {formatIndianNumber(closingCash)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-[10px] text-light">Prepared in accordance with AS-3 (Indirect Method). E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
