"use client";

import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

// ─── Mock data — Schedule III format ──────────────────────────────────────────

const revenueItems = [
  { label: "Revenue from Operations", amount: 12450000, note: "1" },
  { label: "Other Income", amount: 24600, note: "2" },
];

const expenseItems = [
  { label: "Cost of Materials Consumed", amount: 8240000, note: "3" },
  { label: "Changes in Inventories of FG, WIP & Stock-in-Trade", amount: -400000, note: "4" },
  { label: "Employee Benefits Expense", amount: 1245000, note: "5" },
  { label: "Finance Costs", amount: 18500, note: "6" },
  { label: "Depreciation and Amortisation Expense", amount: 248000, note: "7" },
  { label: "Other Expenses", amount: 570000, note: "8" },
];

const totalRevenue = revenueItems.reduce((s, i) => s + i.amount, 0);
const totalExpenses = expenseItems.reduce((s, i) => s + i.amount, 0);
const netProfit = totalRevenue - totalExpenses;
const isProfit = netProfit >= 0;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ProfitLossPage() {
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">
            Financial Performance
          </p>
          <h1 className="font-display text-2xl font-semibold text-dark">Profit & Loss Account</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">Schedule III — Section 129 of Companies Act, 2013</p>
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
            href="/audit-log?report=pl"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 disabled:pointer-events-none disabled:opacity-50 border border-border bg-surface text-dark shadow-sm hover:bg-surface-muted hover:text-amber hover:border-amber h-9 px-3 no-underline"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report paper */}
      <Card className="bg-surface border border-border shadow-sm rounded-md max-w-[1100px] mx-auto print:shadow-none print:border-black">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border print:border-black">
          <h2 className="font-display text-[24px] text-dark print:text-black">Mehta Textiles Private Limited</h2>
          <p className="font-ui text-[12px] text-mid mt-1 uppercase tracking-widest">Statement of Profit and Loss</p>
          <p className="font-mono text-[11px] text-light mt-0.5 italic">For the year ended 31 March 2027 · FY {fiscalYear}</p>
        </div>

        <CardContent className="p-8 space-y-8">
          {/* Revenue Section */}
          <section>
            <div className="px-4 py-2 border-t-2 border-amber mb-0 print:border-black">
              <h3 className="font-display text-display-sm text-dark uppercase tracking-wider print:text-black">I. Revenue</h3>
            </div>
            <div className="divide-y-[0.5px] divide-border-subtle">
              {revenueItems.map(item => (
                <div key={item.label} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="col-span-7 font-ui text-[13px] text-dark">{item.label}</div>
                  <div className="col-span-1 font-mono text-[10px] text-light text-center">{item.note}</div>
                  <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-light">
                    {/* Previous period placeholder */}
                  </div>
                  <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-dark font-medium">
                    ₹ {formatIndianNumber(item.amount)}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-surface-muted font-bold border-t border-border">
                <div className="col-span-8 font-ui text-[11px] uppercase tracking-widest text-dark print:text-black">Total Revenue</div>
                <div className="col-span-2" />
                <div className="col-span-2 text-right font-mono text-[14px] tabular-nums text-dark print:text-black">
                  ₹ {formatIndianNumber(totalRevenue)}
                </div>
              </div>
            </div>
          </section>

          {/* Expenses Section */}
          <section>
            <div className="px-4 py-2 border-t-2 border-amber mb-0 print:border-black">
              <h3 className="font-display text-display-sm text-dark uppercase tracking-wider print:text-black">II. Expenses</h3>
            </div>
            <div className="divide-y-[0.5px] divide-border-subtle">
              {expenseItems.map(item => (
                <div key={item.label} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="col-span-7 font-ui text-[13px] text-dark">{item.label}</div>
                  <div className="col-span-1 font-mono text-[10px] text-light text-center">{item.note}</div>
                  <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-light">
                    {/* Previous period placeholder */}
                  </div>
                  <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-dark font-medium">
                    ₹ {formatIndianNumber(Math.abs(item.amount))}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-surface-muted font-bold border-t border-border">
                <div className="col-span-8 font-ui text-[11px] uppercase tracking-widest text-dark print:text-black">Total Expenses</div>
                <div className="col-span-2" />
                <div className="col-span-2 text-right font-mono text-[14px] tabular-nums text-dark print:text-black">
                  ₹ {formatIndianNumber(totalExpenses)}
                </div>
              </div>
            </div>
          </section>

          {/* Net Result */}
          <div className={`mt-8 px-8 py-6 flex justify-between items-center rounded-md print:rounded-none print:border-2 ${
            isProfit
              ? "bg-success-bg text-success border border-success/30 print:bg-transparent print:text-black print:border-black"
              : "bg-danger-bg text-danger border border-danger/30 print:bg-transparent print:text-black print:border-black"
          }`}>
            <div>
              <h4 className={`font-ui text-[13px] font-bold uppercase tracking-widest ${isProfit ? "text-success" : "text-danger"} print:text-black`}>
                {isProfit ? "Net Profit for the Period" : "Net Loss for the Period"}
              </h4>
              <p className="text-light text-[10px] mt-0.5 uppercase tracking-widest print:text-mid">
                Transfer to Balance Sheet — Reserves & Surplus
              </p>
            </div>
            <p className={`font-mono text-2xl font-bold tabular-nums ${isProfit ? "text-success" : "text-danger"} print:text-black`}>
              ₹ {formatIndianNumber(Math.abs(netProfit))}
            </p>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-[10px] text-light">System generated · Schedule III compliant · E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
