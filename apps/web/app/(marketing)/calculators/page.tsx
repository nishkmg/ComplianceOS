'use client';

import { useState } from 'react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';
import { cn } from '@/lib/utils';
import { GstLateFee } from './gst-late-fee';
import { TdsCalculator } from './tds-calculator';
import { PfEsi } from './pf-esi';
import { AdvanceTax } from './advance-tax';

const TABS = [
  { id: 'gst-late-interest', label: 'GST Late Interest' },
  { id: 'tds-sec-192', label: 'TDS Sec 192' },
  { id: 'pf-esi', label: 'PF & ESI' },
  { id: 'advance-tax', label: 'Advance Tax' },
];

const WHY_STEPS = [
  {
    index: '01',
    title: 'Same constants',
    copy: 'Every rate here is the same constant the payroll, GST and tax services use inside Arthvahi.',
  },
  {
    index: '02',
    title: 'Capped like the statute',
    copy: 'PF and ESI ceilings, the EPS cap and the new-regime slabs are applied exactly as the law reads.',
  },
  {
    index: '03',
    title: 'Indicative, never a filing',
    copy: 'A browser check before you talk to your CA. Figures here do not constitute a filing.',
  },
];

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = TABS.length - 1;
    setActiveTab(TABS[next].id);
    document.getElementById(`tab-${TABS[next].id}`)?.focus();
  };

  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-64">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6">
              Statutory calculators
            </p>
            <h1 className="font-display text-hero text-dark leading-tight tracking-tight text-balance max-w-2xl mb-8">
              The same statutory rates Arthvahi computes with.
            </h1>
            <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-6">
              PF, ESI, TDS, advance tax and GST late interest, figured right in your browser with the exact rates the
              product uses.
            </p>
            <p className="font-mono text-mono-sm text-light">
              Indicative figures only. Not a substitute for a filing.
            </p>
          </div>
        </header>

        <section className="pb-space-96">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <div
              role="tablist"
              aria-label="Statutory calculators"
              className="inline-flex flex-wrap gap-1 rounded-sm bg-section-muted p-1"
            >
              {TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    'h-9 px-4 rounded-sm font-mono text-mono-sm uppercase tracking-[0.14em] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber',
                    activeTab === tab.id
                      ? 'bg-surface shadow-sm text-dark'
                      : 'bg-transparent text-mid hover:text-dark',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              id={`panel-${TABS[0].id}`}
              role="tabpanel"
              aria-labelledby={`tab-${TABS[0].id}`}
              className={cn('pt-space-64', activeTab !== TABS[0].id && 'hidden')}
            >
              <GstLateFee />
            </div>
            <div
              id={`panel-${TABS[1].id}`}
              role="tabpanel"
              aria-labelledby={`tab-${TABS[1].id}`}
              className={cn('pt-space-64', activeTab !== TABS[1].id && 'hidden')}
            >
              <TdsCalculator />
            </div>
            <div
              id={`panel-${TABS[2].id}`}
              role="tabpanel"
              aria-labelledby={`tab-${TABS[2].id}`}
              className={cn('pt-space-64', activeTab !== TABS[2].id && 'hidden')}
            >
              <PfEsi />
            </div>
            <div
              id={`panel-${TABS[3].id}`}
              role="tabpanel"
              aria-labelledby={`tab-${TABS[3].id}`}
              className={cn('pt-space-64', activeTab !== TABS[3].id && 'hidden')}
            >
              <AdvanceTax />
            </div>
          </div>
        </section>

        <section className="py-space-96 bg-section-dark">
          <Reveal delay={0.05}>
            <div className="max-w-[1320px] mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
              {WHY_STEPS.map((step) => (
                <div key={step.index}>
                  <p className="font-mono text-mono-sm text-sidebar-dim uppercase tracking-[0.14em] mb-3">
                    {step.index} / {step.title}
                  </p>
                  <p className="font-ui text-ui-md text-sidebar-muted leading-relaxed">{step.copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <CtaBand
          title="Run the real numbers on real books"
          lede="Statutory calculators are a preview. Arthvahi computes the same rates from your own ledger and payroll each period."
          secondaryHref="/demo"
          secondaryLabel="Book a Demo"
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
