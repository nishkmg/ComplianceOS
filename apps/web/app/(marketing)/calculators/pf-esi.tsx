'use client';

import { useState } from 'react';
import { MarketingButton } from '@/components/marketing/button';

const PF_CEILING = 15000;
const PF_EMPLOYEE_RATE = 0.12;
const PF_EMPLOYER_RATE = 0.12;
const EPS_RATE = 0.0833;
const EPS_CAP = 1250;
const ESI_CEILING = 21000;
const ESI_EMPLOYEE_RATE = 0.0075;
const ESI_EMPLOYER_RATE = 0.0325;

const inr2 = (n: number) =>
  `\u20B9${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inputCls =
  'h-9 rounded-sm border border-border-strong bg-surface px-3 text-sm font-mono text-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber';

export function PfEsi() {
  const [basic, setBasic] = useState('15000');
  const [gross, setGross] = useState('18000');
  const [result, setResult] = useState<{
    pfWage: number;
    pfEmployee: number;
    pfEmployer: number;
    eps: number;
    esiEmployee: number;
    esiEmployer: number;
    esiApplies: boolean;
    totalEmployee: number;
    totalEmployer: number;
  } | null>(null);

  const compute = () => {
    const b = Number(basic);
    const g = Number(gross);
    if (!Number.isFinite(b) || !Number.isFinite(g) || b < 0 || g < 0) return;
    const pfWage = Math.min(b, PF_CEILING);
    const pfEmployee = pfWage * PF_EMPLOYEE_RATE;
    const pfEmployer = pfWage * PF_EMPLOYER_RATE;
    const eps = Math.min(pfWage * EPS_RATE, EPS_CAP);
    const esiApplies = g <= ESI_CEILING;
    const esiEmployee = esiApplies ? g * ESI_EMPLOYEE_RATE : 0;
    const esiEmployer = esiApplies ? g * ESI_EMPLOYER_RATE : 0;
    setResult({
      pfWage,
      pfEmployee,
      pfEmployer,
      eps,
      esiEmployee,
      esiEmployer,
      esiApplies,
      totalEmployee: pfEmployee + esiEmployee,
      totalEmployer: pfEmployer + esiEmployer,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">PF and ESI</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          Employee Provident Fund at 12% on basic wages up to the {inr2(PF_CEILING)} ceiling, ESI on gross wages up
          to {inr2(ESI_CEILING)}, all per month.
        </p>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            compute();
          }}
        >
          <div>
            <label htmlFor="pf-basic" className="block font-ui text-ui-sm text-mid mb-2">
              Monthly basic wages
            </label>
            <input
              id="pf-basic"
              type="number"
              min="0"
              step="any"
              value={basic}
              onChange={(e) => setBasic(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pf-gross" className="block font-ui text-ui-sm text-mid mb-2">
              Monthly gross wages
            </label>
            <input
              id="pf-gross"
              type="number"
              min="0"
              step="any"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              className={inputCls}
            />
          </div>
          <MarketingButton type="submit">Compute</MarketingButton>
        </form>
      </div>

      <div aria-live="polite" className="bg-surface border border-border-subtle rounded-sm p-8 self-start">
        {result ? (
          <>
            <p className="font-mono text-mono-sm text-light uppercase tracking-[0.14em] mb-4">
              PF wage base {inr2(result.pfWage)} / month
            </p>
            <div className="divide-y divide-border-subtle">
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">PF employee (12%)</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">{inr2(result.pfEmployee)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">PF employer (12%)</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">{inr2(result.pfEmployer)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">EPS 8.33% (capped)</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">{inr2(result.eps)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">ESI employee (0.75%)</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">{inr2(result.esiEmployee)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">ESI employer (3.25%)</span>
                <span className="font-mono text-mono-lg text-dark tabular-nums">{inr2(result.esiEmployer)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Employee total</span>
                <span className="font-mono text-mono-lg text-amber tabular-nums">{inr2(result.totalEmployee)}</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span className="font-ui text-ui-sm text-mid">Employer total</span>
                <span className="font-mono text-mono-lg text-amber tabular-nums">{inr2(result.totalEmployer)}</span>
              </div>
            </div>
            {!result.esiApplies && (
              <p className="font-mono text-mono-sm text-light mt-6">
                Gross wages exceed the ESI ceiling of {inr2(ESI_CEILING)}; ESI does not apply.
              </p>
            )}
            <p className="font-mono text-mono-sm text-light mt-6 leading-relaxed">
              EPS is capped at {inr2(EPS_CAP)} per month. Basic wages above the PF ceiling are exempt from PF at
              the employee's option.
            </p>
          </>
        ) : (
          <p className="font-mono text-mono-sm text-light">Enter wages and press Compute.</p>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only, consult your CA. Rates as in force for FY 2026-27.
        </p>
      </div>
    </div>
  );
}
