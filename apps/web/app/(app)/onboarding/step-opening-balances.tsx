"use client";

import { useState, useEffect, useCallback } from "react";
import type { AccountKind, OpeningBalanceEntry } from "@complianceos/shared";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  code: string;
  name: string;
  kind: AccountKind;
  subType: string;
  isLeaf: boolean;
}

interface BalanceEntry {
  accountId: string;
  accountCode: string;
  name: string;
  kind: AccountKind;
  drCr: "dr" | "cr";
  amount: string; // string for input state
}

interface GroupedAccounts {
  Asset: BalanceEntry[];
  Liability: BalanceEntry[];
  Equity: BalanceEntry[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BS_KINDS = ["Asset", "Liability", "Equity"] as const;
type BSkind = typeof BS_KINDS[number];

const GROUP_LABELS: Record<AccountKind, { label: string; column: "dr" | "cr" }> = {
  Asset: { label: "Assets", column: "dr" },
  Liability: { label: "Liabilities", column: "cr" },
  Equity: { label: "Equity", column: "cr" },
  Revenue: { label: "Revenue", column: "cr" },
  Expense: { label: "Expenses", column: "dr" },
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch("/api/trpc/accounts.list");
  if (!response.ok) throw new Error(`Failed to fetch accounts: ${response.statusText}`);
  const json = await response.json();
  const all: Account[] = json.result?.data ?? [];
  return all.filter((a) => a.isLeaf && (BS_KINDS as readonly string[]).includes(a.kind));
}

async function fetchSetupOpeningBalances(input: {
  tenantId: string;
  fiscalYear: string;
  input: { mode: "fresh_start" | "migration"; balances: OpeningBalanceEntry[] };
}): Promise<void> {
  const response = await fetch("/api/trpc/onboarding.setupOpeningBalances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) throw new Error(`Setup opening balances failed: ${response.statusText}`);
}

async function fetchSaveProgress(input: {
  tenantId: string;
  step: number;
  data: Record<string, unknown>;
}): Promise<void> {
  const response = await fetch("/api/trpc/onboarding.saveProgress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) throw new Error(`Save failed: ${response.statusText}`);
}

async function fetchCompleteOnboarding(input: { tenantId: string }): Promise<void> {
  const response = await fetch("/api/trpc/onboarding.completeOnboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) throw new Error(`Complete onboarding failed: ${response.statusText}`);
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatINR(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "₹0.00";
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseINR(value: string): number {
  return parseFloat(value.replace(/₹|,/g, "")) || 0;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface OpeningBalancesStepProps {
  onComplete: () => void;
  onBack: () => void;
  savedData?: Record<string, unknown>;
  tenantId?: string;
}

export default function OpeningBalancesStep({
  onComplete,
  onBack,
  savedData,
  tenantId,
}: OpeningBalancesStepProps) {
  const [mode, setMode] = useState<"fresh_start" | "migration">("fresh_start");
  const [groupedAccounts, setGroupedAccounts] = useState<GroupedAccounts>({
    Asset: [],
    Liability: [],
    Equity: [],
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentFY] = useState("2026-27"); // Indian FY

  // Load accounts on mount
  useEffect(() => {
    async function loadAccounts() {
      setIsFetchingAccounts(true);
      try {
        const accounts = await fetchAccounts();

        // Restore saved balances if resuming
        const savedBalances = (
          (savedData?.openingBalances as { balances?: OpeningBalanceEntry[] } | undefined)
        )?.balances;

        const grouped: GroupedAccounts = { Asset: [], Liability: [], Equity: [] };

        for (const account of accounts) {
          const saved = savedBalances?.find((b) => b.accountId === account.id);
          const balanceEntry: BalanceEntry = {
            accountId: account.id,
            accountCode: account.code,
            name: account.name,
            kind: account.kind as AccountKind,
            drCr: saved
              ? saved.openingBalance < 0
                ? "cr"
                : "dr"
              : GROUP_LABELS[account.kind as AccountKind].column,
            amount: saved ? String(Math.abs(saved.openingBalance)) : "",
          };
          grouped[account.kind as BSkind].push(balanceEntry);
        }

        setGroupedAccounts(grouped);
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Failed to load accounts");
      } finally {
        setIsFetchingAccounts(false);
      }
    }

    if (mode === "migration") {
      loadAccounts();
    }
  }, [mode, savedData]);

  // Restore saved mode
  useEffect(() => {
    const saved = savedData?.openingBalances as { mode?: "fresh_start" | "migration" } | undefined;
    if (saved?.mode) {
      setMode(saved.mode);
    }
  }, [savedData]);

  // Compute totals
  const computeTotals = useCallback(() => {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const kind of BS_KINDS) {
      for (const entry of groupedAccounts[kind]) {
        const amount = parseFloat(entry.amount) || 0;
        if (amount === 0) continue;

        if (kind === "Asset") {
          // Dr positive, Cr negative
          if (entry.drCr === "dr") {
            totalDebits += amount;
          } else {
            totalCredits += amount;
          }
        } else {
          // Liability, Equity: Cr positive, Dr negative
          if (entry.drCr === "cr") {
            totalCredits += amount;
          } else {
            totalDebits += amount;
          }
        }
      }
    }

    return { totalDebits, totalCredits, difference: totalDebits - totalCredits };
  }, [groupedAccounts]);

  const { totalDebits, totalCredits, difference } = computeTotals();
  const isBalanced = Math.abs(difference) < 0.01;

  // Group toggle
  const toggleGroup = (kind: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) {
        next.delete(kind);
      } else {
        next.add(kind);
      }
      return next;
    });
  };

  // Update a single entry
  const updateEntry = (kind: BSkind, accountId: string, field: keyof BalanceEntry, value: unknown) => {
    setGroupedAccounts((prev) => ({
      ...prev,
      [kind]: prev[kind].map((e: BalanceEntry) =>
        e.accountId === accountId ? { ...e, [field]: value } : e
      ),
    }));
  };

  // Build balance entries for submission
  const buildBalanceEntries = (): OpeningBalanceEntry[] => {
    const entries: OpeningBalanceEntry[] = [];

    for (const kind of BS_KINDS) {
      for (const entry of groupedAccounts[kind]) {
        const amount = parseFloat(entry.amount) || 0;
        if (amount === 0) continue;

        let openingBalance: number;
        if (kind === "Asset") {
          openingBalance = entry.drCr === "dr" ? amount : -amount;
        } else {
          openingBalance = entry.drCr === "cr" ? amount : -amount;
        }

        entries.push({
          accountId: entry.accountId,
          accountCode: entry.accountCode,
          name: entry.name,
          kind: entry.kind,
          openingBalance,
        });
      }
    }

    return entries;
  };

  // Format amount on blur
  const handleAmountBlur = (kind: BSkind, accountId: string, rawValue: string) => {
    const num = parseFloat(rawValue);
    if (isNaN(num)) {
      updateEntry(kind, accountId, "amount", "");
      return;
    }
    // Store raw number for calculations, format for display is done via display
    updateEntry(kind, accountId, "amount", String(num));
  };

  // Confirm handler
  const handleConfirm = async () => {
    if (!tenantId) {
      setServerError("Tenant ID is missing");
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      if (mode === "fresh_start") {
        await fetchSaveProgress({
          tenantId,
          step: 5,
          data: { openingBalances: { mode: "fresh_start" } },
        });
        await fetchCompleteOnboarding({ tenantId });
      } else {
        const balances = buildBalanceEntries();
        await fetchSetupOpeningBalances({
          tenantId,
          fiscalYear: currentFY,
          input: { mode: "migration", balances },
        });
        await fetchSaveProgress({
          tenantId,
          step: 5,
          data: { openingBalances: { mode: "migration", balances } },
        });
        await fetchCompleteOnboarding({ tenantId });
      }

      onComplete();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const totalByGroup = (kind: BSkind) => {
    return groupedAccounts[kind].reduce((sum: number, entry: BalanceEntry) => {
      const amount = parseFloat(entry.amount) || 0;
      if (amount === 0) return sum;

      if (kind === "Asset") {
        return sum + (entry.drCr === "dr" ? amount : -amount);
      } else {
        return sum + (entry.drCr === "cr" ? amount : -amount);
      }
    }, 0);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Opening Balances</h2>
      <p className="text-sm text-gray-500">
        Set up your opening balances to begin tracking your accounting data.
      </p>

      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Mode Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">How would you like to start?</label>

        {/* Fresh Start */}
        <div
          className={`p-4 border rounded cursor-pointer transition-colors ${
            mode === "fresh_start"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setMode("fresh_start")}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="mode"
              value="fresh_start"
              checked={mode === "fresh_start"}
              onChange={() => setMode("fresh_start")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-sm">Fresh Start</p>
              <p className="text-xs text-gray-500 mt-1">
                This is a new business. All opening balances will be ₹0.
              </p>
            </div>
          </div>
        </div>

        {/* Migration */}
        <div
          className={`p-4 border rounded cursor-pointer transition-colors ${
            mode === "migration"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setMode("migration")}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="mode"
              value="migration"
              checked={mode === "migration"}
              onChange={() => setMode("migration")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-sm">Migrate from previous software</p>
              <p className="text-xs text-gray-500 mt-1">
                Import account balances from your existing accounting system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Table */}
      {mode === "migration" && (
        <div className="border rounded overflow-hidden">
          {isFetchingAccounts ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading accounts...
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-4 py-3 border-b text-xs font-medium text-gray-500 flex">
                <div className="w-24">Code</div>
                <div className="flex-1">Account Name</div>
                <div className="w-28 text-center">Dr/Cr</div>
                <div className="w-36 text-right">Amount</div>
              </div>

              {/* Groups */}
              {BS_KINDS.map((kind) => {
                const entries = groupedAccounts[kind];
                if (entries.length === 0) return null;

                const isCollapsed = collapsedGroups.has(kind);
                const groupTotal = totalByGroup(kind);
                const { column } = GROUP_LABELS[kind];

                return (
                  <div key={kind} className="border-b last:border-b-0">
                    {/* Group Header */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(kind)}
                      className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-medium transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{isCollapsed ? "▶" : "▼"}</span>
                        <span>{GROUP_LABELS[kind].label}</span>
                        <span className="text-xs text-gray-400">({entries.length} accounts)</span>
                      </div>
                      <div className={`text-sm font-medium ${
                        groupTotal >= 0 ? "text-gray-900" : "text-gray-900"
                      }`}>
                        {column === "dr" ? (
                          <>
                            {groupTotal >= 0 ? "Dr " : "Cr "}
                            {formatINR(String(Math.abs(groupTotal)))}
                          </>
                        ) : (
                          <>
                            {groupTotal >= 0 ? "Cr " : "Dr "}
                            {formatINR(String(Math.abs(groupTotal)))}
                          </>
                        )}
                      </div>
                    </button>

                    {/* Group Rows */}
                    {!isCollapsed && (
                      <div>
                        {entries.map((entry) => (
                          <div
                            key={entry.accountId}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm border-t border-gray-100 first:border-t-0"
                          >
                            <div className="w-24 font-mono text-xs text-gray-500">
                              {entry.accountCode}
                            </div>
                            <div className="flex-1 truncate text-gray-900">
                              {entry.name}
                            </div>
                            <div className="w-28 flex justify-center">
                              <div className="inline-flex rounded overflow-hidden border border-gray-300 text-xs">
                                <button
                                  type="button"
                                  onClick={() => updateEntry(kind, entry.accountId, "drCr", "dr")}
                                  className={`px-2 py-1 transition-colors ${
                                    entry.drCr === "dr"
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  Dr
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateEntry(kind, entry.accountId, "drCr", "cr")}
                                  className={`px-2 py-1 transition-colors ${
                                    entry.drCr === "cr"
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  Cr
                                </button>
                              </div>
                            </div>
                            <div className="w-36">
                              <input
                                type="text"
                                value={entry.amount}
                                onChange={(e) =>
                                  updateEntry(kind, entry.accountId, "amount", e.target.value)
                                }
                                onBlur={(e) => handleAmountBlur(kind, entry.accountId, e.target.value)}
                                placeholder="0.00"
                                className="w-full px-2 py-1 text-right text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty State */}
              {BS_KINDS.every((k) => groupedAccounts[k].length === 0) && (
                <div className="p-8 text-center text-sm text-gray-500">
                  No Balance Sheet accounts found. Please complete the Chart of Accounts step first.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Running Difference Widget */}
      {mode === "migration" && !isFetchingAccounts && (
        <div className={`sticky bottom-0 border rounded-lg p-4 ${
          isBalanced ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                isBalanced ? "text-green-700" : "text-red-700"
              }`}>
                {isBalanced ? (
                  "✓ Debits and Credits are balanced"
                ) : (
                  <>
                    <span className="text-red-600 font-semibold">
                      Difference: {difference >= 0 ? "₹" : "-₹"}
                      {Math.abs(difference).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-red-600 ml-2">
                      {difference >= 0 ? "Debits exceed Credits" : "Credits exceed Debits"}
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-6 mt-1 text-xs text-gray-500">
                <span>
                  Total Debits: <span className="font-medium">{formatINR(String(totalDebits))}</span>
                </span>
                <span>
                  Total Credits: <span className="font-medium">{formatINR(String(totalCredits))}</span>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading || !isBalanced}
              className={`px-6 py-2 rounded text-sm font-medium transition-colors ${
                isBalanced && !isLoading
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Processing..." : isBalanced ? "Confirm" : "Debits must equal Credits"}
            </button>
          </div>
        </div>
      )}

      {/* Fresh Start Confirm */}
      {mode === "fresh_start" && (
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Complete Setup →"}
          </button>
        </div>
      )}
    </div>
  );
}
