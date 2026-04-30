"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";
import { Badge } from "@/components/ui";

export default function BalanceSheetPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");
  const [asOfDate, setAsOfDate] = useState("2027-03-31");

  const { data: balanceSheet, isLoading }: any = api.balances.balanceSheet.useQuery({
    fiscalYear,
    asOf: asOfDate,
  });

  const { data: accounts }: any = api.accounts.list.useQuery();

  if (isLoading) {
    return <div className="p-12 text-center text-light">Loading report...</div>;
  }

  const bsAccounts = accounts || [];
  
  const equityAccounts = bsAccounts.filter((a: any) => a.kind === "Equity" && a.isLeaf);
  const liabilityAccounts = bsAccounts.filter((a: any) => a.kind === "Liability" && a.isLeaf);
  const assetAccounts = bsAccounts.filter((a: any) => a.kind === "Asset" && a.isLeaf);

  const totalEquity = equityAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
  const totalAssets = assetAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
  
  const totalEquityAndLiabilities = totalEquity + totalLiabilities;
  const balances = Math.abs(totalEquityAndLiabilities - totalAssets) < 0.01;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Balance Sheet</h1>
          <p className="font-ui-sm text-text-mid">Statement of Financial Position</p>
        </div>
        <div className="flex gap-2">
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="border-[0.5px] border-border-subtle px-4 py-2 text-ui-sm outline-none bg-white"
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="border-[0.5px] border-border-subtle px-4 py-2 text-ui-sm outline-none bg-white"
          />
          <button className="px-4 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <Icon name="download" className="text-[18px]" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white border-[0.5px] border-border-subtle rounded-lg p-12 shadow-sm max-w-[1200px] mx-auto">
        <div className="text-center mb-10 pb-8 border-b-[0.5px] border-border-subtle">
          <h2 className="font-display text-[26px] font-normal text-dark mb-1">Mehta Textiles Private Limited</h2>
          <p className="font-ui text-ui-lg text-text-mid uppercase tracking-widest mb-2">Balance Sheet</p>
          <p className="font-ui text-ui-sm text-text-light italic">As of {new Date(asOfDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} • All amounts in ₹</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Equity & Liabilities */}
          <div className="space-y-8">
            <div>
              <div className="bg-surface-muted px-4 py-2 border-t-2 border-amber mb-4">
                <h3 className="font-display text-display-sm font-normal text-dark uppercase tracking-wider">Equity & Liabilities</h3>
              </div>
              
              <div className="mb-6">
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-text-light font-bold mb-2">Equity</div>
                {equityAccounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted transition-colors text-ui-sm">
                    <span className="font-ui text-dark">{account.name}</span>
                    <span className="font-mono text-[13px] text-on-surface">
                      {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-hairline mt-1 pt-2 text-ui-sm">
                  <span>Sub-total Equity</span>
                  <span className="font-mono text-[13px]">{formatIndianNumber(totalEquity)}</span>
                </div>
              </div>

              <div>
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-text-light font-bold mb-2">Liabilities</div>
                {liabilityAccounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted transition-colors text-ui-sm">
                    <span className="font-ui text-dark">{account.name}</span>
                    <span className="font-mono text-[13px] text-on-surface">
                      {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-hairline mt-1 pt-2 text-ui-sm">
                  <span>Sub-total Liabilities</span>
                  <span className="font-mono text-[13px]">{formatIndianNumber(totalLiabilities)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-stone-50 py-3">
              <span className="uppercase tracking-widest text-xs">Total Equity & Liabilities</span>
              <span className="font-mono text-[15px]">
                ₹ {formatIndianNumber(totalEquityAndLiabilities)}
              </span>
            </div>
          </div>

          {/* Assets */}
          <div className="space-y-8">
            <div>
              <div className="bg-surface-muted px-4 py-2 border-t-2 border-amber mb-4">
                <h3 className="font-display text-display-sm font-normal text-dark uppercase tracking-wider">Assets</h3>
              </div>
              
              <div className="mb-6">
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-text-light font-bold mb-2">Current & Non-Current Assets</div>
                {assetAccounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted transition-colors text-ui-sm">
                    <span className="font-ui text-dark">{account.name}</span>
                    <span className="font-mono text-[13px] text-on-surface">
                      {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-stone-50 py-3">
                <span className="uppercase tracking-widest text-xs">Total Assets</span>
                <span className="font-mono text-[15px]">
                  ₹ {formatIndianNumber(totalAssets)}
                </span>
              </div>
              
              {balances ? (
                <div className="mt-4 px-4 py-2 bg-success-bg text-success text-[10px] uppercase font-bold tracking-widest text-center rounded">
                  ✓ Statement is Balanced
                </div>
              ) : (
                <div className="mt-4 px-4 py-2 bg-danger-bg text-danger text-[10px] uppercase font-bold tracking-widest text-center rounded">
                  ✗ Out of Balance by ₹ {formatIndianNumber(Math.abs(totalEquityAndLiabilities - totalAssets))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t-[0.5px] border-border-subtle text-center">
          <p className="font-ui-xs text-text-light">This is a system-generated financial statement. E&OE.</p>
        </div>
      </div>
    </div>
  );
}
