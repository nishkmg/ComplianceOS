"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inr = (v: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v));

export default function CreditNoteDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: note, isLoading } = api.creditNotes.get.useQuery({ id: params.id });

  if (isLoading) {
    return <div className="text-mid font-ui text-ui-sm">Loading credit note…</div>;
  }
  if (!note) return notFound();

  const rows = [
    { label: "Subtotal", value: note.subtotal },
    { label: "CGST", value: note.cgstTotal },
    { label: "SGST", value: note.sgstTotal },
    { label: "IGST", value: note.igstTotal },
    { label: "Discount", value: note.discountTotal },
  ];

  return (
    <div className="space-y-10 text-left max-w-4xl">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Invoicing · Credit Notes"
            title={note.invoiceNumber}
            description={`${fmtDate(note.date)} · ${note.customerName}`}
          />
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/credit-notes" className={buttonVariants({ variant: "outline" })}>← All credit notes</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
            <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
              <h3 className="font-ui text-lg font-bold text-dark">Summary</h3>
              <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Posted as a reversing journal entry</p>
            </div>
            <dl className="p-6 space-y-3 font-ui text-ui-sm">
              <div className="flex justify-between">
                <dt className="text-mid">Customer</dt>
                <dd className="font-medium text-dark">{note.customerName}</dd>
              </div>
              {note.customerGstin && (
                <div className="flex justify-between">
                  <dt className="text-mid">GSTIN</dt>
                  <dd className="font-mono text-dark">{note.customerGstin}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-mid">Fiscal year</dt>
                <dd className="font-medium text-dark">{note.fiscalYear}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mid">Status</dt>
                <dd>
                  <StatusBadge variant="success">
                    {note.status}
                  </StatusBadge>
                </dd>
              </div>
              {note.reason && (
                <div className="flex justify-between gap-6">
                  <dt className="text-mid shrink-0">Reason</dt>
                  <dd className="text-right text-dark">{note.reason}</dd>
                </div>
              )}
              {note.originalInvoiceId && (
                <div className="flex justify-between">
                  <dt className="text-mid">Original invoice</dt>
                  <dd>
                    <Link href={`/invoices/${note.originalInvoiceId}`} className="text-amber font-bold uppercase text-ui-2xs tracking-widest no-underline">
                      View invoice →
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-sidebar text-white p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 text-left">
              <h4 className="text-amber-bright font-ui text-lg font-bold mb-3">Ledger Effect</h4>
              <p className="text-sidebar-muted text-sm leading-relaxed">
                This credit note debits revenue and GST input accounts and credits receivables,
                reducing the customer's outstanding balance. The reversing entry is
                visible in the journal with reference <span className="font-mono text-amber-bright">credit_note</span>.
              </p>
              <div className="mt-4 flex items-center gap-2 text-ui-2xs uppercase font-bold tracking-widest text-amber-bright">
                <Icon name="verified_user" className="text-sm" />
                Posted to ledger
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
            <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
              <h3 className="font-ui text-lg font-bold text-dark">Totals</h3>
            </div>
            <dl className="p-6 space-y-3 font-ui text-ui-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between">
                  <dt className="text-mid">{r.label}</dt>
                  <dd className="font-mono text-mid">{inr(r.value)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border-subtle pt-3">
                <dt className="font-bold text-dark">Grand total</dt>
                <dd className="font-mono font-bold text-dark">{inr(note.grandTotal)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
