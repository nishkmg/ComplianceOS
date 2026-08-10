"use client";

import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

export default function ITRReturnDetailPage() {
  const params = useParams();
  const id = params.returnId as string;
  const fy = params.financialYear as string;
  const { activeFy } = useFiscalYear();

  const ay = fy ? `${Number(fy.split("-")[0]) + 1}-${fy.split("-")[1]}` : "2027-28";

  return (
    <div className="space-y-0 text-left">
      {/* Header Area */}
      <header className="bg-surface border-b-[0.5px] border-border px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6 -mx-8 -mt-8 mb-8 sticky top-0 z-20 backdrop-blur-sm bg-surface/50">
        <div>
          <div className="flex items-center gap-2 font-ui text-ui-2xs text-light mb-2 uppercase tracking-widest">
            <Link className="hover:text-primary transition-colors no-underline" href="/itr/returns">Returns</Link>
            <Icon name="chevron_right" className="text-ui-md" />
            <span className="text-dark font-bold">ITR Detail</span>
          </div>
          <h1 className="font-ui text-display-lg font-semibold text-dark">Financial Year {fy || activeFy}</h1>
          <p className="font-ui text-ui-sm text-secondary mt-1">Assessment Year: {ay} | PAN: ABCDE1234F</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`/api/itr/returns/${id}/pdf?format=summary`, '_blank')} className="border border-border text-dark px-3 py-2 font-ui text-ui-xs font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent rounded-sm">
            <Icon name="download" className="text-ui-md" />
            Summary
          </button>
          <button onClick={() => window.open(`/api/itr/returns/${id}/pdf?format=itr-v`, '_blank')} className="border border-border text-dark px-3 py-2 font-ui text-ui-xs font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent rounded-sm">
            <Icon name="download" className="text-ui-md" />
            ITR-V
          </button>
          <button onClick={() => window.open(`/api/itr/returns/${id}/pdf?format=json`, '_blank')} className="border border-border text-dark px-3 py-2 font-ui text-ui-xs font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent rounded-sm">
            <Icon name="download" className="text-ui-md" />
            JSON
          </button>
          <button onClick={() => window.open(`/api/itr/returns/${id}/finalize`, '_blank')} className="bg-amber text-white px-4 py-2 font-ui text-ui-xs font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors flex items-center gap-1.5 border-none shadow-sm cursor-pointer rounded-sm">
            Finalize Filing →
          </button>
        </div>
      </header>

      <div className="max-w-page mx-auto space-y-8 pb-12">
        {/* Status Tracker */}
        <div className="bg-surface border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-ui-xs text-light">Filing Workflow Status</h3>
            <span className="px-3 py-1 bg-amber-soft text-amber border border-amber-200 text-ui-2xs font-bold uppercase tracking-widest rounded-md">Ready for Review</span>
          </div>
          <div className="flex gap-4 w-full h-1 mb-2">
            <div className="flex-1 bg-success-bg0 rounded-md"></div>
            <div className="flex-1 bg-success-bg0 rounded-md"></div>
            <div className="flex-1 bg-section-amber0 rounded-md"></div>
            <div className="flex-1 bg-surface-muted rounded-md"></div>
            <div className="flex-1 bg-surface-muted rounded-md"></div>
          </div>
          <div className="flex justify-between text-ui-2xs uppercase tracking-widest text-light font-bold">
            <span>Computation</span>
            <span>Deductions</span>
            <span>Review</span>
            <span>E-Verify</span>
            <span>Ack</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-surface border border-border p-8 shadow-sm">
             <h4 className="font-ui text-ui-sm font-bold text-dark mb-6 border-b 50-border pb-2 uppercase tracking-widest text-ui-2xs">Income Summary</h4>
             <div className="space-y-4">
                <div className="flex justify-between font-ui text-ui-sm">
                   <span className="text-mid">Business & Profession</span>
                   <span className="font-mono text-dark">₹ 35,00,000</span>
                </div>
                <div className="flex justify-between font-ui text-ui-sm">
                   <span className="text-mid">Other Sources</span>
                   <span className="font-mono text-dark">₹ 1,25,000</span>
                </div>
                <div className="flex justify-between font-ui text-ui-sm pt-4 border-t border-border font-bold">
                   <span>Gross Total Income</span>
                   <span className="font-mono">₹ 36,25,000</span>
                </div>
             </div>
           </div>

           <div className="bg-dark text-white p-8 shadow-xl border focus:border-focus">
             <h4 className="text-amber font-ui text-ui-sm font-bold mb-6 uppercase tracking-widest text-ui-2xs">Tax Calculation</h4>
             <div className="space-y-4">
                <div className="flex justify-between font-ui text-ui-sm opacity-60">
                   <span>Total Tax Liability</span>
                   <span className="font-mono">₹ 11,62,500</span>
                </div>
                <div className="flex justify-between font-ui text-ui-sm opacity-60">
                   <span>Advance Tax Paid</span>
                   <span className="font-mono text-success">₹ 5,55,525</span>
                </div>
                <div className="flex justify-between font-ui text-ui-sm text-lg pt-6 mt-4 border-t focus:border-focus font-bold">
                   <span className="text-amber">Net Tax Payable</span>
                   <span className="font-mono text-amber">₹ 6,06,975</span>
                </div>
             </div>
           </div>
        </div>

        {/* Audit Trail / Timeline */}
        <div className="bg-surface border border-border p-8 shadow-sm text-left">
           <h3 className="font-ui text-ui-2xs text-light uppercase tracking-widest mb-6 font-bold">Timeline</h3>
           <div className="space-y-6">
              <div className="flex gap-4 items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-success-bg0 mt-1.5"></div>
                 <div>
                    <p className="font-ui text-ui-sm text-dark">Computation finalized by A. Sharma</p>
                    <p className="font-mono text-ui-xs text-light mt-0.5">24 Oct 2024 · 14:32:01</p>
                 </div>
              </div>
              <div className="flex gap-4 items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-lighter mt-1.5"></div>
                 <div>
                    <p className="font-ui text-ui-sm text-dark">Income details synced from Ledger</p>
                    <p className="font-mono text-ui-xs text-light mt-0.5">22 Oct 2024 · 09:15:22</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
