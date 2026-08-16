'use client';

import { useEffect, useState } from 'react';

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
  'h-9 w-full rounded-sm border border-border-strong bg-surface pl-8 pr-3 text-sm font-mono text-dark shadow-sm focus-visible:outline-none focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const compute = () => {
    const b = Number(basic);
    const g = Number(gross);
    if (!Number.isFinite(b) || b <= 0) {
      setValidationError('Enter basic wages above zero.');
      setResult(null);
      return;
    }
    if (!Number.isFinite(g) || g <= 0) {
      setValidationError('Enter gross wages above zero.');
      setResult(null);
      return;
    }
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
    setValidationError(null);
  };

  // Live recompute — debounced, no submit gate
  useEffect(() => {
    const t = setTimeout(compute, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basic, gross]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">PF and ESI</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          Employee Provident Fund at 12% on basic wages up to the {inr2(PF_CEILING)} ceiling, ESI on gross wages up
          to {inr2(ESI_CEILING)}, all per month.
        </p>
        <div className="space-y-5">
          <div>
            <label htmlFor="pf-basic" className="block font-ui text-ui-sm text-mid mb-2">
              Monthly basic wages
            </label>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                ₹
              </span>
              <input
                id="pf-basic"
                type="number"
                min="0"
                step="any"
                value={basic}
                onChange={(e) => {
                  setBasic(e.target.value);
                  setValidationError(null);
                }}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="pf-gross" className="block font-ui text-ui-sm text-mid mb-2">
              Monthly gross wages
            </label>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                ₹
              </span>
              <input
                id="pf-gross"
                type="number"
                min="0"
                step="any"
                value={gross}
                onChange={(e) => {
                  setGross(e.target.value);
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
            <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mb-3">
              Monthly statutory cost
            </p>
            <div className="flex items-baseline gap-8 mb-8">
              <div>
                <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mb-1">Employee</p>
                <p className="font-mono text-3xl md:text-4xl tabular-nums text-amber leading-tight">{inr2(result.totalEmployee)}</p>
              </div>
              <div>
                <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mb-1">Employer</p>
                <p className="font-mono text-3xl md:text-4xl tabular-nums text-amber leading-tight">{inr2(result.totalEmployer)}</p>
              </div>
            </div>
            <div className="divide-y divide-border-subtle">
              <div className="flex items-baseline justify-between py-2.5">
                <span className="font-ui text-ui-sm text-mid">PF employee (12%)</span>
                <span className="font-mono text-mono-sm text-dark tabular-nums">{inr2(result.pfEmployee)}</span>
              </div>
              <div className="flex items-baseline justify-between py-2.5">
                <span className="font-ui text-ui-sm text-mid">PF employer (12%)</span>
                <span className="font-mono text-mono-sm text-dark tabular-nums">{inr2(result.pfEmployer)}</span>
              </div>
              <div className="flex items-baseline justify-between py-2.5">
                <span className="font-ui text-ui-sm text-mid">EPS 8.33% (capped)</span>
                <span className="font-mono text-mono-sm text-dark tabular-nums">{inr2(result.eps)}</span>
              </div>
              <div className="flex items-baseline justify-between py-2.5">
                <span className="font-ui text-ui-sm text-mid">ESI employee (0.75%)</span>
                <span className="font-mono text-mono-sm text-dark tabular-nums">{inr2(result.esiEmployee)}</span>
              </div>
              <div className="flex items-baseline justify-between py-2.5">
                <span className="font-ui text-ui-sm text-mid">ESI employer (3.25%)</span>
                <span className="font-mono text-mono-sm text-dark tabular-nums">{inr2(result.esiEmployer)}</span>
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
          <div className="border border-dashed border-border rounded-sm px-6 py-14 text-center">
            <p className="font-mono text-mono-sm text-light">Your figures appear here as you type</p>
          </div>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only, consult your CA. Rates as in force for FY 2026-27.
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
