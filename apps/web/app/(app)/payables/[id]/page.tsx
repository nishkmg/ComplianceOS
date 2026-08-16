"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { api } from "@/lib/api";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inr = (v: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v));

export default function BillDetailPage() {
  const params = useParams<{ id: string }>();
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", date: new Date().toISOString().slice(0, 10), paymentAccountId: "", narration: "" });
  const [busy, setBusy] = useState(false);

  const utils = api.useUtils();
  const { data: bill, isLoading } = api.payables.get.useQuery({ id: params.id });
  const { data: accounts } = api.accounts.list.useQuery(undefined, { staleTime: 30_000 });

  const payMutation = api.payables.pay.useMutation({
    onSuccess: () => {
      showToast.success("Payment recorded.");
      setPayOpen(false);
      setBusy(false);
      void utils.payables.get.invalidate();
      void utils.payables.list.invalidate();
      void utils.payables.aging.invalidate();
    },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });

  if (isLoading) return <div className="text-mid font-ui text-ui-sm">Loading bill…</div>;
  if (!bill) return notFound();

  const bankAccounts = (accounts ?? []).filter((a: { kind: string }) => a.kind === "Asset");

  const confirmPay = () => {
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) { showToast.error("Enter a payment amount."); return; }
    if (!payForm.paymentAccountId) { showToast.error("Select the payment account."); return; }
    setBusy(true);
    payMutation.mutate({
      billId: bill.id,
      amount,
      date: payForm.date,
      paymentAccountId: payForm.paymentAccountId,
      narration: payForm.narration || undefined,
    });
  };

  const rows = [
    { label: "Subtotal", value: bill.subtotal },
    { label: "CGST", value: bill.cgstTotal },
    { label: "SGST", value: bill.sgstTotal },
    { label: "IGST", value: bill.igstTotal },
  ];

  return (
    <div className="space-y-10 text-left max-w-4xl">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Payables · Bills"
            title={`${bill.vendorName} · ${bill.billNumber}`}
            description={`Billed ${fmtDate(bill.billDate)} · due ${fmtDate(bill.dueDate)}`}
          />
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/payables" className={buttonVariants({ variant: "outline" })}>← All bills</Link>
          {bill.status !== "paid" && (
            <Button onClick={() => setPayOpen(true)}>Record Payment</Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
            <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
              <h3 className="font-ui text-lg font-bold text-dark">Lines</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-right">Qty</th>
                    <th className="py-4 px-6 text-right">Rate</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                    <th className="py-4 px-6 text-right">GST%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
                  {(bill.lines ?? []).map((l: any) => (
                    <tr key={l.id}>
                      <td className="py-5 px-6 text-dark">{l.description}</td>
                      <td className="py-5 px-6 text-right font-mono text-mid">{l.quantity}</td>
                      <td className="py-5 px-6 text-right font-mono text-mid">{l.unitPrice}</td>
                      <td className="py-5 px-6 text-right font-mono text-dark">{inr(l.amount)}</td>
                      <td className="py-5 px-6 text-right font-mono text-mid">{l.gstRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-sidebar text-white p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 text-left">
              <h4 className="text-amber-bright font-ui text-lg font-bold mb-3">Ledger Effect</h4>
              <p className="text-sidebar-muted text-sm leading-relaxed">
                The bill debits expense accounts and credits {bill.vendorName}. Payments debit the vendor
                payable and credit your bank — aging updates automatically.
              </p>
              <div className="mt-4 flex items-center gap-2 text-ui-2xs uppercase font-bold tracking-widest text-amber-bright">
                <Icon name="verified_user" className="text-sm" /> Posted to ledger
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
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
                <dd className="font-mono font-bold text-dark">{inr(bill.grandTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mid">Paid</dt>
                <dd className="font-mono text-success-deep">{inr(bill.paidAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-bold text-dark">Outstanding</dt>
                <dd className="font-mono font-bold text-danger">{inr(bill.outstanding)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
      <DialogContent className="max-w-md">
            <h3 className="font-ui text-base font-semibold text-dark">Record payment</h3>
            <p className="mt-1 font-ui text-ui-sm text-mid">Outstanding: {inr(bill.outstanding)}</p>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="pay-amount" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Amount</label>
                <input id="pay-amount" type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
              </div>
              <div>
                <label htmlFor="pay-account" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Payment account</label>
                <select id="pay-account" value={payForm.paymentAccountId} onChange={(e) => setPayForm({ ...payForm, paymentAccountId: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <option value="">Select account…</option>
                  {bankAccounts.map((a: { id: string; name: string }) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pay-date" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Date</label>
                <input id="pay-date" type="date" value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={confirmPay} disabled={busy}>Record Payment</Button>
            </div>
      </DialogContent>
      </Dialog>
    </div>
  );
}
