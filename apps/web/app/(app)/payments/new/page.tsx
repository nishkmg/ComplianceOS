"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Icon } from '@/components/ui/icon';

export default function NewPaymentPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [type, setType] = useState("receipt");
  const [saving, setSaving] = useState(false);

  const { data: customerData, isLoading: isLoadingCustomer } = api.receivables.customer.useQuery(
    { customerName },
    { enabled: customerName.length > 0 }
  );

  const outstandingInvoices = customerData?.outstandingInvoices ?? [];

  const handleRecord = async () => {
    if (!customerName || !paymentAmount) {
      showToast.error("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      showToast.success("Payment recorded successfully");
      router.push("/payments");
    } catch (e) {
      showToast.error("Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-0 text-left">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[0.5px] border-border-subtle flex justify-between items-center w-full px-8 py-4 -mx-8 -mt-8 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-stone-400 hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">
            <Icon name="arrow_back" />
          </button>
          <h2 className="font-display-lg text-2xl text-on-surface font-bold">Record Transaction</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold">Draft</span>
            <span className="font-mono text-on-surface font-bold italic">Unsaved Ledger</span>
          </div>
          <div className="h-8 w-[0.5px] bg-border-subtle"></div>
          <button 
            onClick={handleRecord}
            disabled={saving || !paymentAmount}
            className="bg-primary-container text-white px-6 py-2 rounded-sm font-ui-sm text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all border-none cursor-pointer shadow-sm disabled:opacity-30"
          >
            {saving ? "Saving..." : "Commit to Ledger"}
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto space-y-12 pb-12">
        {/* Classification */}
        <section className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
          <h3 className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border-subtle pb-2 font-bold">Classification</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setType("receipt")}
              className={`relative p-6 border rounded-sm cursor-pointer transition-all ${type === 'receipt' ? 'border-primary-container bg-[#fff8f4] ring-1 ring-primary-container' : 'border-border-subtle bg-white hover:bg-stone-50'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-ui-lg text-lg font-bold">Payment Receipt</span>
                <Icon name={type === 'receipt' ? 'radio_button_checked' : 'radio_button_unchecked'} className={type === 'receipt' ? 'text-primary-container' : 'text-stone-300'} />
              </div>
              <p className="font-ui-sm text-sm text-text-mid leading-relaxed">Recording funds received from a customer or client against invoices.</p>
            </div>
            <div 
              onClick={() => setType("payment")}
              className={`relative p-6 border rounded-sm cursor-pointer transition-all ${type === 'payment' ? 'border-primary-container bg-[#fff8f4] ring-1 ring-primary-container' : 'border-border-subtle bg-white hover:bg-stone-50'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-ui-lg text-lg font-bold">Vendor Payment</span>
                <Icon name={type === 'payment' ? 'radio_button_checked' : 'radio_button_unchecked'} className={type === 'payment' ? 'text-primary-container' : 'text-stone-300'} />
              </div>
              <p className="font-ui-sm text-sm text-text-mid leading-relaxed">Recording outward payments to suppliers or statutory bodies.</p>
            </div>
          </div>
        </section>

        {/* Transaction Details */}
        <section className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
           <h3 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6 border-b border-stone-50 pb-2 font-bold">Voucher Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex flex-col gap-2">
                 <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Entity / Party Name</label>
                 <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Search customer or vendor..." value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Payment Date</label>
                 <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm focus:border-primary outline-none" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Payment Mode</label>
                 <select className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 text-sm focus:border-primary outline-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="online">Online Transfer / NEFT</option>
                    <option value="bank">Cheque Deposit</option>
                    <option value="cash">Cash in Hand</option>
                 </select>
              </div>
              <div className="flex flex-col gap-2">
                 <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Reference / UTR Number</label>
                 <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm focus:border-primary outline-none uppercase" placeholder="T241024..." value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                 <label className="font-ui-xs text-[10px] text-primary-container uppercase tracking-widest font-bold">Amount Transacted (₹)</label>
                 <input className="w-full bg-white border border-primary-container rounded-sm px-4 py-4 font-mono text-2xl font-bold text-on-surface focus:ring-1 focus:ring-primary outline-none" placeholder="0.00" type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
              </div>
           </div>
        </section>

        {/* Allocation Info (Mock) */}
        {parseFloat(String(paymentAmount)) > 0 && (
          <div className="bg-[#fff8f4] border border-amber/30 p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm animate-in">
             <div className="text-left flex-1">
                <h4 className="font-ui-lg text-lg font-bold text-on-surface mb-2 uppercase tracking-widest text-[10px] text-amber-900">Allocation Required</h4>
                <p className="font-ui-sm text-sm text-amber-800 leading-relaxed">This {type} will be recorded as an unallocated credit/debit on the party ledger until matched against specific invoices.</p>
             </div>
             <button className="px-8 py-3 border border-amber-600 text-amber-700 font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-white transition-all cursor-pointer bg-transparent rounded-sm whitespace-nowrap">
                Open Allocation Wizard
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
