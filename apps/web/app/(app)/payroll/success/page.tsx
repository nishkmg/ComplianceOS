"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { Icon } from '@/components/ui/icon';

export default function PayrollSuccessPage() {
  const router = useRouter();
  const params = useParams();
  
  return (
    <div className="bg-page-bg text-on-surface min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-xl">
        <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-8 md:p-12 flex flex-col gap-8 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <Icon name="check_circle" className="text-[56px] text-primary-container" />
            <div className="space-y-3">
              <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight">Payroll Processed</h1>
              <p className="font-ui-md text-ui-md text-text-mid max-w-md mx-auto leading-relaxed">
                Salaries for October 2024 have been calculated. Payslips are now available for employee download.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 py-8 border-y-[0.5px] border-border-subtle bg-stone-50 px-6">
            <div className="flex justify-between items-baseline border-b border-stone-100 pb-3">
              <span className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Total Gross</span>
              <span className="font-mono text-sm font-bold text-on-surface">₹ 42,50,000.00</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-stone-100 pb-3">
              <span className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Total Deductions</span>
              <span className="font-mono text-sm font-bold text-red-600">- ₹ 4,15,200.00</span>
            </div>
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-ui-sm text-sm font-bold text-on-surface uppercase tracking-widest">Total Net Pay</span>
              <span className="font-mono text-lg font-bold text-primary-container">₹ 38,34,800.00</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/payroll" className="flex-1 bg-primary-container text-white py-3 px-6 font-ui-sm text-sm font-bold uppercase tracking-widest transition-all no-underline rounded-sm shadow-sm text-center inline-flex items-center justify-center gap-2">
              Back to Payroll <Icon name="arrow_forward" className="text-sm" />
            </Link>
            <Link href="/payroll/process" className="flex-1 bg-transparent border border-border-subtle text-on-surface py-3 px-6 font-ui-sm text-sm transition-colors no-underline rounded-sm text-center font-bold uppercase tracking-widest">
              View Payroll Detail
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
