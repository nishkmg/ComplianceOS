"use client";

import { useState, useRef } from "react";
import { isValidGSTIN } from "@complianceos/shared";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useOptimisticCreate } from "@/lib/hooks/useOptimisticMutation";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatIndianNumber } from "@/lib/format";

interface ItemDraft {
  description: string;
  quantity: string;
  rate: string;
  hsnCode: string;
  gstRate: string;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const LIST_INPUT = { page: 1, pageSize: 50 } as const;

type InvoiceListData = {
  invoices: Array<{ id: string } & Record<string, unknown>>;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerGstinTouched, setCustomerGstinTouched] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(addDays(new Date().toISOString().split("T")[0], 30));
  const [items, setItems] = useState<ItemDraft[]>([{ description: "", quantity: "1", rate: "", hsnCode: "", gstRate: "18" }]);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const createInvoice = api.invoices.create.useMutation();

  const { run: createWithOptimistic, saving: hookSaving } = useOptimisticCreate<
    Parameters<typeof createInvoice.mutateAsync>[0],
    InvoiceListData,
    { id: string; customerName: string; date: string; dueDate: string; grandTotal?: string | number; status?: string }
  >(
    createInvoice as unknown as { mutateAsync: (vars: Parameters<typeof createInvoice.mutateAsync>[0]) => Promise<{ id: string; customerName: string; date: string; dueDate: string; grandTotal?: string | number; status?: string }> },
    {
      list: (utils) => {
        const proc = utils.invoices.list;
        return {
          cancel: () => proc.cancel(LIST_INPUT),
          getData: () => proc.getData(LIST_INPUT) as InvoiceListData | undefined,
          setData: (updater) => proc.setData(LIST_INPUT, updater as never),
          invalidate: () => proc.invalidate(LIST_INPUT),
        };
      },
      buildOptimistic: (vars) => {
        const tempId = `temp-${Date.now()}`;
        return {
          tempId,
          row: {
            id: tempId,
            invoiceNumber: "—",
            customerName: vars.customerName,
            date: vars.date,
            dueDate: vars.dueDate,
            grandTotal: "0",
            status: "draft" as const,
          },
        };
      },
      applyOptimistic: (current, row) => ({
        ...current,
        invoices: [row as InvoiceListData["invoices"][number], ...current.invoices],
      }),
      replaceOptimistic: (current, tempId, real) => ({
        ...current,
        invoices: current.invoices.map((r) => (r.id === tempId ? { ...r, ...real } as InvoiceListData["invoices"][number] : r)),
      }),
      extraInvalidations: (utils) => [
        () => utils.balances.trialBalance.invalidate() as Promise<unknown>,
      ],
      successMessage: "Invoice created",
      redirectTo: (real) => `/invoices/${real.id}`,
    },
  );

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!customerName.trim()) { showToast.error("Customer name is required."); return; }
    const validItems = items.filter(i => i.description.trim() && i.rate);
    if (validItems.length === 0) { showToast.error("At least one line with description and rate is required."); return; }
    if (customerGstinInvalid) { showToast.error("Customer GSTIN is invalid."); return; }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await createWithOptimistic({
        date,
        dueDate,
        customerName: customerName.trim(),
        ...(customerState.trim() ? { customerState: customerState.trim() } : {}),
        ...(customerGstinNormalized ? { customerGstin: customerGstinNormalized } : {}),
        items: validItems.map(i => ({
          description: i.description.trim(),
          quantity: Number(i.quantity) || 1,
          rate: Number(i.rate) || 0,
          ...(i.hsnCode.trim() ? { hsnCode: i.hsnCode.trim() } : {}),
          ...(i.gstRate ? { gstRate: Number(i.gstRate) } : {}),
        })),
      } as Parameters<typeof createInvoice.mutateAsync>[0]);
    } catch {
      // toast already shown by hook
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const saving = submitting || hookSaving;

  const customerGstinNormalized = customerGstin.trim().toUpperCase();
  const customerGstinInvalid = customerGstinNormalized !== "" && !isValidGSTIN(customerGstinNormalized);

  // Live totals preview — the form shows real numbers before submit.
  const previewLines = items.filter((l) => l.rate);
  const previewSubtotal = previewLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.rate) || 0), 0);
  const previewTax = previewLines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.rate) || 0) * (Number(l.gstRate) || 0) / 100, 0);
  const previewGrand = previewSubtotal + previewTax;
  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} aria-label="Go back" className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" ><Icon name="arrow_back" size={20} /></button>
          <PageHeader title="New Invoice" />
        </div>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating…" : "Create Invoice"}
        </Button>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="invoice-customer-name" className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Customer Name</label>
            <Input id="invoice-customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="invoice-customer-state" className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Customer State (optional)</label>
            <Input id="invoice-customer-state" value={customerState} onChange={e => setCustomerState(e.target.value)} placeholder="e.g. Maharashtra" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="invoice-customer-gstin" className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Customer GSTIN (optional)</label>
            <Input
              id="invoice-customer-gstin"
              className="font-mono"
              value={customerGstin}
              onChange={e => { setCustomerGstin(e.target.value.toUpperCase()); setCustomerGstinTouched(true); }}
              onBlur={() => setCustomerGstinTouched(true)}
              placeholder="e.g. 27AAPFU0939F1ZV"
            />
            {customerGstinInvalid && customerGstinTouched && (
              <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">Invalid GSTIN: 15 chars, valid checksum required</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="invoice-date" className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Date</label>
            <Input id="invoice-date" type="date" className="font-mono" value={date} onChange={e => { setDate(e.target.value); setDueDate(addDays(e.target.value, 30)); }} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="invoice-due-date" className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Due Date</label>
            <Input id="invoice-due-date" type="date" className="font-mono" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-3">
            <Input className="col-span-4 h-8" aria-label={`Item description (line ${i + 1})`} placeholder="Description" value={it.description} onChange={e => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} />
            <Input type="number" className="col-span-1 h-8 font-mono" aria-label={`Quantity (line ${i + 1})`} placeholder="Qty" value={it.quantity} onChange={e => { const n = [...items]; n[i].quantity = e.target.value; setItems(n); }} />
            <Input type="number" className="col-span-2 h-8 font-mono" placeholder="Rate" value={it.rate} onChange={e => { const n = [...items]; n[i].rate = e.target.value; setItems(n); }} />
            <Input className="col-span-3 h-8 font-mono" placeholder="HSN Code" value={it.hsnCode} onChange={e => { const n = [...items]; n[i].hsnCode = e.target.value; setItems(n); }} />
            <Input type="number" className="col-span-2 h-8 font-mono" placeholder="GST%" value={it.gstRate} onChange={e => { const n = [...items]; n[i].gstRate = e.target.value; setItems(n); }} />
          </div>
        ))}
        <button onClick={() => setItems([...items, { description: "", quantity: "1", rate: "", hsnCode: "", gstRate: "18" }])} className="text-amber text-ui-xs font-bold uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">+ Add Line</button>
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
