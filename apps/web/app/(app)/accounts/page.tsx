"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";

interface Account {
  id: string;
  code: string;
  name: string;
  kind: string;
  isLeaf: boolean;
  isActive: boolean;
}

const columns: ColumnDef<Account>[] = [
  { key: "code", header: "Code", width: "120px", render: (row) => <span className="font-mono text-[12px] text-mid">{row.code}</span> },
  { key: "name", header: "Account Name", sortable: true, render: (row) => <Link href={`/accounts/${row.id}`} className="font-ui text-[13px] text-amber hover:underline no-underline">{row.name}</Link> },
  { key: "kind", header: "Kind", width: "120px", render: (row) => <span className="font-ui text-[12px] text-mid">{row.kind}</span> },
  { key: "isLeaf", header: "Leaf", width: "80px", render: (row) => <span className={`text-[11px] font-bold uppercase ${row.isLeaf ? "text-success" : "text-mid"}`}>{row.isLeaf ? "Yes" : "No"}</span> },
];

export default function AccountsPage() {
  const { data, isLoading } = api.accounts.list.useQuery();
  const accounts = ((data ?? []) as Account[]).filter(a => a.isActive !== false);

  if (isLoading) return <TableSkeleton rows={8} columns={4} />;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">Accounts</h1></div>
        <Link href="/accounts/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors rounded-md shadow-sm no-underline">
          <Icon name="add" size={14} /> New Account
        </Link>
      </div>
      {accounts.length > 0 ? (
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm">
          <DataTable columns={columns} data={accounts} keyExtractor={(r) => r.id} />
        </div>
      ) : (
        <EmptyState icon="account_balance" title="No accounts" description="Create your first account to start building the chart of accounts." />
      )}
    </div>
  );
}
