"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LineDraft {
  accountId: string;
  description: string;
  quantity: string;
  rate: string;
  gstRate: string;
}

export default function NewBillPage() {
  const router = useRouter();
  const { data: vendors } = api.payables.vendorAccounts.useQuery(undefined, { staleTime: 30_000 });
  const { data: accounts } = api.accounts.list.useQuery(undefined, { staleTime: 30_000 });

  const expenseAccounts = (accounts ?? []).filter((a: { kind: string }) => a.kind === "Expense" || a.kind === "Asset");
  const vendorOptions = (vendors ?? []) as { id: string; name: string }[];

  const [vendorAccountId, setVendorAccountId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorGstin, setVendorGstin] = useState("");
  const [vendorState, setVendorState] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ accountId: "", description: "", quantity: "1", rate: "", gstRate: "18" }]);
  const [busy, setBusy] = useState(false);

  const createMutation = api.payables.create.useMutation({
    onSuccess: (res) => {
      setBusy(false);
      showToast.success(`Bill recorded for ${inr(res.grandTotal)}.`);
      router.push(`/payables/${res.billId}`);
    },
    onError: (e) => { setBusy(false); showToast.error(e.message); },
  });

  const inr = (v: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(v));

  const selectVendor = (id: string) => {
    setVendorAccountId(id);
    const v = vendorOptions.find((x) => x.id === id);
    if (v) setVendorName(v.name);
  };

  const submit = () => {
    if (!vendorAccountId || !vendorName.trim()) { showToast.error("Select a vendor account."); return; }
    if (!billNumber.trim()) { showToast.error("Bill number is required."); return; }
    if (!dueDate) { showToast.error("Due date is required."); return; }
    const valid = lines.filter((l) => l.accountId && l.description.trim() && l.rate);
    if (!valid.length) { showToast.error("Add at least one line with account, description and rate."); return; }
    setBusy(true);
    createMutation.mutate({
      billNumber: billNumber.trim(),
      vendorAccountId,
      vendorName: vendorName.trim(),
      vendorGstin: vendorGstin.trim() || undefined,
      vendorState: vendorState.trim() || undefined,
      billDate,
      dueDate,
      narration: narration.trim() || undefined,
      lines: valid.map((l) => ({
        accountId: l.accountId,
        description: l.description.trim(),
        quantity: Number(l.quantity) || 1,
        unitPrice: Number(l.rate) || 0,
        gstRate: Number(l.gstRate) || 0,
      })),
    });
  };

  // Live totals preview — the form shows real numbers before submit.
  const previewLines = lines.filter((l) => l.rate);
  const previewSubtotal = previewLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.rate) || 0), 0);
  const previewTax = previewLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.rate) || 0) * (Number(l.gstRate) || 0) / 100, 0);
  const previewGrand = previewSubtotal + previewTax;
  return (
    <div className="space-y-10 text-left max-w-4xl">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Payables · Bills"
            title="New Vendor Bill"
            description="Record a purchase bill — the ledger debits expense accounts and credits the vendor payable."
          />
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/payables" className="btn btn-secondary no-underline">Cancel</Link>
          <Button onClick={submit} disabled={busy}>Record Bill</Button>
        </div>
      </header>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
          <h3 className="font-ui text-lg font-bold text-dark">Vendor & Dates</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="bill-vendor" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Vendor (payable account)</label>
            <Select id="bill-vendor" value={vendorAccountId} onChange={(e) => selectVendor(e.target.value)}>
              <option value="">Select vendor…</option>
              {vendorOptions.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </div>
          <div>
            <label htmlFor="bill-number" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Bill number</label>
            <Input id="bill-number" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} placeholder="INV-2026-001" />
          </div>
          <div>
            <label htmlFor="bill-vendor-state" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Vendor state (GST name, e.g. maharashtra)</label>
            <Input id="bill-vendor-state" value={vendorState} onChange={(e) => setVendorState(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bill-vendor-gstin" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Vendor GSTIN</label>
            <Input id="bill-vendor-gstin" value={vendorGstin} onChange={(e) => setVendorGstin(e.target.value)} className="font-mono" />
          </div>
          <div>
            <label htmlFor="bill-date" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Bill date</label>
            <Input id="bill-date" type="date" className="font-mono" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bill-due" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Due date</label>
            <Input id="bill-due" type="date" className="font-mono" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
          <h3 className="font-ui text-lg font-bold text-dark">Lines</h3>
          <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Expense / asset accounts get debited; tax computed from vendor state</p>
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
                    <Select value={line.accountId} onChange={(e) => { const n = [...lines]; n[i].accountId = e.target.value; setLines(n); }} aria-label={`Line ${i + 1} account`} className="h-8 px-2">
                      <option value="">Select account…</option>
                      {expenseAccounts.map((a: { id: string; name: string }) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                  </td>
                  <td className="py-4 px-6">
                    <Input value={line.description} onChange={(e) => { const n = [...lines]; n[i].description = e.target.value; setLines(n); }} placeholder="Description" className="h-8 px-2" />
                  </td>
                  <td className="py-4 px-6">
                    <Input type="number" aria-label="Quantity" value={line.quantity} onChange={(e) => { const n = [...lines]; n[i].quantity = e.target.value; setLines(n); }} className="h-8 px-2 font-mono" />
                  </td>
                  <td className="py-4 px-6">
                    <Input type="number" aria-label="Rate" value={line.rate} onChange={(e) => { const n = [...lines]; n[i].rate = e.target.value; setLines(n); }} placeholder="0.00" className="h-8 px-2 font-mono" />
                  </td>
                  <td className="py-4 px-6">
                    <Select value={line.gstRate} onChange={(e) => { const n = [...lines]; n[i].gstRate = e.target.value; setLines(n); }} aria-label={`Line ${i + 1} GST rate`} className="h-8 px-2">
                      {["0", "5", "12", "18", "28"].map((r) => <option key={r} value={r}>{r}%</option>)}
                    </Select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length === 1} className="text-danger hover:text-danger-bg font-bold uppercase text-ui-2xs tracking-widest border-none bg-transparent cursor-pointer disabled:opacity-40">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border-subtle">
          <button onClick={() => setLines([...lines, { accountId: "", description: "", quantity: "1", rate: "", gstRate: "18" }])} className="text-amber text-ui-xs font-bold uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">+ Add Line</button>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-md p-5 shadow-sm flex flex-wrap items-center justify-end gap-6 font-ui">
        <div className="text-right">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">Subtotal</p>
          <p className="font-mono text-ui-sm text-dark mt-0.5">{formatIndianNumber(previewSubtotal)}</p>
        </div>
        <div className="text-right">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">GST</p>
          <p className="font-mono text-ui-sm text-mid mt-0.5">{formatIndianNumber(previewTax)}</p>
        </div>
        <div className="text-right">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">Grand total</p>
          <p className="font-mono text-lg font-bold text-dark mt-0.5">{formatIndianNumber(previewGrand)}</p>
        </div>
      </div>
    </div>
  );
}
