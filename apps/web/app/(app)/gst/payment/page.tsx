"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

interface ChallanDetail {
  taxType: string;
  taxableValue: number;
  interestAmount: number;
  penaltyAmount: number;
  totalAmount: number;
}

interface ChallanData {
  challanNumber: string;
  challanDate: string;
  taxPeriod: { month: number; year: number };
  fiscalYear: string;
  totalAmount: number;
  breakdown: ChallanDetail[];
  status: string;
}

export default function GstPaymentPage() {
  const utils = api.useUtils();
  const now = new Date();
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [challan, setChallan] = useState<ChallanData | null>(null);
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [bankName, setBankName] = useState("");
  const [cin, setCin] = useState("");

  const [month, year] = period.split("-");

  const createChallan = api.gstPayment.createChallan.useMutation({
    onSuccess: (data) => {
      setChallan(data as ChallanData);
    },
    onError: (e) => showToast.error(e.message),
  });

  const payGst = api.gstPayment.payGst.useMutation({
    onSuccess: (d) => {
      showToast.success(`Payment recorded (challan ${challan?.challanNumber ?? ""}).`);
      setChallan(null);
      setMode("online"); setBankName(""); setCin("");
      void utils.gstPayment.paymentHistory.invalidate();
      void utils.gstLedger.ledgerTransactions.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const handleGenerate = () => {
    createChallan.mutate({ periodMonth: Number(month), periodYear: Number(year) });
  };

  const handlePay = () => {
    if (!challan) return;
    if (mode === "offline" && !bankName.trim()) {
      showToast.error("Enter the bank name for offline payment.");
      return;
    }
    payGst.mutate({
      challanId: Buffer.from(JSON.stringify(challan)).toString("base64"),
      mode,
      bankName: bankName.trim() || undefined,
      cin: cin.trim() || undefined,
    });
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <PageHeader title="GST Payment" />
        <Link href="/gst/payment/history" className="inline-flex items-center gap-1.5 px-4 py-2 btn btn-primary no-underline">
          <Icon name="history" className="text-ui-md" /> Payment History
        </Link>
      </div>

      {/* Period selection */}
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-4">
        <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">1 · Select Tax Period</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-muted border border-border rounded-md h-9 px-3">
            <Icon name="calendar_month" className="text-light text-ui-xl mr-2" />
            <input
              aria-label="Tax period"
              type="month"
              className="bg-transparent border-none text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
              value={period}
              onChange={(e) => { setPeriod(e.target.value); setChallan(null); }}
            />
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={createChallan.isPending}>
            {createChallan.isPending ? "Computing…" : "Generate Challan"} <Icon name="receipt_long" />
          </Button>
        </div>
      </div>

      {createChallan.isError && (
        <div className="bg-danger-bg border border-danger/20 rounded-md p-4 font-ui text-ui-sm text-danger-deep">
          {createChallan.error.message}
        </div>
      )}

      {/* Challan preview */}
      {challan && challan.breakdown.length === 0 && (
        <EmptyState icon="gavel" title="No liability for this period" description="Generate the GSTR-3B and run reconciliation first — there is nothing to pay for {month}/{year}." />
      )}

      {challan && challan.breakdown.length > 0 && (
        <>
          <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface-muted border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">2 · Challan Preview</h3>
                <p className="font-mono text-ui-2xs text-mid mt-1">{challan.challanNumber} · {challan.challanDate} · FY {challan.fiscalYear}</p>
              </div>
              <p className="font-mono text-ui-md font-bold text-dark">{formatIndianNumber(challan.totalAmount)}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                    <th className="py-3 px-6">Tax Type</th>
                    <th className="py-3 px-6 text-right">Tax</th>
                    <th className="py-3 px-6 text-right">Interest</th>
                    <th className="py-3 px-6 text-right">Penalty</th>
                    <th className="py-3 px-6 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                  {challan.breakdown.map((b) => (
                    <tr key={b.taxType} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-3 px-6 font-ui text-ui-sm font-bold text-dark uppercase">{b.taxType}</td>
                      <td className="py-3 px-6 text-right tabular-nums">{formatIndianNumber(b.taxableValue)}</td>
                      <td className="py-3 px-6 text-right tabular-nums">{formatIndianNumber(b.interestAmount)}</td>
                      <td className="py-3 px-6 text-right tabular-nums">{formatIndianNumber(b.penaltyAmount)}</td>
                      <td className="py-3 px-6 text-right font-bold tabular-nums">{formatIndianNumber(b.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment details */}
          <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
            <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">3 · Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Payment Mode</span>
                <div className="flex bg-surface-muted border border-border rounded-md p-1 w-fit">
                  <button
                    onClick={() => setMode("online")}
                    className={`px-4 py-1.5 text-ui-xs font-ui font-medium rounded-sm transition-colors cursor-pointer border-none ${mode === "online" ? "bg-surface text-dark shadow-sm" : "text-mid hover:text-dark bg-transparent"}`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => setMode("offline")}
                    className={`px-4 py-1.5 text-ui-xs font-ui font-medium rounded-sm transition-colors cursor-pointer border-none ${mode === "offline" ? "bg-surface text-dark shadow-sm" : "text-mid hover:text-dark bg-transparent"}`}
                  >
                    Offline (Challan)
                  </button>
                </div>
              </div>
              {mode === "offline" ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="gst-bank" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Bank Name</label>
                    <input id="gst-bank" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-ui text-sm" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="gst-cin" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">CIN (optional)</label>
                    <input id="gst-cin" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-mono text-sm" value={cin} onChange={(e) => setCin(e.target.value)} placeholder="Challan identification number" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <label htmlFor="gst-bank-online" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Bank Name</label>
                  <input id="gst-bank-online" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-ui text-sm" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
                </div>
              )}
            </div>
            <Button onClick={handlePay} disabled={payGst.isPending}>
              {payGst.isPending ? "Recording…" : "Record Payment"} <Icon name="check_circle" />
            </Button>
          </div>
        </>
      )}

      {!challan && (
        <Link href="/gst/payment/history" className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
          <Icon name="history" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark mb-2">Payment History</h3>
          <p className="font-ui text-ui-sm text-mid">View all challan payments made to the GST portal.</p>
        </Link>
      )}
    </div>
  );
}
