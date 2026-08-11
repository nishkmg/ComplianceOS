"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";
import { submitStep } from "@/lib/mock-mutation";

interface AccountRow {
  id: string;
  code: string;
  name: string;
  kind: string;
  subType: string;
  isLeaf: boolean;
}

interface StepCoaReviewProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

const KIND_ORDER = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

export function StepCoaReview({ tenantId, onComplete, onBack }: StepCoaReviewProps) {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/onboarding?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const rows: AccountRow[] = d?.accounts ?? [];
        setAccounts(rows);
        setSelected(new Set(rows.filter((a) => a.isLeaf !== false).map((a) => a.id)));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [tenantId]);

  const grouped = KIND_ORDER
    .map((kind) => ({ kind, rows: accounts.filter((a) => a.kind.toLowerCase() === kind.toLowerCase()) }))
    .filter((g) => g.rows.length > 0);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await submitStep(4, { tenantId, data: { selectedIds: [...selected] } });
      showToast.success("Chart of accounts reviewed.");
      onComplete();
    } catch {
      showToast.error("Could not save. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon name="account_tree" className="text-amber" size={20} />
        <div>
          <h2 className="font-ui text-lg font-bold text-dark">Review your Chart of Accounts</h2>
          <p className="font-ui text-ui-sm text-mid mt-1">
            {accounts.length > 0
              ? `${accounts.length} accounts created from your template. Uncheck any you don't need.`
              : "Loading your chart of accounts…"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {grouped.map((g) => (
          <div key={g.kind} className="bg-surface border border-border rounded-md overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-surface-muted/60 border-b border-border-subtle">
              <h3 className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">{g.kind}</h3>
            </div>
            <div className="divide-y divide-border-subtle">
              {g.rows.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-muted/40 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggle(a.id)}
                    className="h-4 w-4 accent-amber"
                  />
                  <span className="font-mono text-ui-2xs text-mid w-20">{a.code}</span>
                  <span className="font-ui text-ui-sm text-dark">{a.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="font-ui text-ui-sm text-mid">No accounts yet — go back and select a template first.</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onBack && (
          <button onClick={onBack} className="btn btn-ghost">Back</button>
        )}
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
