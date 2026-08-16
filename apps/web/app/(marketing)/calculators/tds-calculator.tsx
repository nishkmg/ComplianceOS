'use client';

import { useState } from 'react';
import { MarketingButton } from '@/components/marketing/button';

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
  'h-9 rounded-sm border border-border-strong bg-surface px-3 text-sm font-mono text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber';

export function TdsCalculator() {
  const [salary, setSalary] = useState('1500000');
  const [result, setResult] = useState<{ rows: { min: number; max: number; rate: number; tax: number }[]; total: number; effective: number } | null>(null);

  const compute = () => {
    const annual = Number(salary);
    if (!Number.isFinite(annual) || annual < 0) return;
    const rows = SLABS.map((s) => {
      const taxable = Math.max(0, Math.min(annual, s.max) - s.min);
      return { ...s, tax: taxable * s.rate };
    });
    const total = rows.reduce((sum, r) => sum + r.tax, 0);
    setResult({ rows, total, effective: annual > 0 ? total / annual : 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">TDS on salary, Section 192</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          New regime slabs for FY 2026-27 applied to annual taxable salary. No standard deduction, no 80C.
        </p>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            compute();
          }}
        >
          <div>
            <label htmlFor="tds-salary" className="block font-ui text-ui-sm text-mid mb-2">
              Annual taxable salary
            </label>
            <input
              id="tds-salary"
              type="number"
              min="0"
              step="any"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
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
              {result.rows.map((r) => (
                <div key={r.min} className="flex items-baseline justify-between py-3">
                  <span className="font-mono text-mono-sm text-mid tabular-nums">
                    {inr0(r.min)} to {r.max === Infinity ? 'above' : inr0(r.max)} at {r.rate * 100}%
                  </span>
                  <span className="font-mono text-mono-lg text-dark tabular-nums">{inr0(r.tax)}</span>
                </div>
              ))}
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Total tax</span>
                <span className="font-mono text-mono-lg text-amber tabular-nums">{inr0(result.total)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Effective rate</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">
                  {(result.effective * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="font-mono text-mono-sm text-light mt-6 leading-relaxed">
              Slabs as notified for FY 2026-27, new regime, no deductions.
            </p>
          </>
        ) : (
          <p className="font-mono text-mono-sm text-light">Enter a salary and press Compute.</p>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only, consult your CA. Cess and surcharge not included.
        </p>
      </div>
    </div>
  );
}
