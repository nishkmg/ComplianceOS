"use client";

import { useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { KpiTile } from "@/components/ui/kpi-tile";
import { PageHeader } from "@/components/ui/page-header";
import { TrendArea } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton, KPISkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

interface JournalEntry {
  id: string; entryNumber: string; date: string; narration: string; debit: string; credit: string; status: "draft" | "posted" | "voided";
}

const entryColumns: ColumnDef<JournalEntry>[] = [
  { key: "entryNumber", header: "Entry #", sortable: true, width: "130px",
    render: (row) => <Link href={`/journal/${row.id}`} className="font-mono text-ui-xs text-amber hover:underline no-underline">{row.entryNumber}</Link> },
  { key: "date", header: "Date", sortable: true, width: "120px",
    render: (row) => <span className="font-mono text-ui-xs text-mid">{new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span> },
  { key: "narration", header: "Narration", render: (row) => <span className="font-ui text-ui-sm text-dark">{row.narration}</span> },
  { key: "debit", header: "Debit", align: "right", width: "120px",
    render: (row) => <span className="font-mono text-ui-sm tabular-nums">{Number(row.debit) > 0 ? formatIndianNumber(row.debit, { currency: true }) : "—"}</span> },
  { key: "credit", header: "Credit", align: "right", width: "120px",
    render: (row) => <span className="font-mono text-ui-sm tabular-nums">{Number(row.credit) > 0 ? formatIndianNumber(row.credit, { currency: true }) : "—"}</span> },
  { key: "status", header: "Status", align: "center", width: "90px",
    render: (row) => <Badge variant={row.status === "posted" ? "success" : "amber"}>{row.status}</Badge> },
];

export default function DashboardPage() {
  const { activeFy } = useFiscalYear();
  const { data: session } = useSession();

  const { data, isLoading } = api.journalEntries.list.useQuery(
    { fiscalYear: activeFy, limit: 500 },
    { staleTime: 15_000 },
  );
  const allEntries = (data ?? []) as JournalEntry[];
  const entries = allEntries.slice(0, 8);
  const loading = isLoading;

  const totalDebit = useMemo(() => allEntries.reduce((s, e) => s + Number(e.debit || 0), 0), [allEntries]);
  const totalCredit = useMemo(() => allEntries.reduce((s, e) => s + Number(e.credit || 0), 0), [allEntries]);
  const monthlyTrend = useMemo(() => {
    const months = new Map<string, { debit: number; credit: number }>();
    for (const e of allEntries) {
      const key = new Date(e.date).toLocaleDateString("en-IN", { month: "short" });
      const cur = months.get(key) ?? { debit: 0, credit: 0 };
      cur.debit += Number(e.debit || 0);
      cur.credit += Number(e.credit || 0);
      months.set(key, cur);
    }
    return [...months.entries()].map(([label, v]) => ({
      label,
      debit: Math.round(v.debit),
      credit: Math.round(v.credit),
    }));
  }, [allEntries]);

  const postedCount = useMemo(() => entries.filter(e => e.status === "posted").length, [entries]);
  const draftCount = useMemo(() => entries.filter(e => e.status === "draft").length, [entries]);

  const companyName = (session?.user as Record<string, unknown> | undefined)?.name as string || "Your Business";
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting}, ${companyName}`}
        description={`${today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })} · FY ${activeFy}`}
        actions={
          <Link href="/journal/new" className="no-underline">
            <Button size="sm">
              <Icon name="add" className="text-ui-lg" />
              Add Entry
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><KPISkeleton /><KPISkeleton /><KPISkeleton /><KPISkeleton /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiTile label="Total Debits" value={formatIndianNumber(totalDebit, { currency: true })} icon="arrow_upward" />
          <KpiTile label="Total Credits" value={formatIndianNumber(totalCredit, { currency: true })} icon="arrow_downward" />
          <KpiTile label="Posted" value={String(postedCount)} subtext="entries" icon="check_circle" />
          <KpiTile label="Drafts" value={String(draftCount)} subtext="entries" icon="clock" />
        </div>
      )}

      {monthlyTrend.length > 1 && (
        <div className="bg-surface border border-border rounded-md shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-ui text-ui-sm font-bold text-dark uppercase tracking-widest">Movement — Debits vs Credits</h3>
            <span className="font-ui text-ui-xs text-light">FY {activeFy} · journal entries by month</span>
          </div>
          <TrendArea
            data={monthlyTrend}
            xKey="label"
            series={[
              { key: "debit", name: "Debits", color: "var(--color-amber)" },
              { key: "credit", name: "Credits", color: "var(--color-mid)" },
            ]}
            caption="Monthly debit and credit totals"
            height={200}
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-md shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-1">GST Compliance</p>
            <h3 className="font-ui text-lg font-semibold text-dark">File GSTR-3B</h3>
            <p className="font-ui text-ui-xs text-mid mt-1">Period: {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          </div>
          <Link href="/gst/returns" className="bg-amber text-white dark:text-amber-ink px-4 py-2 font-ui text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors no-underline rounded-sm flex items-center gap-1.5 shadow-sm">
            <Icon name="download" className="text-ui-md" /> File Now
          </Link>
        </div>
        <div className="bg-surface border border-border rounded-md shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-1">Income Tax</p>
            <h3 className="font-ui text-lg font-semibold text-dark">Generate ITR</h3>
            <p className="font-ui text-ui-xs text-mid mt-1">AY: {`${Number(activeFy.split('-')[0]) + 1}-${activeFy.split('-')[1]}`}</p>
          </div>
          <Link href="/itr/returns" className="bg-amber text-white dark:text-amber-ink px-4 py-2 font-ui text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors no-underline rounded-sm flex items-center gap-1.5 shadow-sm">
            <Icon name="description" className="text-ui-md" /> Generate
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md shadow-sm">
        <div className="h-[2px] w-full bg-amber" />
        <div className="px-6 py-4 bg-surface-muted border-b border-border flex items-center justify-between">
          <h2 className="font-ui text-ui-xs text-dark font-bold uppercase tracking-widest">Recent Journal Entries</h2>
          <Link href="/journal" className="text-amber text-ui-2xs font-bold uppercase tracking-widest hover:underline no-underline">View All</Link>
        </div>
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} columns={5} /></div>
        ) : entries.length === 0 ? (
          <EmptyState icon="menu_book" title="No entries yet" description="Post your first journal entry to get started." action={{ label: "New Entry", onClick: () => window.location.href = "/journal/new" }} />
        ) : (
          <DataTable columns={entryColumns} data={entries} keyExtractor={(r) => r.id} />
        )}
      </div>
    </div>
  );
}
