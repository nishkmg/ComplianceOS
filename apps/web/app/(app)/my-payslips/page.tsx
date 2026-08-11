"use client";

import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/error-state";

export default function MyPayslipsPage() {
  const slips = api.payslips.listMyPayslips.useQuery(undefined, { staleTime: 15_000 });
  const isError = slips.isError;



  if (isError) {
    return (
      <ErrorState
        title="Could not load payslips"
        description="The server did not respond. Retry or go back."
        onRetry={() => window.location.reload()}
      />
    );
  }
  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <PageHeader title="My Payslips" />
      {slips.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : !slips.data || slips.data.length === 0 ? (
        <EmptyState icon="description" title="No payslips yet" description="Payslips will appear here once payroll is processed and distributed to you." />
      ) : (
        <div className="bg-surface border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                  <th className="py-4 px-6">Period</th>
                  <th className="py-4 px-6">Generated</th>
                  <th className="py-4 px-6 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                {slips.data.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-4 px-6 font-ui text-ui-sm font-bold text-dark">{s.month}/{s.year}</td>
                    <td className="py-4 px-6 text-mid">{s.generatedAt ? String(s.generatedAt).slice(0, 10) : "—"}</td>
                    <td className="py-4 px-6 text-right">
                      {s.pdfUrl ? (
                        <a href={s.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-amber hover:underline no-underline">
                          <Icon name="download" className="text-ui-md" /> PDF
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
