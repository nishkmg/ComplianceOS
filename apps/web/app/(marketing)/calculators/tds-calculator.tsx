'use client';

import { useEffect, useState } from 'react';

const SLABS: { min: number; max: number; rate: number }[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.1 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.2 },
  { min: 1500000, max: Infinity, rate: 0.3 },
];

const inr0 = (n: number) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`;

const inputCls =
  'h-9 w-full rounded-sm border border-border-strong bg-surface pl-8 pr-3 text-sm font-mono text-dark shadow-sm focus-visible:outline-none focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

export function TdsCalculator() {
  const [salary, setSalary] = useState('1500000');
  const [result, setResult] = useState<{ rows: { min: number; max: number; rate: number; tax: number }[]; total: number; effective: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const compute = () => {
    const annual = Number(salary);
    if (!Number.isFinite(annual) || annual <= 0) {
      setValidationError('Enter an annual salary above zero.');
      setResult(null);
      return;
    }
    const rows = SLABS.map((s) => {
      const taxable = Math.max(0, Math.min(annual, s.max) - s.min);
      return { ...s, tax: taxable * s.rate };
    });
    const total = rows.reduce((sum, r) => sum + r.tax, 0);
    setValidationError(null);
    setResult({ rows, total, effective: annual > 0 ? total / annual : 0 });
  };

  // Live recompute — debounced, no submit gate
  useEffect(() => {
    const t = setTimeout(compute, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salary]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">TDS on salary, Section 192</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          New regime slabs for FY 2026-27 applied to annual taxable salary. No standard deduction, no 80C.
        </p>
        <div className="space-y-5">
          <div>
            <label htmlFor="tds-salary" className="block font-ui text-ui-sm text-mid mb-2">
              Annual taxable salary
            </label>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                ₹
              </span>
              <input
                id="tds-salary"
                type="number"
                min="0"
                step="any"
                value={salary}
                onChange={(e) => {
                  setSalary(e.target.value);
                  setValidationError(null);
                }}
                className={inputCls}
              />
            </div>
          </div>
          <p className="font-mono text-mono-xs text-light">Figures update as you type.</p>
        </div>
      </div>

      <div aria-live="polite" className="bg-surface border border-border-subtle border-t-2 border-t-amber rounded-sm shadow-sm p-8 self-start w-full">
        {result ? (
          <>
            <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mb-3">Total tax</p>
            <p className="font-mono text-3xl md:text-4xl tabular-nums text-amber leading-tight mb-8">{inr0(result.total)}</p>
            <div className="divide-y divide-border-subtle">
              {result.rows.map((r) => (
                <div key={r.min} className="flex items-baseline justify-between py-2.5">
                  <span className="font-mono text-mono-sm text-mid tabular-nums">
                    {inr0(r.min)} to {r.max === Infinity ? 'above' : inr0(r.max)} at {r.rate * 100}%
                  </span>
                  <span className="font-mono text-mono-sm text-dark tabular-nums">{inr0(r.tax)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-ui text-ui-sm text-mid">Effective rate</span>
                <span className="font-mono text-mono-md text-dark tabular-nums">
                  {(result.effective * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="font-mono text-mono-sm text-light mt-6 leading-relaxed">
              Slabs as notified for FY 2026-27, new regime, no deductions.
            </p>
          </>
        ) : (
          <div className="border border-dashed border-border rounded-sm px-6 py-14 text-center">
            <p className="font-mono text-mono-sm text-light">Your figures appear here as you type</p>
          </div>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only, consult your CA. Cess and surcharge not included.
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
