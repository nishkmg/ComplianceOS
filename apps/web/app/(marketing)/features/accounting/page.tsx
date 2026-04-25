// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

export default function AccountingPage() {
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
            <SectionLabel>Accounting</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-6">
              Double-entry accounting that enforces what your CA has always asked for.
            </h1>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-4">The balance constraint</h2>
            <div className="border border-border rounded-lg p-8 bg-surface text-center">
              <div className="flex items-center justify-center gap-8 mb-4">
                <div><div className="font-ui text-ui-xs text-light mb-1">Total Debit</div><div className="font-mono text-[15px]">₹25,000.00</div></div>
                <div><div className="font-ui text-ui-xs text-light mb-1">Total Credit</div><div className="font-mono text-[15px]">₹25,000.00</div></div>
                <div><div className="font-ui text-ui-xs text-light mb-1">Difference</div><div className="font-mono text-[15px] text-success">✓ ₹0.00</div></div>
              </div>
              <div className="font-ui text-ui-sm text-success">Ready to Post</div>
            </div>
            <p className="font-ui text-[15px] text-mid mt-4">Posting is blocked until debits equal credits. The UI enforces what your accountant has always manually checked.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">Chart of Accounts</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <div className="space-y-1 font-mono text-[13px]">
                <div className="font-ui text-ui-xs text-light uppercase tracking-wider mb-3">Assets — Dr balance</div>
                <div className="text-light pl-4">1010 <span className="font-ui text-mid">Cash Account</span> <span className="float-right">₹1,50,000</span></div>
                <div className="text-light pl-4">1020 <span className="font-ui text-mid">Bank Account</span> <span className="float-right">₹8,25,000</span></div>
                <div className="text-light pl-4">1030 <span className="font-ui text-mid">Trade Receivables</span> <span className="float-right">₹3,10,000</span></div>
                <div className="border-t border-border pt-2 mt-2 font-ui text-dark font-medium">Total Assets: <span className="float-right font-mono">₹12,85,000</span></div>
              </div>
            </div>
            <p className="font-ui text-[13px] text-light mt-2">Dr/Cr labels — not +/−. 4-level hierarchy. Indian account codes.</p>
          </div>
        </section>

        <section className="py-16 bg-section-muted">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-6">
                <h3 className="font-ui text-ui-sm font-medium text-dark mb-4">P&amp;L — Schedule III</h3>
                <div className="font-mono text-[11px] space-y-2">
                  <div className="text-light">I. Revenue from Operations</div>
                  <div className="pl-4">Sales <span className="float-right">₹25,00,000</span></div>
                  <div className="border-t border-border pt-2 font-ui text-dark font-medium">Total Revenue <span className="float-right font-mono">₹25,00,000</span></div>
                  <div className="text-light mt-2">V. Profit Before Tax</div>
                  <div className="text-success font-medium">₹4,50,000</div>
                </div>
              </div>
              <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-6">
                <h3 className="font-ui text-ui-sm font-medium text-dark mb-4">Balance Sheet</h3>
                <div className="font-mono text-[11px] space-y-2">
                  <div className="text-light">I. Equity &amp; Liabilities</div>
                  <div className="pl-4">Capital <span className="float-right">₹18,00,000</span></div>
                  <div className="border-t border-border pt-2 font-ui text-dark font-medium">Total <span className="float-right font-mono">₹18,00,000</span></div>
                  <div className="text-light mt-2">II. Assets</div>
                  <div className="text-success font-medium">₹18,00,000 ✓</div>
                </div>
              </div>
            </div>
            <p className="font-ui text-[13px] text-light mt-2">Typeset for print. Send to your CA directly — no export, no formatting.</p>
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="marketing-container">
            <Link href="/signup" className="marketing-btn-primary text-[16px] px-7 py-3.5 no-underline">
              Start with the accounting module <span className="cta-arrow">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
