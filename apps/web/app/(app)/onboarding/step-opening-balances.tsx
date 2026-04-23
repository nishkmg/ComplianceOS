"use client";

import { useState, useMemo } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatIndianNumber } from "@/lib/format";

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
    onSuccess: onComplete,
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Opening Balances</h2>
          <p className="mt-1 text-sm text-gray-600">
            Are you starting fresh or migrating from another system?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer border-amber-500 bg-amber-50"
            onClick={() => setMode("fresh_start")}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold">Fresh Start</h3>
              <p className="mt-2 text-sm text-gray-600">
                New business with no prior transactions. Start with zero balances.
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-gray-300"
            onClick={() => setMode("migration")}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold">Migration</h3>
              <p className="mt-2 text-sm text-gray-600">
                Moving from another system. Enter your opening balances.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleContinue} disabled={setupOpeningBalances.isPending}>
            {setupOpeningBalances.isPending ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Enter Opening Balances</h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter balances as of the fiscal year start date
        </p>
      </div>

      {accounts && accounts.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-auto">
          {accounts
            .filter((a: any) => a.isLeaf)
            .slice(0, 20)
            .map((account: any) => (
              <div key={account.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.code}</p>
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="w-32"
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
        <Card className="mt-6 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm">
              <span>Total Debits:</span>
              <span className="font-medium">{formatIndianNumber(totalDebits)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Credits:</span>
              <span className="font-medium">{formatIndianNumber(totalCredits)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2">
              <span>Difference:</span>
              <span
                className={`font-semibold ${
                  difference === 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatIndianNumber(difference)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={setupOpeningBalances.isPending || (mode === "migration" && difference !== 0)}
        >
          {setupOpeningBalances.isPending
            ? "Setting up..."
            : mode === "fresh_start"
            ? "Start with Zero Balances"
            : difference === 0
            ? "Complete Setup"
            : "Balance Required"}
        </Button>
      </div>
    </div>
  );
}
