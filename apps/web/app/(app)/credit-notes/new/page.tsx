"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";

interface LineDraft {
  accountId: string;
  description: string;
  quantity: string;
  rate: string;
  gstRate: string;
}

interface InvoiceOption {
  id: string;
  invoiceNumber: string;
  customerName: string;
  grandTotal: string;
}

export default function NewCreditNotePage() {
  const router = useRouter();
  const { data: accounts } = api.accounts.list.useQuery(undefined, { staleTime: 30_000 });
  const { data: invoices } = api.invoices.list.useQuery({ page: 1, pageSize: 100 }, { staleTime: 30_000 });

  const revenueAccounts = (accounts ?? []).filter((a: { kind: string }) => a.kind === "Revenue");
  const invoiceOptions: InvoiceOption[] = (invoices?.invoices ?? []).map((i: any) => ({
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    customerName: i.customerName,
    grandTotal: i.grandTotal,
  }));

  const [originalInvoiceId, setOriginalInvoiceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ accountId: "", description: "", quantity: "1", rate: "", gstRate: "18" }]);
  const [busy, setBusy] = useState(false);

  const selectInvoice = (id: string) => {
    setOriginalInvoiceId(id);
    const inv = invoiceOptions.find((i) => i.id === id);
    if (inv) {
      setCustomerName(inv.customerName);
    }
  };

  const createMutation = api.creditNotes.create.useMutation({
    onSuccess: (res) => {
      setBusy(false);
      showToast.success(`Credit note ${res.creditNoteNumber} created.`);
      router.push(`/credit-notes/${res.creditNoteId}`);
    },
    onError: (e) => {
      setBusy(false);
      showToast.error(e.message);
    },
  });

  const submit = () => {
    if (!customerName.trim()) {
      showToast.error("Customer name is required.");
      return;
    }
    if (!reason.trim()) {
      showToast.error("Reason is required.");
      return;
    }
    const validLines = lines.filter((l) => l.accountId && l.description.trim() && l.rate);
    if (validLines.length === 0) {
      showToast.error("Add at least one line with account, description and rate.");
      return;
    }
    setBusy(true);
    createMutation.mutate({
      originalInvoiceId: originalInvoiceId || undefined,
      date,
      customerName: customerName.trim(),
      customerGstin: customerGstin.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      reason: reason.trim(),
      lines: validLines.map((l) => ({
        accountId: l.accountId,
        description: l.description.trim(),
        quantity: Number(l.quantity) || 1,
        unitPrice: Number(l.rate) || 0,
        gstRate: Number(l.gstRate) || 0,
      })),
    });
  };

  return (
    <div className="space-y-10 text-left max-w-4xl">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Invoicing · Credit Notes"
            title="New Credit Note"
            description="Reverses revenue and tax against an invoice or a customer's outstanding balance."
          />
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/credit-notes" className="btn-secondary no-underline">Cancel</Link>
          <button onClick={submit} disabled={busy} className="btn-primary">Create Credit Note</button>
        </div>
      </header>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
          <h3 className="font-ui text-lg font-bold text-dark">Header</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="cn-invoice" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Original invoice (optional)</label>
            <select
              id="cn-invoice"
              value={originalInvoiceId}
              onChange={(e) => selectInvoice(e.target.value)}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <option value="">Standalone credit note…</option>
              {invoiceOptions.map((i) => (
                <option key={i.id} value={i.id}>{i.invoiceNumber} — {i.customerName}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cn-date" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Date</label>
            <input
              id="cn-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
          <div>
            <label htmlFor="cn-customer" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Customer name</label>
            <input
              id="cn-customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
          <div>
            <label htmlFor="cn-gstin" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Customer GSTIN</label>
            <input
              id="cn-gstin"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value)}
              placeholder="15 characters"
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cn-reason" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Reason</label>
            <input
              id="cn-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Return of goods, price correction"
              className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
          <h3 className="font-ui text-lg font-bold text-dark">Lines</h3>
          <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Revenue accounts get debited; GST input is reversed per tax rate</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                <th className="py-4 px-6 min-w-[220px]">Account</th>
                <th className="py-4 px-6 min-w-[180px]">Description</th>
                <th className="py-4 px-6 w-20">Qty</th>
                <th className="py-4 px-6 w-32">Unit price</th>
                <th className="py-4 px-6 w-24">GST%</th>
                <th className="py-4 px-6 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
              {lines.map((line, i) => (
                <tr key={i}>
                  <td className="py-4 px-6">
                    <select
                      value={line.accountId}
                      onChange={(e) => { const n = [...lines]; n[i].accountId = e.target.value; setLines(n); }}
                      aria-label={`Line ${i + 1} account`}
                      className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <option value="">Select account…</option>
                      {revenueAccounts.map((a: { id: string; name: string }) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <input
                      value={line.description}
                      onChange={(e) => { const n = [...lines]; n[i].description = e.target.value; setLines(n); }}
                      placeholder="Description"
                      className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => { const n = [...lines]; n[i].quantity = e.target.value; setLines(n); }}
                      className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="number"
                      value={line.rate}
                      onChange={(e) => { const n = [...lines]; n[i].rate = e.target.value; setLines(n); }}
                      placeholder="0.00"
                      className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={line.gstRate}
                      onChange={(e) => { const n = [...lines]; n[i].gstRate = e.target.value; setLines(n); }}
                      aria-label={`Line ${i + 1} GST rate`}
                      className="w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {["0", "5", "12", "18", "28"].map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setLines(lines.filter((_, j) => j !== i))}
                      disabled={lines.length === 1}
                      className="text-danger hover:text-danger-bg font-bold uppercase text-ui-2xs tracking-widest border-none bg-transparent cursor-pointer disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border-subtle">
          <button
            onClick={() => setLines([...lines, { accountId: "", description: "", quantity: "1", rate: "", gstRate: "18" }])}
            className="text-amber text-ui-xs font-bold uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer"
          >
            + Add Line
          </button>
        </div>
      </div>
    </div>
  );
}
