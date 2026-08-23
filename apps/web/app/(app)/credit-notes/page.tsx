"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inr = (v: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v));

export default function CreditNotesPage() {
  const { data, isLoading } = api.creditNotes.list.useQuery({ page: 1, pageSize: 50 }, { staleTime: 15_000 });
  const notes = data?.notes ?? [];

  return (
    <div className="space-y-10 text-left">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Invoicing · Credit Notes"
            title="Credit Notes"
            description="Documented reversals against issued invoices — posted to the ledger with a reversing journal entry."
          />
        </div>
        <Link href="/credit-notes/new" className={`${buttonVariants({})} group`}>
          New Credit Note <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </Link>
      </header>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
          <h3 className="font-ui text-lg font-bold text-dark">Issued</h3>
          <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">
            {isLoading ? "Loading…" : `${notes.length} credit note${notes.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                <th className="py-4 px-6">Number</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Reason</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
              {notes.map((n) => (
                <tr key={n.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6">
                    <Link href={`/credit-notes/${n.id}`} className="font-bold text-dark hover:text-amber no-underline transition-colors">
                      {n.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-5 px-6 font-mono text-ui-xs text-mid">{fmtDate(n.date)}</td>
                  <td className="py-5 px-6 text-mid">{n.customerName}</td>
                  <td className="py-5 px-6 text-mid max-w-xs truncate">{n.reason ?? "—"}</td>
                  <td className="py-5 px-6 text-right font-mono text-dark font-semibold">{inr(n.grandTotal)}</td>
                </tr>
              ))}
              {!isLoading && notes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-mid font-ui text-ui-sm">
                    No credit notes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
