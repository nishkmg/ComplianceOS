"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useModules } from "@/hooks/use-modules";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function NewPaymentPage() {
  const { activeFy } = useFiscalYear();
  const { gstConfig } = useModules();
  const router = useRouter();
  const utils = api.useUtils();
  const [type, setType] = useState<"receipt" | "payment">("receipt");
  const [customerName, setCustomerName] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [tdsAmount, setTdsAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);

  const recordPayment = api.payments.record.useMutation();

  const hasContent = useMemo(
    () => customerName || referenceNumber || paymentAmount,
    [customerName, referenceNumber, paymentAmount]
  );

  useEffect(() => {
    if (!hasContent || saving) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasContent, saving]);

  const handleRecord = async () => {
    if (savingRef.current) return;
    if (!customerName.trim()) { showToast.error("Party name is required."); return; }
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) { showToast.error("Amount must be greater than zero."); return; }
    setSaving(true);
    savingRef.current = true;
    const payListInput = { page: 1, pageSize: 100 };
    const previousPayList = utils.payments.list.getData(payListInput);
    const tempPayId = `temp-${Date.now()}`;
    await utils.payments.list.cancel(payListInput);
    const payApply = (old: unknown) => {
      const cur = (old as { items?: Array<Record<string, unknown>> } | undefined);
      const items = cur?.items ?? [];
      const tempRow: Record<string, unknown> = {
        id: tempPayId,
        customerName: customerName.trim(),
        date: paymentDate,
        amount: String(amt),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || null,
        type,
      };
      return { ...(cur ?? {}), items: [tempRow, ...items] };
    };
    utils.payments.list.setData(payListInput, payApply as never);
    try {
      await recordPayment.mutateAsync({
        date: paymentDate,
        customerName: customerName.trim(),
        amount: amt,
        paymentMethod: paymentMethod as "cash" | "bank" | "online" | "cheque",
        referenceNumber: referenceNumber.trim() || undefined,
        allocations: [],
      });
      showToast.success("Payment recorded successfully");
      await Promise.all([
        utils.payments.list.invalidate(payListInput),
        utils.balances.trialBalance.invalidate(),
      ]);
      router.refresh();
      router.push("/payments");
    } catch (err: any) {
      utils.payments.list.setData(payListInput, (() => previousPayList) as never);
      showToast.error(err.message || "Failed to record payment");
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  const handleDiscard = () => {
    if (hasContent && !discardConfirm) { setDiscardConfirm(true); return; }
    setDiscardConfirm(false);
    router.back();
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleDiscard}
            className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <div>
            <PageHeader title="Record Transaction" />
            <p className="font-ui text-ui-xs text-secondary mt-0.5">
              Record incoming or outgoing payments. FY {activeFy}
              {gstConfig.tdsApplicable ? " · TDS applicable" : ""}
              {gstConfig.gstRegistration === "none" ? " · GST not registered" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDiscard}
          >
            Discard
          </Button>
          <Button
            onClick={handleRecord}
            disabled={saving || !paymentAmount}
          >
            {saving ? "Saving…" : "Commit to Ledger"}
          </Button>
        </div>
      </div>

      {discardConfirm && (
        <div className="bg-amber-soft border border-amber-bright/30 px-4 py-3 rounded-md flex items-center justify-between">
          <span className="font-ui text-ui-xs text-amber font-medium">Unsaved changes will be lost. Discard?</span>
          <div className="flex gap-2">
            <button onClick={() => setDiscardConfirm(false)} className="px-3 py-1 text-ui-xs font-ui font-bold uppercase tracking-widest border border-border rounded-sm bg-surface cursor-pointer">Keep Editing</button>
            <button onClick={() => { setDiscardConfirm(false); router.back(); }} className="px-3 py-1 text-ui-xs font-ui font-bold uppercase tracking-widest bg-danger text-white rounded-sm cursor-pointer border-none">Discard</button>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border p-6 rounded-md shadow-sm">
        <div className="h-[2px] w-full bg-amber -mt-6 mb-6" />
        <h3 className="font-ui text-ui-2xs text-amber uppercase tracking-widest mb-5 border-b border-border pb-2 font-bold">Classification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: "receipt" as const, title: "Payment Receipt", desc: "Recording funds received from a customer or client against invoices." },
            { value: "payment" as const, title: "Vendor Payment", desc: "Recording outward payments to suppliers or statutory bodies." },
          ].map(opt => (
            <div
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`relative p-5 border rounded-md cursor-pointer transition-colors transition-shadow ${
                type === opt.value
                  ? "border-amber bg-amber-soft ring-1 ring-amber"
                  : "border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-ui text-ui-sm font-bold text-dark">{opt.title}</span>
                <Icon
                  name={type === opt.value ? "radio_button_checked" : "radio_button_unchecked"}
                  size={18}
                  className={type === opt.value ? "text-amber shrink-0" : "text-lighter shrink-0"}
                />
              </div>
              <p className="font-ui text-ui-xs text-mid leading-relaxed">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border p-6 rounded-md shadow-sm">
        <h3 className="font-ui text-ui-2xs text-mid uppercase tracking-widest mb-5 border-b border-border pb-2 font-bold">Voucher Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1">
            <label htmlFor="payment-party" className="block font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Entity / Party Name</label>
            <Input id="payment-party"
              placeholder="Search customer or vendor..."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="payment-date" className="block font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Payment Date</label>
            <Input
              id="payment-date"
              type="date"
              className="font-mono"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="payment-mode" className="block font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Payment Mode</label>
            <Select id="payment-mode"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="online">Online Transfer / NEFT</option>
              <option value="bank">Cheque Deposit</option>
              <option value="cash">Cash in Hand</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="payment-ref" className="block font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Reference / UTR</label>
            <Input id="payment-ref"
              className="font-mono uppercase"
              placeholder="T241024…"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label htmlFor="payment-amount" className="block font-ui text-ui-2xs text-amber uppercase tracking-widest font-bold">Amount Transacted (₹)</label>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              className="h-11 font-mono text-xl font-bold"
              placeholder="0.00"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
            />
          </div>
        </div>
        </div>

        {gstConfig.tdsApplicable && (
          <div className="bg-surface border border-border rounded-md p-6 space-y-4">
            <h3 className="font-ui text-ui-2xs font-bold text-dark uppercase tracking-widest">TDS Deduction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">TDS Amount (₹)</label>
                <Input
                  type="number"
                  min="0"
                  className="font-mono"
                  placeholder="0.00"
                  value={tdsAmount}
                  onChange={e => setTdsAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">TDS Rate (%)</label>
                <div className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-mid">
                  {type === "payment" ? "2.00" : "N/A"}
                </div>
              </div>
            </div>
            {type === "receipt" && (
              <p className="font-ui text-ui-xs text-mid italic">TDS deduction typically applies on payments made, not receipts.</p>
            )}
          </div>
        )}

      {parseFloat(paymentAmount || "0") > 0 && (
        <div className="bg-amber-soft border border-amber/30 p-6 flex flex-col md:flex-row justify-between items-center gap-4 rounded-md shadow-sm">
          <div>
            <h4 className="font-ui text-ui-2xs font-bold text-amber uppercase tracking-widest mb-1">Allocation Required</h4>
            <p className="font-ui text-ui-xs text-amber leading-relaxed">
              This {type} will be recorded as an unallocated credit/debit on the party ledger until matched against specific invoices.
            </p>
          </div>
          <button onClick={() => showToast.info("Allocation wizard will open once invoices are selected.")} className="px-6 py-2.5 border border-amber text-amber text-ui-2xs font-bold uppercase tracking-widest hover:bg-surface transition-colors cursor-pointer bg-transparent rounded-md whitespace-nowrap shrink-0">
            Open Allocation Wizard
          </button>
        </div>
      )}
    </div>
  );
}
