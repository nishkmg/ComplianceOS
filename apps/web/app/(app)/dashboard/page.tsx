"use client";

import { useState, useEffect, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { KpiTile } from "@/components/ui/kpi-tile";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton, KPISkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useSession } from "next-auth/react";

interface JournalEntry {
  id: string; entry_number: string; date: string; narration: string; debit: number; credit: number; status: "draft" | "posted" | "voided";
}

const entryColumns: ColumnDef<JournalEntry>[] = [
  { key: "entry_number", header: "Entry #", sortable: true, width: "130px",
    render: (row) => <Link href={`/journal/${row.id}`} className="font-mono text-[12px] text-amber hover:underline no-underline">{row.entry_number}</Link> },
  { key: "date", header: "Date", sortable: true, width: "120px",
    render: (row) => <span className="font-mono text-[12px] text-mid">{new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span> },
  { key: "narration", header: "Narration", render: (row) => <span className="font-ui text-[13px] text-dark">{row.narration}</span> },
  { key: "debit", header: "Debit", align: "right", width: "120px",
    render: (row) => <span className="font-mono text-[13px] tabular-nums">{row.debit > 0 ? formatIndianNumber(row.debit, { currency: true }) : "—"}</span> },
  { key: "credit", header: "Credit", align: "right", width: "120px",
    render: (row) => <span className="font-mono text-[13px] tabular-nums">{row.credit > 0 ? formatIndianNumber(row.credit, { currency: true }) : "—"}</span> },
  { key: "status", header: "Status", align: "center", width: "90px",
    render: (row) => <Badge variant={row.status === "posted" ? "success" : "amber"}>{row.status}</Badge> },
];

export default function DashboardPage() {
  const { activeFy } = useFiscalYear();
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const r = await fetch(`/api/journal/entries?tenantId=${encodeURIComponent(tenantId)}&fiscalYear=${encodeURIComponent(activeFy)}`);
        if (r.ok) {
          const data = await r.json();
          setEntries((data.entries || []).slice(0, 8));
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [tenantId, activeFy]);

  const totalDebit = useMemo(() => entries.reduce((s, e) => s + e.debit, 0), [entries]);
  const totalCredit = useMemo(() => entries.reduce((s, e) => s + e.credit, 0), [entries]);
  const postedCount = useMemo(() => entries.filter(e => e.status === "posted").length, [entries]);
  const draftCount = useMemo(() => entries.filter(e => e.status === "draft").length, [entries]);

  const companyName = "Your Business";
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-ui text-display-xl text-dark">{greeting}, {companyName}</h1>
            <span className="font-mono text-[10px] uppercase tracking-wider text-mid bg-surface-muted px-2 py-0.5 rounded-md border border-border shrink-0 font-medium">FY {activeFy}</span>
          </div>
          <p className="text-[13px] text-secondary font-ui mt-1">{today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>
        <Link href="/journal/new" className="bg-amber text-white px-5 py-2 flex items-center gap-2 hover:bg-amber-hover transition-colors active:scale-95 group no-underline rounded-md shadow-sm">
          <span className="font-ui text-[10px] uppercase tracking-wider font-bold">Add Entry</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

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

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-md shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-1">GST Compliance</p>
            <h3 className="font-ui text-lg font-semibold text-dark">File GSTR-3B</h3>
            <p className="font-ui text-[12px] text-mid mt-1">Period: {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          </div>
          <Link href="/gst/returns" className="bg-amber text-white px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors no-underline rounded-sm flex items-center gap-1.5 shadow-sm">
            <Icon name="download" className="text-[14px]" /> File Now
          </Link>
        </div>
        <div className="bg-surface border border-border rounded-md shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-1">Income Tax</p>
            <h3 className="font-ui text-lg font-semibold text-dark">Generate ITR</h3>
            <p className="font-ui text-[12px] text-mid mt-1">AY: {`${Number(activeFy.split('-')[0]) + 1}-${activeFy.split('-')[1]}`}</p>
          </div>
          <Link href="/itr/returns" className="bg-amber text-white px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors no-underline rounded-sm flex items-center gap-1.5 shadow-sm">
            <Icon name="description" className="text-[14px]" /> Generate
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md shadow-sm">
        <div className="h-[2px] w-full bg-amber" />
        <div className="px-6 py-4 bg-surface-muted border-b border-border flex items-center justify-between">
          <h2 className="font-ui text-[11px] text-dark font-bold uppercase tracking-widest">Recent Journal Entries</h2>
          <Link href="/journal" className="text-amber text-[10px] font-bold uppercase tracking-widest hover:underline no-underline">View All</Link>
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
