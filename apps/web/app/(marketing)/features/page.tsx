// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

export default function FeaturesPage() {
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const modules = [
    { href: '/features/accounting', name: 'Accounting & Ledger', desc: 'Double-entry ledger, chart of accounts, journal entries, trial balance, P&L, balance sheet, cash flow — all the reports your CA asks for.', bullets: ['Double-entry enforced at the UI level', 'Schedule III P&L and Balance Sheet', 'Hierarchical chart of accounts (4 levels)'], image: 'Accounting' },
    { href: '/features/gst', name: 'GST Filing', desc: 'GSTR-1, GSTR-2B, and GSTR-3B generated from your own entries. No re-entering data into the GST portal format.', bullets: ['GSTR-1 auto-generated from invoices', 'GSTR-2B fetched and ITC reconciled', 'GSTR-3B summary with tax payable'], image: 'GST' },
    { href: '/features/invoicing', name: 'Invoicing', desc: 'GST-compliant invoices that post to your books automatically. No double entry between invoicing and accounting.', bullets: ['Automatic CGST/SGST/IGST calculation', 'Invoice → Journal entry in one click', 'OCR scan for vendor bills'], image: 'Invoicing' },
    { href: '/features/payroll', name: 'Payroll', desc: 'PF, ESI, Professional Tax, TDS — all statutory components calculated automatically. Payslips self-serve for employees.', bullets: ['PF at 12% of basic — auto-calculated', 'Professional Tax by state — auto-set', 'TDS projection updated monthly'], image: 'Payroll' },
    { href: '/features/itr', name: 'ITR Returns', desc: 'From P&L to tax computation to filing. Old vs new regime comparison built in. No re-entry at year end.', bullets: ['Regime comparison from actual books', 'Presumptive scheme (44AD/44ADA)', 'Self-assessment tax calculation'], image: 'ITR' },
  ];

  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <section ref={heroRef} className="animate-in py-24 md:py-32">
          <div className="marketing-container text-center max-w-3xl">
            <SectionLabel>Features</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-6">
              Every module your accountant wanted.<br />Built together, not bolted on.
            </h1>
            <p className="font-ui text-[16px] md:text-[18px] text-mid leading-relaxed">
              Five integrated modules. One data model. Zero re-entry.
            </p>
          </div>
        </section>

        <section className="pb-24 md:pb-32">
          <div className="marketing-container space-y-24">
            {modules.map((m, i) => (
              <div key={m.href} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text side */}
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <Link href={m.href} className="no-underline group">
                    <h2 className="font-display text-[26px] text-dark mb-4">{m.name}</h2>
                  </Link>
                  <p className="font-ui text-[16px] text-mid leading-relaxed mb-6">{m.desc}</p>
                  <ul className="space-y-3 mb-6 list-none p-0">
                    {m.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 font-ui text-[15px] text-mid">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href={m.href} className="font-ui text-[15px] font-medium text-amber-text hover:underline no-underline inline-flex items-center gap-1">
                    Explore {m.name.split(' ')[0]} <span className="cta-arrow">→</span>
                  </Link>
                </div>
                {/* Screenshot side */}
                <div className={`rounded-xl shadow-card overflow-hidden bg-surface border border-border min-h-[200px] flex items-center justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="text-center p-8">
                    <div className="font-display text-display-md text-dark mb-2">{m.image} Module</div>
                    <p className="font-ui text-ui-sm text-light">Authentic screenshot of the {m.name} screen.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
