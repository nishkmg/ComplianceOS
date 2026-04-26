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
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNXThbfELK5AhC0elKySL96OfB0dLGfwyxGnnLZs1_nZ7U5c0p-NpwSJyUIvu9EKLzGNRiG3daLtJ0zK7oN9CxjuI42_nIVnWTCquOkvJuXptM02rZcx4WmTXTV9hqR3h6J5FloUHtDeLhxTWh5kmgmhYCePfZh_v-KcPERqunSW46wE_ymY0LpX6j4gzIf-YWAPNJHS_O1egKCXtW3xdfdielPbDB7FrNLi84ia40FNOrVP9Q1j8PBD1O_WZNkES4LdvVd4c7_g8',
  },
  {
    title: 'GST Compliance & Filing',
    desc: 'Never fear an audit again. Our GST module handles HSN/SAC codes, auto-calculates SGST/CGST/IGST, and generates JSON files ready for the GST portal.',
    features: ['Auto-matched GSTR-2B reconciliation', 'E-way bill integration'],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGQFVxictEH7e8HWK8fhANk-4yHxrtDwhrPwGEDHXQRUYzmIeudBS_Pxro_eZIsTRbus8j22Fm2llDuZ_fJ9FFt7Ov4OXtD1hGTmYb-Qx38CO3GZk5DXnGZ93n1p8WzSRWoO5xfN7IuJ372_IcfDAmthlZrqToD7KxC8AMU4hD51U91S63vcB4zZDXZjSstz8xvhvIFzN5kcgMft6xPOP-eTM6Og7LmUGdyQOA8pK-Gi4Pi44dWqFtOaX7LE4r6gyyCnIGPORBwmU',
  },
  {
    title: 'Smart Invoicing',
    desc: 'Create professional, GST-compliant invoices in seconds. Manage receivables with automated payment reminders and multi-currency support.',
    features: [],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsuB9Zh-ox2KgNp0CyfUm1KQBs0eHJV0hvhWaLMxjmRYszXz2pUuf37iACp7H6qDyVnDJBxNwzrzf0SmocsoxBOM59B2prhc6FXQq-rWWYUaPaPPv7AP5vLT8aQPpZf_thoyrob4pGiENuH7BII6wpJHzQDceyc0QHfRH7do6S4UoNpeqeILFqmtOzOp3VF5I35e9Y_IWLC0j7eXrCCCCIm0Co79-Ks7zjKt8-gMOyAwHgmypzYqzGAzV046yeYpWz5lvn-Fm1DYc',
  },
];

const testimonials = [
  {
    quote: '"ComplianceOS is the first tool that understands how Indian businesses actually operate. The GST reconciliation alone saves our team 20 hours a week."',
    name: 'Arjun Mehta',
    role: 'CEO, Bharat Logistics',
  },
  {
    quote: '"As a CA, I recommend ComplianceOS to all my clients. The audit trails are bulletproof and the reporting format is exactly what banks need."',
    name: 'Priya Sharma',
    role: 'Senior Partner, Sharma & Co.',
  },
];

export default function HomePage() {
  const [demoTab, setDemoTab] = useState(0);
  const demoTabs = ['Dashboard', 'New Entry', 'P&L', 'GST'];

  return (
    <div className="bg-page-bg min-h-screen font-['Syne']">
      <MarketingNav />

      {/* ═══ Hero Section ═══ */}
      <header className="pt-[128px] pb-[96px] px-8" style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div style={{ maxWidth: '576px' }}>
            <span className="text-[12px] font-[500] text-amber-text uppercase mb-6 block" style={{ letterSpacing: '0.2em' }}>
              Made for India
            </span>
            <h1 className="font-display leading-[1.1] font-[400] text-dark mb-8" style={{ fontSize: 'var(--marketing-hero)' }}>
              The accounting software that thinks in lakhs, not thousands.
            </h1>
            <p className="text-[18px] leading-[1.5] font-[400] text-mid mb-10" style={{ maxWidth: '512px' }}>
              Rigorous accounting precision built specifically for Indian fiscal realities. GST, Payroll, and Audit trails that CAs actually trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-amber text-white font-ui font-bold uppercase no-underline group text-[14px] tracking-widest hover:opacity-90 transition-all">
                Get Started Today <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border border-dark text-dark font-ui font-bold uppercase no-underline text-[14px] tracking-widest hover:bg-dark hover:text-white transition-all">
                Book a Demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="shadow-screenshot border-[0.5px] border-border-subtle overflow-hidden" style={{ filter: 'grayscale(0.2) contrast(1.05)' }}>
              <div className="bg-[#F4F2EE] px-4 py-3 flex items-center gap-2 border-b border-border-subtle">
                <div className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                <div className="w-3 h-3 rounded-full bg-[#C8860A]" />
                <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
                <span className="ml-4 text-[12px] text-light">app.complianceos.in</span>
              </div>
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[10px] text-light uppercase tracking-wider mb-1">Active Fiscal Year</div>
                    <div className="font-mono text-[13px] text-amber font-medium">FY 2026-27</div>
                  </div>
                  <div className="text-[11px] text-light">Good morning, Mehta Textiles</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Revenue (MTD)', value: '₹12,45,000', color: 'text-amber' },
                    { label: 'Expenses (MTD)', value: '₹8,45,200', color: 'text-[#ba1a1a]' },
                    { label: 'Net Profit (MTD)', value: '₹3,99,800', color: 'text-[#16A34A]' },
                    { label: 'Cash Balance', value: '₹24,50,000', color: 'text-dark' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="border border-border-subtle rounded-md p-3 border-t-2 border-t-[#C8860A]">
                      <div className="text-[10px] text-light uppercase tracking-wider mb-1">{kpi.label}</div>
                      <div className={`font-mono text-[14px] font-medium ${kpi.color}`}>{kpi.value}</div>
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
        <div className="px-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p className="text-[12px] text-center text-light uppercase tracking-widest mb-10" style={{ fontWeight: 500 }}>
            Trusted by India's leading firms &amp; CAs
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-60" style={{ filter: 'contrast(1.25)' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-section-muted border border-border-subtle flex items-center justify-center text-[12px] text-light">
                LOGO {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Core Benefits ═══ */}
      <section className="py-[128px] px-8" style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div className="mb-16">
          <span className="text-[12px] font-medium text-amber-text uppercase tracking-widest">Built for precision</span>
          <h2 className="font-display text-[38px] leading-[1.2] font-[400] text-dark mt-4" style={{ maxWidth: '544px' }}>
            Ledger-first design for the modern Indian enterprise.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-surface p-8 border border-border-subtle border-t-2" style={{ borderTopColor: '#C8860A' }}>
              <div className="text-amber mb-6 text-2xl" aria-hidden="true">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="font-ui text-[15px] font-bold text-dark mb-4">{b.title}</h3>
              <p className="font-ui text-[14px] text-mid leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Product Demo ═══ */}
      <section className="bg-[#111111] py-[128px] overflow-hidden">
        <div className="px-8" style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div className="text-center mb-16">
            <h2 className="font-display text-[38px] leading-[1.2] font-[400] text-white mb-6">Experience the precision.</h2>
            <div className="flex justify-center gap-8 border-b border-white/10">
              {demoTabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setDemoTab(i)}
                  className={`pb-4 text-[14px] font-ui px-4 transition-colors cursor-pointer bg-transparent border-none ${
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
          <div className="relative" style={{ maxWidth: '1024px', margin: '0 auto' }}>
            <div className="bg-[#1A1A1A] rounded-lg border border-white/10 p-2 shadow-2xl">
              <div className="rounded-md opacity-90 min-h-[300px] flex items-center justify-center bg-[#222] text-light font-ui">
                <div className="text-center p-8">
                  <div className="text-white text-[20px] font-display mb-4">
                    {['Dashboard overview with real-time KPIs', 'Journal entry with balance bar', 'Schedule III P&L report', 'GSTR-3B summary'][demoTab]}
                  </div>
                  <p className="text-[14px]">
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
      <section className="py-[128px] px-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="text-center mb-24">
          <span className="text-[12px] font-medium text-amber-text uppercase tracking-widest">Complete Control</span>
          <h2 className="font-display text-[38px] leading-[1.15] font-[400] text-dark mt-4">
            Modules built for Indian scale.
          </h2>
        </div>
        <div className="space-y-[96px]">
          {modules.map((m, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className={i === 1 ? 'order-2 md:order-1' : ''}>
                <div className="bg-section-muted p-8 border border-border-subtle shadow-screenshot">
                  <div className="min-h-[200px] flex items-center justify-center text-light font-ui text-[14px] bg-white">
                    Module screenshot {i + 1}
                  </div>
                </div>
              </div>
              <div className={i === 1 ? 'order-1 md:order-2' : ''}>
                <h3 className="font-display text-[26px] leading-[1.3] font-[400] text-dark mb-6">{m.title}</h3>
                <p className="text-[16px] leading-[1.6] text-mid mb-8">{m.desc}</p>
                {m.features.length > 0 && (
                  <ul className="space-y-4">
                    {m.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 font-ui text-[14px] text-mid">
                        <svg className="w-5 h-5 text-amber flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {i === 2 && (
                  <Link href="/features/invoicing" className="text-amber font-bold text-[14px] flex items-center gap-2 group no-underline mt-8">
                    Explore Invoicing <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="bg-section-muted py-[128px] px-8 border-y border-border-subtle overflow-hidden">
        <div className="px-8" style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div className="text-center mb-16">
            <span className="text-[12px] font-medium text-amber-text uppercase tracking-widest">Testimonials</span>
            <h2 className="font-display text-[38px] leading-[1.2] font-[400] text-dark mt-4">Loved by Founders &amp; CAs.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white p-12 border border-border-subtle relative">
                <div className="text-[#C8860A] text-6xl opacity-20 absolute top-8 left-8 font-display leading-none" aria-hidden="true">"</div>
                <p className="text-[16px] italic font-display text-dark leading-relaxed mb-8 relative z-10">{t.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-section-muted border border-border-subtle" />
                  <div>
                    <p className="font-bold text-[14px] text-dark">{t.name}</p>
                    <p className="text-[12px] text-light uppercase tracking-tighter">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Conversion CTA ═══ */}
      <section className="py-[128px] px-8" style={{ background: 'rgba(200,134,10,0.06)' }}>
        <div className="text-center border border-amber/20 p-16 bg-white/50 backdrop-blur-sm" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="font-display text-[38px] leading-[1.15] font-[400] text-dark mb-6">Ready to bring precision to your books?</h2>
          <p className="text-[18px] leading-[1.5] text-mid mb-10">Join 5,000+ Indian businesses managing their compliance with zero stress.</p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link href="/signup" className="inline-flex items-center px-10 py-5 bg-amber text-white font-ui font-bold uppercase no-underline text-[14px] tracking-widest group hover:opacity-90 transition-all">
              Start Free Trial <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/contact" className="inline-flex items-center px-10 py-5 border border-dark text-dark font-ui font-bold uppercase no-underline text-[14px] tracking-widest hover:bg-dark hover:text-white transition-all">
              Talk to Us
            </Link>
          </div>
          <p className="text-[12px] text-light mt-8">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
