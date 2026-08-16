'use client';

import { useEffect, useState } from 'react';

function daysBetween(from: string, to: string): number {
  const f = new Date(from);
  const t = new Date(to);
  if (isNaN(f.getTime()) || isNaN(t.getTime())) return 0;
  return Math.max(0, Math.round((t.getTime() - f.getTime()) / 86_400_000));
}

const inr0 = (n: number) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`;
const inr2 = (n: number) =>
  `\u20B9${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inputCls =
  'h-9 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm font-mono text-dark shadow-sm focus-visible:outline-none focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

export function GstLateFee() {
  const [taxAmount, setTaxAmount] = useState('100000');
  const [dueDate, setDueDate] = useState('2026-07-20');
  const [paidDate, setPaidDate] = useState('2026-08-05');
  const [result, setResult] = useState<{ days: number; interest: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const compute = () => {
    const tax = Number(taxAmount);
    if (!Number.isFinite(tax) || tax <= 0) {
      setValidationError('Enter a tax amount greater than zero.');
      setResult(null);
      return;
    }
    if (!dueDate || !paidDate) {
      setValidationError('Enter both the due date and payment date.');
      setResult(null);
      return;
    }
    const days = daysBetween(dueDate, paidDate);
    setValidationError(null);
    setResult({ days, interest: tax * (0.18 / 365) * days });
  };

  // Live recompute — debounced, no submit gate
  useEffect(() => {
    const t = setTimeout(compute, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxAmount, dueDate, paidDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">GST late interest</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          Section 50 of the CGST Act charges 18% per annum simple interest on unpaid tax from the due date.
        </p>
        <div className="space-y-5">
          <div>
            <label htmlFor="gst-tax" className="block font-ui text-ui-sm text-mid mb-2">
              Tax payable
            </label>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                ₹
              </span>
              <input
                id="gst-tax"
                type="number"
                min="0"
                step="any"
                value={taxAmount}
                onChange={(e) => {
                  setTaxAmount(e.target.value);
                  setValidationError(null);
                }}
                className={inputCls.replace('px-3', 'pl-8 pr-3')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="gst-due" className="block font-ui text-ui-sm text-mid mb-2">
              Due date
            </label>
            <input
              id="gst-due"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setValidationError(null);
              }}
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
              onChange={(e) => {
                setPaidDate(e.target.value);
                setValidationError(null);
              }}
              className={inputCls}
            />
          </div>
          <p className="font-mono text-mono-xs text-light">Figures update as you type.</p>
        </div>
      </div>

      <div aria-live="polite" className="bg-surface border border-border-subtle border-t-2 border-t-amber rounded-sm shadow-sm p-8 self-start w-full">
        {result ? (
          <>
            <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mb-3">Interest at 18% p.a.</p>
            <p className="font-mono text-3xl md:text-4xl tabular-nums text-amber leading-tight mb-8">{inr2(result.interest)}</p>
            <div className="divide-y divide-border-subtle">
              <div className="flex items-baseline justify-between py-2.5">
                <span className="font-ui text-ui-sm text-mid">Days late</span>
                <span className="font-mono text-mono-md text-dark tabular-nums">{result.days}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-ui text-ui-sm text-mid">Total payable</span>
                <span className="font-mono text-mono-md text-dark tabular-nums">
                  {inr2(Number(taxAmount) + result.interest)}
                </span>
              </div>
            </div>
            <p className="font-mono text-mono-sm text-light mt-6 leading-relaxed">
              Daily rate: 18% / 365. A late fee under the CGST rules may also apply on top of this interest.
            </p>
          </>
        ) : (
          <div className="border border-dashed border-border rounded-sm px-6 py-14 text-center">
            <p className="font-mono text-mono-sm text-light">Your figures appear here as you type</p>
          </div>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only. Interest liability is adjudicated on your actual return.
        </p>
        {validationError && (
          <p role="alert" className="text-danger font-ui text-ui-sm mt-3">
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
}
