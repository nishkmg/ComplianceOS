// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

export default function GstPage() {
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
            <SectionLabel>GST</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-6">
              GSTR-1, GSTR-2B, GSTR-3B — generated from your own entries. Not re-entered.
            </h1>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">The filing flow</h2>
            <div className="space-y-6">
              {[
                { step: 1, title: 'Entries posted → GSTR-1 auto-generated', desc: 'Every invoice and journal entry with GST impact flows into GSTR-1 automatically. No manual re-entry.' },
                { step: 2, title: 'GSTR-2B fetched → ITC reconciled', desc: 'Your auto-populated ITC statement is fetched. The system matches it against your purchase entries.' },
                { step: 3, title: 'GSTR-3B generated → Enter ARN → Filed', desc: 'The summary return is pre-filled from GSTR-1 and 2B. File on the portal, enter the ARN here.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-amber text-white flex items-center justify-center font-ui text-[14px] font-medium flex-shrink-0">{s.step}</div>
                  <div>
                    <h3 className="font-ui text-[15px] font-medium text-dark">{s.title}</h3>
                    <p className="font-ui text-[14px] text-mid">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-section-muted">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-4">ITC Reconciliation</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <div className="flex gap-6 mb-6">
                {[
                  { label: 'Matched', value: '₹1,85,000', color: 'text-success' },
                  { label: 'Unmatched', value: '₹12,500', color: 'text-danger' },
                  { label: 'Pending', value: '₹8,200', color: 'text-amber' },
                ].map((kpi) => (
                  <div key={kpi.label} className="text-center">
                    <div className="font-ui text-[11px] text-light uppercase tracking-wider mb-1">{kpi.label}</div>
                    <div className={`font-mono text-[15px] font-medium ${kpi.color}`}>{kpi.value}</div>
                  </div>
                ))}
              </div>
              <p className="font-ui text-[13px] text-light">Know your ITC position before the due date.</p>
            </div>
          </div>
        </section>

        {/* Honest limitation banner */}
        <section className="py-8">
          <div className="marketing-container max-w-3xl">
            <div className="rounded-lg p-4 flex gap-3 items-start" style={{ background: 'rgba(200,134,10,0.06)', border: '0.5px solid rgba(200,134,10,0.2)' }}>
              <svg className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="font-ui text-[14px] text-mid m-0">
                <strong>Note:</strong> ComplianceOS does not file directly to the GST portal (no GSP integration in v1). You file on the GSTN portal, then record the ARN here. We generate everything; you file it.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="marketing-container">
            <Link href="/signup" className="marketing-btn-primary text-[16px] px-7 py-3.5 no-underline">
              Start with the GST module <span className="cta-arrow">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
