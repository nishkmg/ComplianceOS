"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import { api } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";
import { formatIndianNumber } from "@/lib/format";

interface OpeningBalance {
  accountId: string;
  accountCode: string;
  name: string;
  kind: string;
  debit: number;
  credit: number;
}

interface StepOpeningBalancesProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepOpeningBalances({ tenantId, onComplete }: StepOpeningBalancesProps) {
  const [mode, setMode] = useState<"fresh_start" | "migration">("fresh_start");
  const [balances, setBalances] = useState<Record<string, { debit: number, credit: number }>>({});

  const { data: accounts }: any = api.accounts.list.useQuery(undefined, {
    enabled: mode === "migration",
  });

  const setupOpeningBalances: any = api.onboarding.setupOpeningBalances.useMutation({
    onSuccess: () => {
      showToast.success('Opening balances initialized');
      onComplete();
    },
    onError: (error) => {
      showToast.error(error.message || 'Failed to initialize balances');
    },
  });

  const totals = useMemo(() => {
    let dr = 0;
    let cr = 0;
// @ts-ignore
    Object.values(balances).forEach(b => {
      dr += b.debit;
      cr += b.credit;
    });
    return { dr, cr, diff: Math.abs(dr - cr) };
  }, [balances]);

  const handleContinue = async () => {
    if (mode === "fresh_start") {
      await setupOpeningBalances.mutateAsync({
        tenantId,
        fiscalYear: "2024-25",
        input: { mode: "fresh_start", balances: [] },
      });
    } else {
      if (totals.diff > 0.01) {
        showToast.error('Trial balance must be equal. Please ensure debits match credits.');
        return;
      }
// @ts-ignore
      const data = Object.entries(balances).map(([id, b]) => ({
        accountId: id,
        openingBalance: b.debit > 0 ? b.debit : -b.credit
      }));
      await setupOpeningBalances.mutateAsync({
        tenantId,
        fiscalYear: "2024-25",
        input: { mode: "migration", balances: data },
      });
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <h1 className="font-display text-display-xl text-on-surface mb-3">Opening Balances</h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Establish the initial financial state for this entity. You may begin with a clean slate or carry forward balances from a previous period.
        </p>
      </div>

      <div className="bg-surface border-[0.5px] border-border shadow-sm flex flex-col overflow-hidden">
        {/* Status Line */}
        <div className="h-[2px] w-full bg-amber"></div>
        
        {/* Mode 1: Fresh Start */}
        <div 
          onClick={() => setMode("fresh_start")}
          className={`p-8 border-b-[0.5px] border-border transition-colors cursor-pointer ${mode === 'fresh_start' ? 'bg-amber-50' : 'bg-surface hover:bg-surface-muted'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-1 transition-colors ${mode === 'fresh_start' ? 'bg-amber border-amber' : 'border-stone-300'}`}>
              {mode === 'fresh_start' && <Icon name="check" className="text-white text-[16px]" />}
            </div>
            <div className="flex flex-col">
              <span className={`font-ui text-lg font-bold ${mode === 'fresh_start' ? 'text-primary' : 'text-on-surface'}`}>Fresh Start</span>
              <span className="font-ui text-[13px] text-ui-sm text-text-mid mt-1">Initialize all ledgers with ₹ 0.00 balances. Recommended for new registrations.</span>
            </div>
          </div>
        </div>

        {/* Mode 2: Migration */}
        <div 
          onClick={() => setMode("migration")}
          className={`p-8 transition-colors cursor-pointer ${mode === 'migration' ? 'bg-amber-50' : 'bg-surface hover:bg-surface-muted'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-1 transition-colors ${mode === 'migration' ? 'bg-amber border-amber' : 'border-stone-300'}`}>
              {mode === 'migration' && <Icon name="check" className="text-white text-[16px]" />}
            </div>
            <div className="flex flex-col">
              <span className={`font-ui text-lg font-bold ${mode === 'migration' ? 'text-primary' : 'text-on-surface'}`}>Balance Migration</span>
              <span className="font-ui text-[13px] text-ui-sm text-text-mid mt-1">Carry forward balances from your previous software or spreadsheet.</span>
            </div>
          </div>
        </div>
      </div>

      {mode === "migration" && accounts && (
        <div className="space-y-8 animate-in">
          <div className="bg-surface border-[0.5px] border-border shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b-[0.5px] border-border">
                  <th className="py-3 px-6 font-ui text-[11px] text-text-light uppercase tracking-widest">Account / Ledger</th>
                  <th className="py-3 px-6 font-ui text-[11px] text-text-light uppercase tracking-widest text-right w-40">Debit (₹)</th>
                  <th className="py-3 px-6 font-ui text-[11px] text-text-light uppercase tracking-widest text-right w-40">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
                {(accounts as any[]).filter((a: any) => a.isLeaf).map((a: any, idx: number) => (
                  <tr key={a.id} className="hover:bg-surface-muted transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-ui text-[13px] font-bold text-on-surface">{a.name}</div>
                      <div className="text-[11px] text-text-light">{a.code} · {a.kind}</div>
                    </td>
                    <td className="py-4 px-6">
                      <input 
                        type="number" 
                        className="w-full bg-surface-muted border-[0.5px] border-border p-2 text-right outline-none focus:border-amber transition-colors rounded-md"
                        placeholder="0.00"
                        value={balances[a.id]?.debit || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setBalances(prev => ({ ...prev, [a.id]: { debit: val, credit: 0 } }));
                        }}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <input 
                        type="number" 
                        className="w-full bg-surface-muted border-[0.5px] border-border p-2 text-right outline-none focus:border-amber transition-colors rounded-md"
                        placeholder="0.00"
                        value={balances[a.id]?.credit || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setBalances(prev => ({ ...prev, [a.id]: { debit: 0, credit: val } }));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-muted font-bold border-t-2 border-on-surface">
                  <td className="py-4 px-6 font-ui text-[13px] uppercase tracking-widest">Totals</td>
                  <td className="py-4 px-6 text-right font-mono text-sm">₹ {formatIndianNumber(totals.dr)}</td>
                  <td className="py-4 px-6 text-right font-mono text-sm">₹ {formatIndianNumber(totals.cr)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={`p-6 border-[0.5px] rounded-md flex items-center justify-between ${totals.diff === 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-3">
              <Icon name={totals.diff === 0 ? 'check_circle' : 'warning'} />
              <p className="font-ui text-[13px] font-bold uppercase tracking-widest text-xs">
                {totals.diff === 0 ? 'Trial Balance in Sync' : `Out of Balance: ₹ ${formatIndianNumber(totals.diff)}`}
              </p>
            </div>
            {totals.diff > 0 && <p className="font-ui text-[11px] text-[11px]">Total debits must match total credits exactly.</p>}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
        <p className="font-ui text-[11px] text-[11px] text-text-light uppercase tracking-wider italic">
          Opening balances set here will form the Q1 starting position for FY 2024-25.
        </p>
        <button
          onClick={handleContinue}
          disabled={setupOpeningBalances.isPending || (mode === "migration" && totals.diff > 0.01)}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-30"
        >
          {setupOpeningBalances.isPending ? "Syncing Balances..." : mode === "fresh_start" ? "Finalize & Launch" : "Migrate Balances"}
          <Icon name="rocket_launch" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
