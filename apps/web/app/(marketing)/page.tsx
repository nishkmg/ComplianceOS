// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

const benefits = [
  { icon: 'account_balance', title: 'Books balance', desc: 'Automated double-entry reconciliation that actually adds up to zero.' },
  { icon: 'description', title: 'GST done', desc: 'One-click GSTR filing with auto-matching for ITC claims.' },
  { icon: 'analytics', title: 'Reports look like reports', desc: 'Print-ready financial statements formatted for Indian bank compliance.' },
  { icon: 'pin', title: 'Indian numbers', desc: 'Native support for lakhs, crores, and the Indian comma system.' },
  { icon: 'event_available', title: 'FY closes', desc: 'Seamless financial year transition with zero data loss or duplication.' },
];

const modules = [
  {
    title: 'Accounting & Ledger Management',
    desc: 'Maintain a crystal clear audit trail. From journal entries to ledger balancing, ComplianceOS ensures every rupee is accounted for with physical-ledger accuracy.',
    features: ['Real-time double entry validation', 'Multi-entity consolidation'],
  },
  {
    title: 'GST Compliance & Filing',
    desc: 'Never fear an audit again. Our GST module handles HSN/SAC codes, auto-calculates SGST/CGST/IGST, and generates JSON files ready for the GST portal.',
    features: ['Auto-matched GSTR-2B reconciliation', 'E-way bill integration'],
  },
  {
    title: 'Smart Invoicing',
    desc: 'Create professional, GST-compliant invoices in seconds. Manage receivables with automated payment reminders and multi-currency support.',
    features: [],
  },
];

const testimonials = [
  {
    quote: '"ComplianceOS is the first tool that understands how Indian businesses actually operate. The GST reconciliation alone saves our team 20 hours a week."',
    name: 'Arjun Mehta', role: 'CEO, Bharat Logistics',
  },
  {
    quote: '"As a CA, I recommend ComplianceOS to all my clients. The audit trails are bulletproof and the reporting format is exactly what banks need."',
    name: 'Priya Sharma', role: 'Senior Partner, Sharma & Co.',
  },
];

export default function HomePage() {
  const [demoTab, setDemoTab] = useState(0);
  const demoTabs = ['Dashboard', 'New Entry', 'P&L', 'GST'];

  return (
    <div className="bg-page-bg">
      <MarketingNav />

      {/* ═══ Hero Section ═══ */}
      <header className="pt-32 pb-24 px-8 mx-auto" style={{ maxWidth: '1320px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div style={{ maxWidth: '576px' }}>
            <div className="text-ui-xs font-medium text-amber-text uppercase mb-6 tracking-widest">
              Made for India
            </div>
            <h1 className="font-display leading-[1.1] text-dark mb-8" style={{ fontSize: 'var(--marketing-hero)', fontWeight: 400 }}>
              The accounting software that thinks in lakhs, not thousands.
            </h1>
            <p className="text-[18px] leading-[1.6] font-normal mb-10" style={{ color: '#5f5e5e', maxWidth: '512px' }}>
              Rigorous accounting precision built specifically for Indian fiscal realities. GST, Payroll, and Audit trails that CAs actually trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-[#C8860A] text-white font-ui text-[14px] font-bold uppercase tracking-widest no-underline group rounded-none hover:opacity-90 transition-all" style={{ padding: '16px 32px' }}>
                Get Started Today <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border border-dark text-dark font-ui text-[14px] font-bold uppercase tracking-widest no-underline rounded-none hover:bg-dark hover:text-white transition-all" style={{ padding: '16px 32px' }}>
                Book a Demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="shadow-screenshot border border-border-subtle overflow-hidden" style={{ filter: 'grayscale(0.2) contrast(1.05)' }}>
              <div className="bg-section-muted px-4 py-3 flex items-center gap-2 border-b border-border-subtle">
                <div className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                <div className="w-3 h-3 rounded-full bg-[#C8860A]" />
                <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
                <span className="ml-4 text-ui-xs text-light">app.complianceos.in</span>
              </div>
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-ui-xs uppercase tracking-wider text-light mb-1">Active Fiscal Year</div>
                    <div className="font-mono text-ui-sm text-amber font-medium">FY 2026-27</div>
                  </div>
                  <div className="text-ui-xs text-light">Good morning, Mehta Textiles</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Revenue (MTD)', value: '₹12,45,000', color: 'text-amber' },
                    { label: 'Expenses (MTD)', value: '₹8,45,200', color: 'text-danger' },
                    { label: 'Net Profit (MTD)', value: '₹3,99,800', color: 'text-success' },
                    { label: 'Cash Balance', value: '₹24,50,000', color: 'text-dark' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="border border-border-subtle rounded p-3" style={{ borderTop: '2px solid #C8860A' }}>
                      <div className="text-ui-xs uppercase tracking-wider text-light mb-1">{kpi.label}</div>
                      <div className={`font-mono text-ui-sm font-medium ${kpi.color}`}>{kpi.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Social Proof ═══ */}
      <section className="bg-section-muted py-16 border-y border-border-subtle">
        <div className="px-8 mx-auto text-center" style={{ maxWidth: '1200px' }}>
          <p className="text-ui-xs font-medium text-light uppercase tracking-widest mb-10">
            Trusted by India's leading firms &amp; CAs
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-60" style={{ filter: 'contrast(1.25)' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-section-muted border border-border-subtle flex items-center justify-center text-ui-xs text-light">
                LOGO {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Core Benefits ═══ */}
      <section className="py-32 px-8 mx-auto" style={{ maxWidth: '1320px' }}>
        <div className="mb-16">
          <div className="text-ui-xs font-medium text-amber-text uppercase tracking-widest">Built for precision</div>
          <h2 className="font-display text-display-xl mt-4" style={{ maxWidth: '544px' }}>
            Ledger-first design for the modern Indian enterprise.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-surface p-8 border border-border-subtle shadow-card transition-shadow" style={{ borderTop: '2px solid #C8860A' }}>
              <div className="text-[#C8860A] mb-6 text-2xl" aria-hidden="true">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-ui-lg font-bold text-dark mb-4">{b.title}</h3>
              <p className="text-ui-sm" style={{ color: '#5f5e5e' }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Product Demo ═══ */}
      <section className="bg-dark py-32 overflow-hidden">
        <div className="px-8 mx-auto" style={{ maxWidth: '1320px' }}>
          <div className="text-center mb-16">
            <h2 className="font-display text-display-xl text-white mb-6">Experience the precision.</h2>
            <div className="flex justify-center gap-8 border-b border-white/10 mx-auto" style={{ maxWidth: '600px' }}>
              {demoTabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setDemoTab(i)}
                  className={`pb-4 text-ui-sm px-4 transition-colors cursor-pointer bg-transparent border-none font-medium tracking-wide ${
                    i === demoTab
                      ? 'text-white border-b-2 border-[#C8860A]'
                      : 'text-stone-500 hover:text-stone-300 border-b-2 border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mx-auto" style={{ maxWidth: '1024px' }}>
            <div className="bg-[#1A1A1A] rounded-lg border border-white/10 p-2 shadow-2xl">
              <div className="rounded min-h-[300px] flex items-center justify-center bg-[#222] opacity-90 text-light">
                <div className="text-center p-8">
                  <div className="text-white text-display-md font-display mb-4">
                    {['Dashboard overview with real-time KPIs', 'Journal entry with balance bar', 'Schedule III P&L report', 'GSTR-3B summary'][demoTab]}
                  </div>
                  <p className="text-ui-sm" style={{ color: '#5f5e5e' }}>
                    {['Revenue, expenses, net profit — all in Indian numbering format.',
                      'Double-entry enforced. Post blocked until balance hits ₹0.00.',
                      'Typeset for print. Send directly to your CA.',
                      'Auto-populated from your entries. Enter ARN, done.'][demoTab]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Feature Modules ═══ */}
      <section className="py-32 px-8 mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="text-center mb-24">
          <div className="text-ui-xs font-medium text-amber-text uppercase tracking-widest">Complete Control</div>
          <h2 className="font-display text-display-xl mt-4">Modules built for Indian scale.</h2>
        </div>
        <div className="space-y-24">
          {modules.map((m, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className={i === 1 ? 'order-2 md:order-1' : ''}>
                <div className="bg-section-muted p-8 border border-border-subtle shadow-screenshot">
                  <div className="min-h-[200px] flex items-center justify-center text-ui-sm text-light bg-white">
                    Module screenshot {i + 1}
                  </div>
                </div>
              </div>
              <div className={i === 1 ? 'order-1 md:order-2' : ''}>
                <h3 className="font-display text-display-lg mb-6">{m.title}</h3>
                <p className="text-ui-md mb-8" style={{ color: '#5f5e5e' }}>{m.desc}</p>
                {m.features.length > 0 && (
                  <ul className="space-y-4">
                    {m.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-ui-sm" style={{ color: '#5f5e5e' }}>
                        <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#C8860A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {i === 2 && (
                  <Link href="/features/invoicing" className="inline-flex items-center gap-2 text-amber font-bold text-ui-sm no-underline mt-8 group">
                    Explore Invoicing <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="bg-section-muted py-32 px-8 border-y border-border-subtle overflow-hidden">
        <div className="mx-auto" style={{ maxWidth: '1320px' }}>
          <div className="text-center mb-16">
            <div className="text-ui-xs font-medium text-amber-text uppercase tracking-widest">Testimonials</div>
            <h2 className="font-display text-display-xl mt-4">Loved by Founders &amp; CAs.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white p-12 border border-border-subtle relative">
                <div className="text-[#C8860A] text-6xl opacity-20 absolute top-8 left-8 font-display leading-none" aria-hidden="true">"</div>
                <p className="text-ui-md italic font-display leading-relaxed mb-8 relative z-10" style={{ color: '#211b13' }}>{t.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-section-muted border border-border-subtle" />
                  <div>
                    <p className="font-bold text-ui-sm text-dark">{t.name}</p>
                    <p className="text-ui-xs text-light uppercase tracking-tighter">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Conversion CTA ═══ */}
      <section className="py-32 px-8" style={{ background: 'rgba(200,134,10,0.06)' }}>
        <div className="mx-auto text-center border border-amber/20 p-16 bg-white/50 backdrop-blur-sm" style={{ maxWidth: '800px' }}>
          <h2 className="font-display text-display-xl mb-6">Ready to bring precision to your books?</h2>
          <p className="text-ui-lg mb-10" style={{ color: '#5f5e5e' }}>Join 5,000+ Indian businesses managing their compliance with zero stress.</p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link href="/signup" className="inline-flex items-center bg-[#C8860A] text-white font-ui text-ui-sm font-bold uppercase tracking-widest no-underline group rounded-none hover:opacity-90 transition-all" style={{ padding: '20px 40px' }}>
              Start Free Trial <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/contact" className="inline-flex items-center border border-dark text-dark font-ui text-ui-sm font-bold uppercase tracking-widest no-underline rounded-none hover:bg-dark hover:text-white transition-all" style={{ padding: '20px 40px' }}>
              Talk to Us
            </Link>
          </div>
          <p className="text-ui-xs text-light mt-8">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
