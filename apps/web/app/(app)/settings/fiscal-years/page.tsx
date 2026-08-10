"use client";

import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CloseFiscalYearDialog } from "@/components/dialogs/close-fy-confirmation";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

interface FiscalYearRow {
  id: string;
  name: string;
  period: string;
  status: string;
  daysRemaining: number;
}

export default function FiscalYearsPage() {
  const { activeFy } = useFiscalYear();
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const actorId = (session?.user as Record<string, unknown> | undefined)?.id as string | null;
  const [closeFy, setCloseFy] = useState<{ id: string; year: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createForm, setCreateForm] = useState({ year: "", startDate: "", endDate: "" });

  const utils = api.useUtils();
  const fiscalYearsQuery = api.fiscalYears.list.useQuery(undefined, { staleTime: 15_000 });
  const fiscalYears: FiscalYearRow[] = (fiscalYearsQuery.data ?? []).map((fy: any) => ({
    id: fy.id,
    name: `FY ${fy.year}`,
    period: `${fmtDate(fy.startDate)} - ${fmtDate(fy.endDate)}`,
    status: fy.status,
    daysRemaining: fy.endDate ? Math.max(0, Math.ceil((new Date(fy.endDate).getTime() - Date.now()) / 86400000)) : 0,
  }));
  const loading = fiscalYearsQuery.isLoading;

  const confirmCloseFy = async () => {
    if (!closeFy) return;
    setBusy(true);
    closeFyMutation.mutate({ id: closeFy.id });
  };

  const closeFyMutation = api.fiscalYears.close.useMutation({
    onSuccess: () => {
      showToast.success(`FY ${closeFy?.year ?? ""} closed.`);
      setCloseFy(null);
      setBusy(false);
      void utils.fiscalYears.list.invalidate();
    },
    onError: (e) => {
      showToast.error(e.message);
      setBusy(false);
    },
  });

  const createFyMutation = api.fiscalYears.create.useMutation({
    onSuccess: () => {
      showToast.success(`FY ${createForm.year} created.`);
      setCreateOpen(false);
      setBusy(false);
      void utils.fiscalYears.list.invalidate();
    },
    onError: (e) => {
      showToast.error(e.message);
      setBusy(false);
    },
  });

  const confirmCreateFy = async () => {
    if (!createForm.year || !createForm.startDate || !createForm.endDate) {
      showToast.error("Year, start and end dates are required.");
      return;
    }
    setBusy(true);
    createFyMutation.mutate({ year: createForm.year, startDate: createForm.startDate, endDate: createForm.endDate });
  };

  return (
    <div className="space-y-10 text-left">
      {/* Page Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader eyebrow={`Settings · FY ${activeFy}`} title="Fiscal Years" />
          <p className="text-ui-sm text-secondary font-ui mt-1 max-w-2xl leading-relaxed">Manage accounting periods, statutory boundaries, and ledger lifecycle constraints for your organization.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => {
              const open = fiscalYears.find((f) => f.status === "open");
              if (open) setCloseFy({ id: open.id, year: open.name.replace("FY ", "") });
            }}
            disabled={busy}
            className="btn-secondary"
          >
            Close FY
          </button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 group">
            Create FY <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface 200-border border rounded-md overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>
            <div className="p-6 border-b 100-border flex justify-between items-center bg-surface-muted/50">
              <div>
                <h3 className="font-ui text-lg font-bold text-dark">Ledger Periods</h3>
                <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Indian Financial Calendar</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b 100-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                    <th className="py-4 px-6">Financial Year</th>
                    <th className="py-4 px-6">Reporting Period</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y 50-border font-ui text-ui-sm">
                  {fiscalYears.map((fy) => (
                    <tr key={fy.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-5 px-6">
                        <Link href={`/settings/fiscal-years/${fy.id}`} className="font-bold text-dark hover:text-primary no-underline transition-colors">{fy.name}</Link>
                        <p className="text-ui-2xs text-light mt-0.5">{fy.daysRemaining} days remaining</p>
                      </td>
                      <td className="py-5 px-6 font-mono text-ui-xs text-mid">{fy.period}</td>
                      <td className="py-5 px-6">
                        <span className={`inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-widest border rounded-md ${
                          fy.status === 'open' ? 'bg-success-bg text-success-deep border-success/20' :
                          fy.status === 'closed' ? 'bg-surface-muted text-mid 200-border' :
                          'bg-surface-muted text-light 100-border'
                        }`}>
                          {fy.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <Link href={`/settings/fiscal-years/${fy.id}`} className="text-amber hover:text-primary font-bold uppercase text-ui-2xs tracking-widest no-underline">View Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark text-white p-8 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 text-left">
              <h4 className="text-amber-bright font-ui text-lg font-bold mb-3">Statutory Lock</h4>
              <p className="text-sidebar-muted text-sm leading-relaxed mb-6">Current policy prevents modifications to any closed fiscal periods. This ensures 100% data integrity for historical audit trails.</p>
              <div className="flex items-center gap-2 text-ui-2xs uppercase font-bold tracking-widest text-amber-bright">
                <Icon name="verified_user" className="text-sm" />
                Policy Enforced
              </div>
            </div>
            <Icon name="lock" className="absolute -right-8 -bottom-8 text-[120px] opacity-5 transform group-hover:rotate-12 transition-transform" />
          </div>

          <div className="bg-amber-50 border border-amber/30 p-8 shadow-sm text-left">
            <h4 className="font-ui text-sm font-medium font-bold text-dark mb-4 uppercase tracking-widest text-ui-2xs">Data Retention</h4>
            <p className="text-ui-sm text-sm text-mid leading-relaxed">Arthvahi retains ledger data for up to 8 years as per IT Act requirements. Archived years can be exported as read-only CSV at any time.</p>
          </div>
        </div>
      </div>

      {/* Close FY dialog */}
      <CloseFiscalYearDialog
        isOpen={closeFy !== null}
        onClose={() => setCloseFy(null)}
        fiscalYear={closeFy?.year ?? ""}
        onConfirm={confirmCloseFy}
      />

      {/* Create FY dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCreateOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-ui text-base font-semibold text-dark">Create Fiscal Year</h3>
            <p className="mt-1 font-ui text-ui-sm text-mid">New year starts 01 April by default; adjust dates if needed.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="fy-year" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Year (e.g. 2027-28)</label>
                <input id="fy-year" value={createForm.year} onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })} placeholder="2027-28" className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fy-start" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Start date</label>
                  <input id="fy-start" type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
                </div>
                <div>
                  <label htmlFor="fy-end" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">End date</label>
                  <input id="fy-end" type="date" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={confirmCreateFy} disabled={busy} className="btn-primary">Create FY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
