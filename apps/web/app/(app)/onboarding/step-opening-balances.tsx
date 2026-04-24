// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState, useMemo } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";

interface OpeningBalance {
  accountId: string;
  accountCode: string;
  name: string;
  kind: string;
  openingBalance: number;
}

interface StepOpeningBalancesProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepOpeningBalances({ tenantId, onComplete }: StepOpeningBalancesProps) {
  const [mode, setMode] = useState<"fresh_start" | "migration">("fresh_start");
  const [balances, setBalances] = useState<OpeningBalance[]>([]);

  const { data: accounts } = api.accounts.list.useQuery(undefined, {
    enabled: mode === "migration",
  });

  const setupOpeningBalances = api.onboarding.setupOpeningBalances.useMutation({
    onSuccess: () => {
      showToast.success('Opening balances set up successfully');
      onComplete();
    },
    onError: (error) => {
      showToast.error(error.message || 'Failed to set up opening balances');
    },
  });

  const { totalDebits, totalCredits, difference } = useMemo(() => {
    const debits = balances
      .filter((b) => ["Asset", "Expense"].includes(b.kind))
      .reduce((sum, b) => sum + Math.abs(b.openingBalance), 0);
    const credits = balances
      .filter((b) => ["Liability", "Equity", "Revenue"].includes(b.kind))
      .reduce((sum, b) => sum + Math.abs(b.openingBalance), 0);
    return {
      totalDebits: debits,
      totalCredits: credits,
      difference: Math.abs(debits - credits),
    };
  }, [balances]);

  const handleContinue = async () => {
    if (mode === "fresh_start") {
      await setupOpeningBalances.mutateAsync({
        tenantId,
        fiscalYear: "2026-27",
        input: { mode: "fresh_start", balances: [] },
      });
    } else {
      if (difference !== 0) return;
      await setupOpeningBalances.mutateAsync({
        tenantId,
        fiscalYear: "2026-27",
        input: { mode: "migration", balances },
      });
    }
  };

  if (mode === "fresh_start") {
    return (
      <div>
        <div className="mb-8">
          <h2 className="font-display text-[20px] font-normal text-dark">Opening Balances</h2>
          <p className="font-ui text-[13px] text-light mt-1">
            Are you starting fresh or migrating from another system?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="card p-5 cursor-pointer border-amber bg-surface-muted"
            onClick={() => setMode("fresh_start")}
          >
            <h3 className="font-ui text-[15px] font-medium text-dark mb-2">Fresh Start</h3>
            <p className="font-ui text-[12px] text-light">
              New business with no prior transactions. Start with zero balances.
            </p>
          </div>

          <div
            className="card p-5 cursor-pointer hover:border-lighter"
            onClick={() => setMode("migration")}
          >
            <h3 className="font-ui text-[15px] font-medium text-dark mb-2">Migration</h3>
            <p className="font-ui text-[12px] text-light">
              Moving from another system. Enter your opening balances.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end pt-6 border-t border-hairline">
          <button
            onClick={handleContinue}
            disabled={setupOpeningBalances.isPending}
            className="filter-tab active disabled:opacity-50"
          >
            {setupOpeningBalances.isPending ? "Setting up..." : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-[20px] font-normal text-dark">Enter Opening Balances</h2>
        <p className="font-ui text-[13px] text-light mt-1">
          Enter balances as of the fiscal year start date
        </p>
      </div>

      {accounts && accounts.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-auto">
          {accounts
            .filter((a: any) => a.isLeaf)
            .slice(0, 20)
            .map((account: any) => (
              <div key={account.id} className="flex items-center gap-4 card p-4">
                <div className="flex-1">
                  <Label htmlFor={`balance-${account.id}`} className="font-ui text-[13px] text-dark block">
                    {account.name}
                  </Label>
                  <p className="font-mono text-[11px] text-light">{account.code}</p>
                </div>
                <input
                  id={`balance-${account.id}`}
                  type="number"
                  placeholder="0.00"
                  className="input-field w-32 font-mono text-right"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setBalances((prev) => {
                      const exists = prev.find((b) => b.accountId === account.id);
                      if (exists) {
                        return prev.map((b) =>
                          b.accountId === account.id ? { ...b, openingBalance: value } : b
                        );
                      }
                      return [
                        ...prev,
                        {
                          accountId: account.id,
                          accountCode: account.code,
                          name: account.name,
                          kind: account.kind,
                          openingBalance: value,
                        },
                      ];
                    });
                  }}
                />
              </div>
            ))}
        </div>
      )}

      {balances.length > 0 && (
        <div className="card bg-surface-muted p-5 mt-6">
          <div className="space-y-2">
            <div className="flex justify-between font-ui text-[13px]">
              <span className="text-light">Total Debits</span>
              <span className="font-mono text-dark">{formatIndianNumber(totalDebits)}</span>
            </div>
            <div className="flex justify-between font-ui text-[13px]">
              <span className="text-light">Total Credits</span>
              <span className="font-mono text-dark">{formatIndianNumber(totalCredits)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-hairline flex justify-between font-ui text-[13px]">
              <span className="text-light">Difference</span>
              <span className={`font-mono font-semibold ${difference === 0 ? "text-success" : "text-danger"}`}>
                {formatIndianNumber(difference)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end pt-6 border-t border-hairline">
        <button
          onClick={handleContinue}
          disabled={setupOpeningBalances.isPending || (mode === "migration" && difference !== 0)}
          className={`filter-tab active disabled:opacity-50`}
        >
          {setupOpeningBalances.isPending
            ? "Setting up..."
            : mode === "fresh_start"
            ? "Start with Zero Balances"
            : difference === 0
            ? "Complete Setup"
            : "Balance Required"}
        </button>
      </div>
    </div>
  );
}
