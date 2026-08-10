"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function FiscalYearDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const utils = api.useUtils();

  const fyQuery = api.fiscalYears.get.useQuery({ id }, { staleTime: 15_000 });
  const [closing, setClosing] = useState(false);

  const closeFy = api.fiscalYears.close.useMutation({
    onSuccess: () => {
      showToast.success(`FY ${fy?.year ?? ""} closed.`);
      setClosing(false);
      void utils.fiscalYears.get.invalidate();
      void utils.fiscalYears.list.invalidate();
    },
    onError: (e) => {
      showToast.error(e.message);
      setClosing(false);
    },
  });

  const fy = fyQuery.data;

  if (fyQuery.isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!fy) return <div className="max-w-page mx-auto py-20"><EmptyState icon="error" title="Fiscal year not found" description="This fiscal year does not exist for your tenant." /></div>;

  const daysRemaining = fy.endDate ? Math.max(0, Math.ceil((new Date(fy.endDate).getTime() - Date.now()) / 86400000)) : 0;
  const isClosed = fy.status === "closed";

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui text-ui-2xs text-light uppercase tracking-widest mb-12">
        <Link className="hover:text-dark transition-colors no-underline flex items-center gap-1" href="/settings/fiscal-years">
          <Icon name="arrow_back" className="text-ui-lg" />
          Fiscal Years
        </Link>
        <span className="text-border-subtle">/</span>
        <span className="text-dark">FY {fy.year}</span>
      </div>

      {/* Header Section */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border pb-8">
        <div className="text-left">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Fiscal Year Detail</p>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="font-ui text-display-lg font-semibold text-dark tracking-tight">FY {fy.year}</h1>
            <span className={`font-ui text-ui-2xs uppercase tracking-widest px-3 py-1 rounded-md font-bold ${isClosed ? "bg-surface-muted text-mid" : "bg-success-bg text-success-deep"}`}>{fy.status}</span>
          </div>
          <p className="text-ui-sm text-secondary font-ui mt-1">Reporting period: {fmtDate(fy.startDate)} — {fmtDate(fy.endDate)}</p>
        </div>
      </header>

      {/* Period summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-8 border-t-2 border-t-amber shadow-sm text-left">
          <div className="flex justify-between items-start mb-6 text-light">
            <span className="font-ui text-ui-2xs uppercase tracking-widest font-bold">Period</span>
            <Icon name="calendar_month" className="text-lg" />
          </div>
          <div className="font-mono text-xl text-dark font-bold">{fmtDate(fy.startDate)} — {fmtDate(fy.endDate)}</div>
        </div>
        <div className="bg-surface border border-border p-8 shadow-sm text-left">
          <div className="flex justify-between items-start mb-6 text-light">
            <span className="font-ui text-ui-2xs uppercase tracking-widest font-bold">Status</span>
            <Icon name={isClosed ? "lock" : "check_circle"} className={`text-lg ${isClosed ? "text-mid" : "text-success"}`} />
          </div>
          <div className="font-mono text-xl text-dark font-bold capitalize">{fy.status}</div>
        </div>
        <div className="bg-surface border border-border p-8 shadow-sm text-left">
          <div className="flex justify-between items-start mb-6 text-light">
            <span className="font-ui text-ui-2xs uppercase tracking-widest font-bold">Days Remaining</span>
            <Icon name="update" className="text-lg" />
          </div>
          <div className="font-mono text-xl text-dark font-bold">{isClosed ? "—" : `${daysRemaining} days`}</div>
        </div>
      </section>

      {/* Action Panel: Close Fiscal Year */}
      <section className="border-t-[0.5px] border-border pt-16 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-5">
            <h2 className="font-ui text-3xl text-dark mb-6 font-bold">Year-End Finalization</h2>
            <p className="font-ui text-sm text-mid leading-relaxed mb-6">
              Initiating the closure of a fiscal year locks all ledgers and prevents further modifications to the accounting period. This process is mandatory for generating final statutory reports.
            </p>
            <div className="bg-amber-50 border border-amber/30 p-6 rounded-md">
              <p className="font-ui text-ui-sm text-amber-900 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Icon name="info" className="text-sm" />
                Closure Requirements
              </p>
              <ul className="space-y-2 list-none p-0">
                <li className="flex items-center gap-2 font-ui text-ui-sm text-amber-800">
                  <span className="w-1 h-1 bg-amber-bright rounded-full"></span>
                  All draft journal entries must be posted or deleted
                </li>
                <li className="flex items-center gap-2 font-ui text-ui-sm text-amber-800">
                  <span className="w-1 h-1 bg-amber-bright rounded-full"></span>
                  GST reconciliation for all periods must be complete
                </li>
              </ul>
            </div>
          </div>
          <div className="md:col-span-7 flex flex-col justify-center items-end">
            <button
              onClick={() => {
                if (window.confirm(`Close FY ${fy.year}? This locks all ledgers for the period.`)) {
                  setClosing(true);
                  closeFy.mutate({ id: fy.id });
                }
              }}
              disabled={isClosed || closing}
              className={`bg-surface-muted border border-border text-mid px-12 py-4 font-ui text-ui-sm font-bold uppercase tracking-widest cursor-pointer ${isClosed ? "opacity-50" : "hover:bg-amber hover:text-white hover:border-amber transition-colors"}`}
            >
              {closing ? "Closing…" : isClosed ? "Closed" : "Close Fiscal Year"}
            </button>
            {!isClosed && <p className="mt-4 text-ui-xs text-light text-right uppercase tracking-widest">{daysRemaining} days remaining in the period</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
