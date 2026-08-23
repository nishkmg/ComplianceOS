"use client";

import { useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { KpiTile } from "@/components/ui/kpi-tile";
import { PageHeader } from "@/components/ui/page-header";
import { TrendArea } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton, KPISkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { ErrorState } from "@/components/ui/error-state";

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

interface ReturnsDueProps {
  activeFy: string;
}

function ReturnsDue({ activeFy }: ReturnsDueProps) {
  const periods = useMemo(() => {
    const now = new Date();
    return [1, 0].map((i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      };
    });
  }, []);

  const prev = api.gstReturns.liveSummary.useQuery(
    { periodMonth: periods[0].month, periodYear: periods[0].year },
    { staleTime: 15_000 },
  );
  const cur = api.gstReturns.liveSummary.useQuery(
    { periodMonth: periods[1].month, periodYear: periods[1].year },
    { staleTime: 15_000 },
  );

  const fyStart = Number(activeFy.split("-")[0]);
  const ay = `${fyStart + 1}-${String(fyStart + 1).slice(-2)}`;

  const gstCards = [prev, cur].map((q, i) => {
    const period = periods[i];
    const gstr3b = q.data?.gstr3b;
    const isZero = gstr3b && gstr3b.outwardTaxable === 0 && gstr3b.itcAvailable === 0 && gstr3b.netPayable === 0;
    return {
      key: `${period.year}-${period.month}`,
      period,
      loading: q.isLoading,
      payable: gstr3b?.netPayable ?? 0,
      noTransactions: !q.isLoading && (!gstr3b || isZero),
      href: `/gst/returns/${period.year}-${String(period.month).padStart(2, "0")}`,
    };
  });

  return (
    <div className="bg-surface border border-border rounded-md shadow-sm">
      <div className="h-[2px] w-full bg-amber" />
      <div className="px-6 py-4 bg-surface-muted border-b border-border flex items-center justify-between">
        <h2 className="font-ui text-ui-xs text-dark font-bold uppercase tracking-widest">Compliance Status · Returns Due</h2>
        <Link href="/gst/returns" className="text-amber text-ui-2xs font-bold uppercase tracking-widest hover:underline no-underline">GST Returns</Link>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gstCards.map(({ key, period, loading, payable, noTransactions, href }) => (
          <Link key={key} href={href} className="block bg-surface border border-border rounded-md p-5 shadow-sm hover:shadow-md transition-shadow no-underline">
            <div className="flex items-center justify-between mb-2">
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold">GSTR-3B</p>
              <p className="font-ui text-ui-2xs text-mid">{period.label}</p>
            </div>
            <p className="font-mono text-2xl font-bold text-dark tabular-nums">{loading ? "—" : formatIndianNumber(payable)}</p>
            <p className="font-ui text-ui-2xs text-light mt-1">
              {noTransactions ? "No transactions yet" : "Net payable"}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-ui text-ui-2xs font-bold uppercase tracking-widest text-amber">Open →</span>
            </div>
          </Link>
        ))}
        <Link href={`/itr/returns/${activeFy}`} className="block bg-surface border border-border rounded-md p-5 shadow-sm hover:shadow-md transition-shadow no-underline">
          <div className="flex items-center justify-between mb-2">
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold">ITR-3</p>
            <p className="font-ui text-ui-2xs text-mid">FY {activeFy}</p>
          </div>
          <p className="font-ui text-ui-sm font-semibold text-dark">Income tax return</p>
          <p className="font-ui text-ui-2xs text-light mt-1">Assessment year {ay}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-ui text-ui-2xs font-bold uppercase tracking-widest text-amber">Open →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function UsageMeter() {
  const { data } = api.invoices.usage.useQuery();
  if (!data) return null;
  const pct = data.limit ? Math.min(100, Math.round((data.count / data.limit) * 100)) : null;
  return (
    <div className="rounded-sm border border-border-subtle bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">Invoices this month</p>
        <p className="font-mono text-mono-md tabular-nums text-dark">
          {data.count}{data.limit ? ` / ${data.limit}` : ""}
        </p>
      </div>
      {pct !== null && (
        <>
          <div className="mt-3 h-1.5 w-full rounded-sm bg-section-muted">
            <div className={`h-full rounded-sm ${pct >= 100 ? "bg-danger" : "bg-amber"}`} style={{ width: `${pct}%` }} />
          </div>
          {pct >= 100 && (
            <p className="font-ui text-ui-sm text-danger mt-2">
              Free plan limit reached — <Link className="text-amber hover:underline" href="/pricing">upgrade</Link> to keep invoicing.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { activeFy } = useFiscalYear();
  const { data: session } = useSession();

  const { data, isLoading, isError } = api.journalEntries.list.useQuery(
    { fiscalYear: activeFy, limit: 25 },
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

  if (isError) {
    return (
      <ErrorState
        title="Could not load Dashboard"
        description="The server did not respond. Retry or go back."
        onRetry={() => window.location.reload()}
      />
    );
  }
  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting}, ${companyName}`}
        description={`${today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })} · FY ${activeFy}`}
        actions={
          <Link href="/journal/new" className="no-underline">
            <Button size="sm">
              <Icon name="add" />
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

      {/* Returns due */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReturnsDue activeFy={activeFy} />
        </div>
        <UsageMeter />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-md shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-1">GST Compliance</p>
            <h3 className="font-ui text-lg font-semibold text-dark">File GSTR-3B</h3>
            <p className="font-ui text-ui-xs text-mid mt-1">Period: {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          </div>
          <Link href="/gst/returns" className={buttonVariants({})}>
            <Icon name="download" className="text-ui-md" /> File Now
          </Link>
        </div>
        <div className="bg-surface border border-border rounded-md shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-1">Income Tax</p>
            <h3 className="font-ui text-lg font-semibold text-dark">Generate ITR</h3>
            <p className="font-ui text-ui-xs text-mid mt-1">AY: {`${Number(activeFy.split("-")[0]) + 1}-${String(Number(activeFy.split("-")[0]) + 2).slice(-2)}`}</p>
          </div>
          <Link href="/itr/returns" className={buttonVariants({})}>
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
