'use client';

import { useEffect, useState } from 'react';

const DUE_PERCENT = [0.15, 0.45, 0.75, 1.0];
const INTEREST_MONTHS = [3, 3, 3, 1];
const INSTALMENTS = [
  { key: 'jun', label: '15 June', due: DUE_PERCENT[0] },
  { key: 'sep', label: '15 September', due: DUE_PERCENT[1] },
  { key: 'dec', label: '15 December', due: DUE_PERCENT[2] },
  { key: 'mar', label: '15 March', due: DUE_PERCENT[3] },
];

const inr0 = (n: number) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`;
const inr2 = (n: number) =>
  `\u20B9${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inputCls =
  'h-9 w-full rounded-sm border border-border-strong bg-surface pl-8 pr-3 text-sm font-mono text-dark shadow-sm focus-visible:outline-none focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

export function AdvanceTax() {
  const [income, setIncome] = useState('1500000');
  const [liability, setLiability] = useState('150000');
  const [paid, setPaid] = useState<Record<string, string>>({ jun: '20000', sep: '45000', dec: '50000', mar: '35000' });
  const [result, setResult] = useState<{
    rows: { label: string; cumDue: number; cumPaid: number; shortfall: number; interest: number }[];
    totalInterest: number;
    effective: number;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const compute = () => {
    const tax = Number(liability);
    if (!Number.isFinite(tax) || tax <= 0) {
      setValidationError('Enter an estimated tax liability above zero.');
      setResult(null);
      return;
    }
    const annual = Number(income);
    if (!Number.isFinite(annual) || annual <= 0) {
      setValidationError('Enter an estimated annual income above zero.');
      setResult(null);
      return;
    }
    let cumDue = 0;
    let cumPaid = 0;
    const rows = INSTALMENTS.map((inst, i) => {
      cumDue += tax * inst.due;
      cumPaid += Number(paid[inst.key]) || 0;
      const shortfall = Math.max(0, cumDue - cumPaid);
      return {
        label: inst.label,
        cumDue,
        cumPaid,
        shortfall,
        interest: shortfall * 0.01 * INTEREST_MONTHS[i],
      };
    });
    const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
    setValidationError(null);
    setResult({ rows, totalInterest, effective: annual > 0 ? tax / annual : 0 });
  };

  // Live recompute — debounced, no submit gate
  useEffect(() => {
    const t = setTimeout(compute, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, liability, paid]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">Advance tax, Section 234C</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          Installments due on 15 June, 15 September, 15 December and 15 March at 15%, 45%, 75% and 100% of the tax
          liability. A 1% per month interest applies on each shortfall for the months delayed.
        </p>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="at-income" className="block font-ui text-ui-sm text-mid mb-2">
                Estimated annual income
              </label>
              <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                  ₹
                </span>
                <input
                  id="at-income"
                  type="number"
                  min="0"
                  step="any"
                  value={income}
                  onChange={(e) => {
                    setIncome(e.target.value);
                    setValidationError(null);
                  }}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="at-tax" className="block font-ui text-ui-sm text-mid mb-2">
                Estimated tax liability
              </label>
              <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                  ₹
                </span>
                <input
                  id="at-tax"
                  type="number"
                  min="0"
                  step="any"
                  value={liability}
                  onChange={(e) => {
                    setLiability(e.target.value);
                    setValidationError(null);
                  }}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
          {INSTALMENTS.map((inst) => (
            <div key={inst.key}>
              <label htmlFor={`at-paid-${inst.key}`} className="block font-ui text-ui-sm text-mid mb-2">
                Paid by {inst.label} (cumulative)
              </label>
              <div className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                  ₹
                </span>
                <input
                  id={`at-paid-${inst.key}`}
                  type="number"
                  min="0"
                  step="any"
                  value={paid[inst.key]}
                  onChange={(e) => {
                    setPaid({ ...paid, [inst.key]: e.target.value });
                    setValidationError(null);
                  }}
                  className={inputCls}
                />
              </div>
            </div>
          ))}
          <p className="font-mono text-mono-xs text-light">Figures update as you type.</p>
        </div>
      </div>

      <div aria-live="polite" className="bg-surface border border-border-subtle border-t-2 border-t-amber rounded-sm shadow-sm p-8 self-start w-full">
        {result ? (
          <>
            <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mb-3">Total 234C interest</p>
            <p className="font-mono text-3xl md:text-4xl tabular-nums text-amber leading-tight mb-8">{inr2(result.totalInterest)}</p>
            <div className="divide-y divide-border-subtle">
              {result.rows.map((r) => (
                <div key={r.label} className="py-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-ui text-ui-sm text-mid">Shortfall at {r.label}</span>
                    <span className="font-mono text-mono-sm text-dark tabular-nums">{inr0(r.shortfall)}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="font-mono text-mono-sm text-light">1% interest for the months delayed</span>
                    <span className="font-mono text-mono-sm text-mid tabular-nums">{inr2(r.interest)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-ui text-ui-sm text-mid">Tax on estimated income</span>
                <span className="font-mono text-mono-md text-dark tabular-nums">
                  {inr0(Number(liability) || 0)} ({(result.effective * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <p className="font-mono text-mono-sm text-light mt-6 leading-relaxed">
              Months delayed: 3 for the June, September and December installments, 1 for the March installment,
              per Section 234C. Shortfall is cumulative due minus cumulative paid.
            </p>
          </>
        ) : (
          <div className="border border-dashed border-border rounded-sm px-6 py-14 text-center">
            <p className="font-mono text-mono-sm text-light">Your figures appear here as you type</p>
          </div>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only, consult your CA. Section 234B and interest on excess TDS not included.
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
