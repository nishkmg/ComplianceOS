'use client';

import { useState } from 'react';
import { MarketingButton } from '@/components/marketing/button';

const inr0 = (n: number) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`;
const inr2 = (n: number) =>
  `\u20B9${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function daysBetween(from: string, to: string): number {
  const f = new Date(from);
  const t = new Date(to);
  if (isNaN(f.getTime()) || isNaN(t.getTime())) return 0;
  return Math.max(0, Math.round((t.getTime() - f.getTime()) / 86_400_000));
}

const inputCls =
  'h-9 rounded-sm border border-border-strong bg-surface px-3 text-sm font-mono text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber';

export function GstLateFee() {
  const [taxAmount, setTaxAmount] = useState('100000');
  const [dueDate, setDueDate] = useState('2026-07-20');
  const [paidDate, setPaidDate] = useState('2026-08-05');
  const [result, setResult] = useState<{ days: number; interest: number } | null>(null);

  const compute = () => {
    const tax = Number(taxAmount);
    if (!Number.isFinite(tax) || tax <= 0) return;
    const days = daysBetween(dueDate, paidDate);
    if (!dueDate || !paidDate) return;
    setResult({ days, interest: tax * (0.18 / 365) * days });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">GST late interest</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          Section 50 of the CGST Act charges 18% per annum simple interest on unpaid tax from the due date.
        </p>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            compute();
          }}
        >
          <div>
            <label htmlFor="gst-tax" className="block font-ui text-ui-sm text-mid mb-2">
              Tax payable
            </label>
            <input
              id="gst-tax"
              type="number"
              min="0"
              step="any"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="gst-due" className="block font-ui text-ui-sm text-mid mb-2">
              Due date
            </label>
            <input
              id="gst-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="gst-paid" className="block font-ui text-ui-sm text-mid mb-2">
              Payment date
            </label>
            <input
              id="gst-paid"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <MarketingButton type="submit">Compute</MarketingButton>
        </form>
      </div>

      <div aria-live="polite" className="bg-surface border border-border-subtle rounded-sm p-8 self-start">
        {result ? (
          <>
            <div className="divide-y divide-border-subtle">
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Days late</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">{result.days}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Interest at 18% p.a. (simple)</span>
                <span className="font-mono text-mono-lg text-amber tabular-nums">{inr2(result.interest)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Total payable</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">
                  {inr2(Number(taxAmount) + result.interest)}
                </span>
              </div>
            </div>
            <p className="font-mono text-mono-sm text-light mt-6 leading-relaxed">
              Daily rate: 18% / 365. A late fee under the CGST rules may also apply on top of this interest.
            </p>
          </>
        ) : (
          <p className="font-mono text-mono-sm text-light">Enter values and press Compute.</p>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only. Interest liability is adjudicated on your actual return. Tax amount {inr0(Number(taxAmount) || 0)}.
        </p>
      </div>
    </div>
  );
}
