// @ts-nocheck
'use client';

import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function ITRFeaturePage() {
  return (
    <div className="bg-page-bg text-on-surface antialiased min-h-screen">
      <MarketingNav />
      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-8 pt-16 pb-space-64 text-left">
          <div className="max-w-4xl">
            <h2 className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest mb-6 font-bold">ITR Compliance Hub</h2>
            <h1 className="font-marketing-hero text-marketing-hero text-on-surface mb-8">
              From P&L to ITR — without re-entering a single number.
            </h1>
            <p className="font-ui-lg text-ui-lg text-text-mid max-w-2xl mb-10 leading-relaxed">
              Your tax computation is automatically derived from your closed books. Old vs new regime comparison built in, not bolted on.
            </p>
            <Link href="/signup" className="bg-primary-container text-white px-8 py-4 font-ui-sm text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all no-underline rounded-sm shadow-sm inline-flex items-center gap-2">
              Start Free <span className="inline-block ml-2">→</span>
            </Link>
          </div>
        </section>

        {/* ITR Types */}
        <section className="max-w-[1200px] mx-auto px-8 pb-space-64">
          <h2 className="font-display-xl text-display-xl text-on-surface mb-12 text-left">ITR forms covered.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "ITR-3", desc: "Business income from profession or business. Full P&L mapping with Schedule III compliance.", active: true },
              { title: "ITR-4", desc: "Presumptive taxation under Sections 44AD, 44ADA, and 44AE. Simplified computation.", active: false },
              { title: "ITR-6", desc: "Companies — direct integration with your balance sheet and P&L.", active: false },
            ].map((form) => (
              <div key={form.title} className={`bg-white border-[0.5px] border-border-subtle p-8 shadow-sm relative text-left ${form.active ? 'border-t-2 border-t-primary-container' : ''}`}>
                <h3 className="font-display-lg text-lg font-bold text-on-surface mb-4">{form.title}</h3>
                <p className="font-ui-sm text-sm text-text-mid leading-relaxed mb-8">{form.desc}</p>
                {form.active && <span className="text-primary font-ui-xs text-[10px] uppercase font-bold tracking-widest">Currently Supported</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Regime Comparison */}
        <section className="bg-section-muted py-space-64">
          <div className="max-w-[1200px] mx-auto px-8 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display-xl text-display-xl text-on-surface mb-6">Old vs New — compare using your actual books.</h2>
                <p className="font-ui-md text-ui-md text-text-mid leading-relaxed mb-8">
                  Not a generic calculator. Your actual income, deductions, and exemptions run through both tax regimes side-by-side. See exactly how much you save — in real numbers.
                </p>
                <ul className="space-y-4 font-ui-sm text-sm">
                  {['Actual P&L data, not estimate', 'Section-by-section regime comparison', 'One click to select the optimal regime'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span>
                      <span className="text-text-mid">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between font-bold border-b border-border-subtle pb-3">
                    <span className="uppercase tracking-widest text-[11px] font-ui">Tax Regime</span>
                    <div className="flex gap-8">
                      <span className="w-20 text-right">Old</span>
                      <span className="w-20 text-right">New</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ui text-text-mid">Total Tax</span>
                    <div className="flex gap-8">
                      <span className="w-20 text-right">₹ 1,04,520</span>
                      <span className="w-20 text-right text-green-700">₹ 1,00,000</span>
                    </div>
                  </div>
                  <div className="flex justify-between bg-green-50 px-4 py-3 -mx-4 mt-2 font-bold">
                    <span className="uppercase tracking-widest text-[11px] font-ui text-green-800">Savings</span>
                    <span className="text-green-700">₹ 4,520 ~ 4.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-space-96 px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-marketing-xl text-marketing-xl text-on-surface mb-6">File with confidence this year.</h2>
            <p className="font-ui-md text-ui-md text-text-mid mb-10">From P&L to ITR — zero re-entry. No double data entry, no audit anxiety.</p>
            <Link href="/signup" className="bg-primary-container text-white px-10 py-5 font-ui-sm text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all no-underline rounded-sm shadow-sm inline-flex items-center gap-2">
              Start Free <span className="inline-block">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
