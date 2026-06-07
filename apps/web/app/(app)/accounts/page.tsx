"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSession } from "next-auth/react";

interface Account {
  id: string;
  code: string;
  name: string;
  kind: string;
  is_leaf: boolean;
  is_active: boolean;
}

const columns: ColumnDef<Account>[] = [
  { key: "code", header: "Code", width: "120px", render: (row) => <span className="font-mono text-[12px] text-mid">{row.code}</span> },
  { key: "name", header: "Account Name", sortable: true, render: (row) => <Link href={`/accounts/${row.id}`} className="font-ui text-[13px] text-amber-text hover:underline no-underline">{row.name}</Link> },
  { key: "kind", header: "Kind", width: "120px", render: (row) => <span className="font-ui text-[12px] text-mid">{row.kind}</span> },
  { key: "is_leaf", header: "Leaf", width: "80px", render: (row) => <span className={`text-[11px] font-bold uppercase ${row.is_leaf ? "text-success" : "text-mid"}`}>{row.is_leaf ? "Yes" : "No"}</span> },
];

export default function AccountsPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const res = await fetch(`/api/accounts?tenantId=${encodeURIComponent(tenantId)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAccounts(data.accounts || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [tenantId]);

  if (loading) return <TableSkeleton rows={8} columns={4} />;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-display-lg font-semibold text-dark">Accounts</h1></div>
        <Link href="/accounts/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all rounded-md shadow-sm no-underline">
          <Icon name="add" size={14} /> New Account
        </Link>
      </div>
      {accounts.length > 0 ? (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm">
          <DataTable columns={columns} data={accounts.filter(a => a.is_active !== false)} keyExtractor={(r) => r.id} />
        </div>
      ) : (
        <EmptyState icon="account_balance" title="No accounts" description="Create your first account to start building the chart of accounts." />
      )}
    </div>
  );
}
