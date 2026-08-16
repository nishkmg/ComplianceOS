'use client';

import { useState } from 'react';
import { MarketingButton } from '@/components/marketing/button';

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
  'h-9 rounded-sm border border-border-strong bg-surface px-3 text-sm font-mono text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber';

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
      return;
    }
    const annual = Number(income);
    if (!Number.isFinite(annual) || annual <= 0) {
      setValidationError('Enter an estimated annual income above zero.');
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">Advance tax, Section 234C</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          Installments due on 15 June, 15 September, 15 December and 15 March at 15%, 45%, 75% and 100% of the tax
          liability. A 1% per month interest applies on each shortfall for the months delayed.
        </p>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            compute();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="at-income" className="block font-ui text-ui-sm text-mid mb-2">
                Estimated annual income
              </label>
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
            <div>
              <label htmlFor="at-tax" className="block font-ui text-ui-sm text-mid mb-2">
                Estimated tax liability
              </label>
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
          {INSTALMENTS.map((inst) => (
            <div key={inst.key}>
              <label htmlFor={`at-paid-${inst.key}`} className="block font-ui text-ui-sm text-mid mb-2">
                Paid by {inst.label} (cumulative)
              </label>
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
          ))}
          <MarketingButton type="submit">Compute</MarketingButton>
        </form>
      </div>

      <div aria-live="polite" className="bg-surface border border-border-subtle rounded-sm p-8 self-start">
        {result ? (
          <>
            <div className="divide-y divide-border-subtle">
              {result.rows.map((r) => (
                <div key={r.label} className="py-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-ui text-ui-sm text-mid">Shortfall at {r.label}</span>
                    <span className="font-mono text-mono-lg text-dark tabular-nums">{inr0(r.shortfall)}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-mono text-mono-sm text-light">1% interest for the months delayed</span>
                    <span className="font-mono text-mono-sm text-mid tabular-nums">{inr2(r.interest)}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Total 234C interest</span>
                <span className="font-mono text-mono-lg text-amber tabular-nums">{inr2(result.totalInterest)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Tax on estimated income</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">
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
          <p className="font-mono text-mono-sm text-light">Enter values and press Compute.</p>
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
