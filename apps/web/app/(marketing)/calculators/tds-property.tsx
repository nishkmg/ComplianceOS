'use client';

import { useEffect, useState } from 'react';

const THRESHOLD = 5000000;
const RATE = 0.01;

const inr0 = (n: number) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`;

const inputCls =
  'h-9 w-full rounded-sm border border-border-strong bg-surface pl-8 pr-3 text-sm font-mono text-dark shadow-sm focus-visible:outline-none focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

const textInputCls =
  'h-9 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm font-mono text-dark shadow-sm focus-visible:outline-none focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

export function TdsProperty() {
  const [consideration, setConsideration] = useState('5000000');
  const [buyerPan, setBuyerPan] = useState('');
  const [sellerPan, setSellerPan] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [result, setResult] = useState<{ tds: number; applicable: boolean; consideration: number } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const compute = () => {
    const value = Number(consideration);
    if (!Number.isFinite(value) || value <= 0) {
      setValidationError('Enter a consideration above zero.');
      setResult(null);
      return;
    }
    const applicable = value >= THRESHOLD;
    setValidationError(null);
    setResult({ tds: applicable ? value * RATE : 0, applicable, consideration: value });
  };

  // Live recompute — debounced, no submit gate
  useEffect(() => {
    const t = setTimeout(compute, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consideration]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div>
        <h2 className="font-display text-display-lg text-dark tracking-tight mb-2">TDS on property purchase, Section 194IA</h2>
        <p className="font-ui text-ui-md text-mid leading-relaxed mb-8">
          The buyer of an immovable property other than agricultural land deducts TDS at 1% when the consideration is ₹50,00,000 or more. No turnover threshold on the buyer.
        </p>
        <div className="space-y-5">
          <div>
            <label htmlFor="tds-property-consideration" className="block font-ui text-ui-sm text-mid mb-2">
              Property consideration
            </label>
            <div className="relative">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-mid">
                ₹
              </span>
              <input
                id="tds-property-consideration"
                type="number"
                min="0"
                step="any"
                value={consideration}
                onChange={(e) => {
                  setConsideration(e.target.value);
                  setValidationError(null);
                }}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="tds-property-buyer-pan" className="block font-ui text-ui-sm text-mid mb-2">
              Buyer PAN <span className="text-light">(optional)</span>
            </label>
            <input
              id="tds-property-buyer-pan"
              type="text"
              placeholder="ABCDE1234F"
              value={buyerPan}
              onChange={(e) => setBuyerPan(e.target.value)}
              className={textInputCls}
            />
          </div>
          <div>
            <label htmlFor="tds-property-seller-pan" className="block font-ui text-ui-sm text-mid mb-2">
              Seller PAN <span className="text-light">(optional)</span>
            </label>
            <input
              id="tds-property-seller-pan"
              type="text"
              placeholder="ABCDE1234F"
              value={sellerPan}
              onChange={(e) => setSellerPan(e.target.value)}
              className={textInputCls}
            />
          </div>
          <div>
            <label htmlFor="tds-property-payment-date" className="block font-ui text-ui-sm text-mid mb-2">
              Date of payment <span className="text-light">(optional)</span>
            </label>
            <input
              id="tds-property-payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={textInputCls}
            />
          </div>
          <p className="font-mono text-mono-xs text-light">Figures update as you type.</p>
        </div>
      </div>

      <div aria-live="polite" className="bg-surface border border-border-subtle border-t-2 border-t-amber rounded-sm shadow-sm p-8 self-start w-full">
        {result ? (
          <>
            <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mb-3">TDS payable</p>
            {result.applicable ? (
              <>
                <p className="font-mono text-3xl md:text-4xl tabular-nums text-amber leading-tight mb-8">{inr0(result.tds)}</p>
                <div className="divide-y divide-border-subtle">
                  <div className="flex items-baseline justify-between py-2.5">
                    <span className="font-mono text-mono-sm text-mid tabular-nums">
                      Consideration {inr0(result.consideration)} at 1%
                    </span>
                    <span className="font-mono text-mono-sm text-dark tabular-nums">{inr0(result.tds)}</span>
                  </div>
                  <div className="flex items-baseline justify-between py-2.5">
                    <span className="font-mono text-mono-sm text-mid">Threshold</span>
                    <span className="font-mono text-mono-sm text-dark tabular-nums">Met</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-ui text-ui-sm text-mid">Rate</span>
                    <span className="font-mono text-mono-md text-dark tabular-nums">1%</span>
                  </div>
                </div>
                <p className="font-mono text-mono-sm text-light mt-6 leading-relaxed">
                  File Form 26QB and issue Form 16B to the seller. PAN of buyer and seller required.
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-3xl md:text-4xl tabular-nums text-amber leading-tight mb-8">{inr0(result.tds)}</p>
                <p className="font-mono text-mono-sm text-mid leading-relaxed">
                  Consideration below ₹50,00,000. No TDS under Section 194IA.
                </p>
              </>
            )}
          </>
        ) : (
          <div className="border border-dashed border-border rounded-sm px-6 py-14 text-center">
            <p className="font-mono text-mono-sm text-light">Your figures appear here as you type</p>
          </div>
        )}
        <p className="font-mono text-mono-sm text-light mt-6">
          Indicative only, consult your CA. Slabs and rates as in force for FY 2026-27.
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
