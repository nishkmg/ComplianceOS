// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

export default function InvoicingPage() {
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
            <SectionLabel>Invoicing</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-6">
              Invoices that post to your books automatically. No double entry.
            </h1>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">How it flows</h2>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {['Invoice Created', 'JE Auto-generated', 'Receivables Updated', 'GST Liability Updated'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber/10 text-amber flex items-center justify-center font-ui text-[13px] font-medium">{i + 1}</div>
                  <span className="font-ui text-[13px] text-dark">{step}</span>
                  {i < 3 && <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">Invoice preview</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <div className="border-b border-border pb-4 mb-4 flex justify-between">
                <div>
                  <div className="font-display text-[20px] mb-1">Mehta Textiles Pvt. Ltd.</div>
                  <div className="font-ui text-[11px] text-light">GSTIN: 27AABCU1234D1Z5</div>
                </div>
                <div className="text-right">
                  <div className="font-ui text-[11px] text-light">Invoice # INV-2026-001</div>
                  <div className="font-mono text-[11px] text-light">01 Apr 2026</div>
                </div>
              </div>
              <table className="w-full font-mono text-[12px]">
                <thead><tr className="text-light border-b border-border"><th className="text-left pb-2 font-normal">Item</th><th className="text-right pb-2 font-normal">HSN</th><th className="text-right pb-2 font-normal">Qty</th><th className="text-right pb-2 font-normal">Rate</th><th className="text-right pb-2 font-normal">GST</th><th className="text-right pb-2 font-normal">Amount</th></tr></thead>
                <tbody>
                  <tr className="border-b border-border"><td className="py-3">Cotton fabric — premium</td><td className="text-right">5208</td><td className="text-right">100</td><td className="text-right">₹250</td><td className="text-right">5%</td><td className="text-right">₹26,250</td></tr>
                  <tr><td className="py-3">Silk thread — bulk</td><td className="text-right">5007</td><td className="text-right">50</td><td className="text-right">₹180</td><td className="text-right">12%</td><td className="text-right">₹10,080</td></tr>
                </tbody>
              </table>
              <div className="text-right mt-4 pt-4 border-t border-border">
                <div className="font-ui text-[11px] text-light">CGST: ₹900 · SGST: ₹900</div>
                <div className="font-mono text-[18px] text-amber font-medium">₹37,230</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-section-muted">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-4">OCR Scan</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-section-muted rounded-lg p-6 flex items-center justify-center min-h-[160px] border-2 border-dashed border-border">
                  <span className="font-ui text-ui-xs text-light">Uploaded vendor invoice</span>
                </div>
                <div>
                  <div className="font-ui text-ui-xs text-light uppercase tracking-wider mb-3">Extracted</div>
                  {['Vendor: Sharma Fabrics', 'Invoice #: SF-2026-089', 'Date: 15 Mar 2026', 'Amount: ₹36,330'].map((f) => (
                    <div key={f} className="font-mono text-[12px] text-dark py-1 border-b border-border">{f}</div>
                  ))}
                </div>
              </div>
            </div>
            <p className="font-ui text-[13px] text-light mt-2">Scan a vendor bill. Fix what the OCR got wrong. Post it.</p>
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="marketing-container">
            <Link href="/signup" className="marketing-btn-primary text-[16px] px-7 py-3.5 no-underline">
              Start with invoicing <span className="cta-arrow">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
