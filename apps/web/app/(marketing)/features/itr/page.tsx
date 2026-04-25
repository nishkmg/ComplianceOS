// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

export default function ItrPage() {
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <section ref={heroRef} className="animate-in py-24 md:py-32">
          <div className="marketing-container max-w-3xl">
            <SectionLabel>ITR Returns</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-6">
              Your books talk directly to your ITR. No re-entry at year end.
            </h1>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">Regime comparison</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-ui text-ui-xs text-light uppercase tracking-wider mb-4">Old Regime</h3>
                  <div className="space-y-2 font-mono text-[13px]">
                    <div>Gross Income <span className="float-right">₹18,50,000</span></div>
                    <div>Deductions (80C etc.) <span className="float-right">-₹1,50,000</span></div>
                    <div className="border-t border-border pt-2 font-medium">Taxable <span className="float-right">₹17,00,000</span></div>
                    <div className="text-danger">Tax <span className="float-right">₹2,56,200</span></div>
                  </div>
                </div>
                <div className="p-4 border border-amber/30 rounded-lg bg-amber/5">
                  <h3 className="font-ui text-ui-xs text-amber uppercase tracking-wider mb-4">New Regime</h3>
                  <div className="space-y-2 font-mono text-[13px]">
                    <div>Gross Income <span className="float-right">₹18,50,000</span></div>
                    <div>No deductions <span className="float-right">-</span></div>
                    <div className="border-t border-border pt-2 font-medium">Taxable <span className="float-right">₹18,50,000</span></div>
                    <div className="text-success">Tax <span className="float-right">₹2,04,600</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(200,134,10,0.06)', border: '0.5px solid rgba(200,134,10,0.2)' }}>
                <span className="font-ui text-[14px] font-medium text-amber">Recommendation: </span>
                <span className="font-ui text-[14px] text-mid">New regime saves ₹51,600 — calculated from your actual books.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-section-muted">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-4">Presumptive scheme (44AD/44ADA)</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <p className="font-ui text-[14px] text-mid">For eligible businesses — deemed income calculated from turnover. No detailed expense tracking required.</p>
              <div className="flex items-center justify-center gap-8 mt-4 font-mono text-[13px]">
                <div><span className="font-ui text-ui-xs text-light">Turnover</span><br />₹75,00,000</div>
                <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <div><span className="font-ui text-ui-xs text-light">Deemed Income (8%)</span><br /><span className="text-success">₹6,00,000</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-4">Integration chain</h2>
            <div className="flex items-center justify-between flex-wrap gap-4">
              {['Journal Entries', 'P&L', 'ITR Computation', 'Self-assessment Tax'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber/10 text-amber flex items-center justify-center font-ui text-[13px] font-medium">{i + 1}</div>
                  <span className="font-ui text-[13px] text-dark">{step}</span>
                  {i < 3 && <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="marketing-container">
            <Link href="/signup" className="marketing-btn-primary text-[16px] px-7 py-3.5 no-underline">
              Start with ITR <span className="cta-arrow">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
