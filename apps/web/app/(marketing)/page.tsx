// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function HomePage() {
  const [demoTab, setDemoTab] = useState('Dashboard');

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
      points: ['Real-time double entry validation', 'Multi-entity consolidation'],
      image: '/images/homepage/module-accounting.jpg',
      alt: 'Detailed view of a financial ledger spreadsheet'
    },
    {
      title: 'GST Compliance & Filing',
      desc: 'Never fear an audit again. Our GST module handles HSN/SAC codes, auto-calculates SGST/CGST/IGST, and generates JSON files ready for the GST portal.',
      points: ['Auto-matched GSTR-2B reconciliation', 'E-way bill integration'],
      image: '/images/homepage/module-gst.jpg',
      alt: 'GST filing confirmation screen',
      reverse: true
    },
    {
      title: 'Smart Invoicing',
      desc: 'Create professional, GST-compliant invoices in seconds. Manage receivables with automated payment reminders and multi-currency support.',
      points: [],
      image: '/images/homepage/module-invoicing.jpg',
      alt: 'Professional invoice template',
      cta: { label: 'Explore Invoicing', href: '/features/invoicing' }
    }
  ];

  const testimonials = [
    {
      quote: "ComplianceOS is the first tool that understands how Indian businesses actually operate. The GST reconciliation alone saves our team 20 hours a week.",
      author: "Arjun Mehta",
      role: "CEO, Bharat Logistics",
      image: "/images/homepage/person-arjun.jpg"
    },
    {
      quote: "As a CA, I recommend ComplianceOS to all my clients. The audit trails are bulletproof and the reporting format is exactly what banks need.",
      author: "Priya Sharma",
      role: "Senior Partner, Sharma & Co.",
      image: "/images/homepage/person-priya.jpg"
    }
  ];

  return (
    <div className="bg-page-bg text-on-surface font-ui-md selection:bg-primary-fixed min-h-screen">
      <MarketingNav />

      <main id="main-content">
        {/* ─── Hero Section ─── */}
        <header className="px-8 max-w-[1320px] mx-auto" style={{ paddingTop: '128px', paddingBottom: '96px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl text-left">
              <span className="text-[12px] font-medium text-amber-text uppercase tracking-[0.2em] mb-6 block">Made for India</span>
              <h1 className="font-display text-on-surface mb-8 leading-[1.1]" style={{ fontSize: '64px', fontWeight: 400 }}>
              The accounting software that thinks in lakhs, not thousands.
            </h1>
              <p className="text-ui-lg font-ui-lg text-secondary mb-10 max-w-lg leading-[1.5]">
                Rigorous accounting precision built specifically for Indian fiscal realities. GST, Payroll, and Audit trails that CAs actually trust.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/signup" 
                  className="bg-[#C8860A] text-white px-8 py-4 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-[#825500] transition-all group rounded-none inline-flex items-center gap-1"
                >
                  Get Started Today <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link 
                  href="/contact" 
                  className="border border-on-surface text-on-surface px-8 py-4 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-on-surface hover:text-white transition-all rounded-none inline-flex items-center gap-1"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                className="w-full h-auto shadow-screenshot border-[0.5px] border-border-subtle grayscale-[0.2] contrast-[1.05]" 
                src="/images/homepage/hero-dashboard.jpg" 
                alt="Modern minimalist accounting software dashboard" 
              />
              <div className="absolute -bottom-6 -left-6 bg-white border-[0.5px] border-border-subtle p-6 hidden lg:block shadow-lg">
                <p className="font-mono text-[18px] text-[#825500] font-bold">₹ 1,45,00,000.00</p>
                <p className="text-ui-xs font-ui-xs text-text-light uppercase tracking-tighter">Current FY Revenue</p>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Social Proof ─── */}
        <section className="bg-[#F4F2EE] border-y-[0.5px] border-border-subtle" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
          <div className="max-w-[1200px] mx-auto px-8 text-center">
            <p className="text-ui-xs font-ui-xs text-center text-text-light uppercase tracking-widest mb-10">Trusted by India's leading firms &amp; CAs</p>
            <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-60 contrast-125">
              <div className="h-8 flex items-center font-bold text-light opacity-50 tracking-widest">LOGO 1</div>
              <div className="h-8 flex items-center font-bold text-light opacity-50 tracking-widest">LOGO 2</div>
              <div className="h-8 flex items-center font-bold text-light opacity-50 tracking-widest">LOGO 3</div>
              <div className="h-8 flex items-center font-bold text-light opacity-50 tracking-widest">LOGO 4</div>
              <div className="h-8 flex items-center font-bold text-light opacity-50 tracking-widest">LOGO 5</div>
            </div>
          </div>
        </section>

        {/* ─── Core Benefits ─── */}
        <section className="px-8 max-w-[1320px] mx-auto" style={{ paddingTop: '128px', paddingBottom: '128px' }}>
          <div className="mb-16 text-left">
            <span className="text-ui-xs font-ui-xs text-amber-text uppercase tracking-widest">Built for precision</span>
            <h2 className="font-display text-display-xl mt-4 max-w-2xl font-normal leading-[1.2]" style={{ fontSize: '38px' }}>Ledger-first design for the modern Indian enterprise.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white p-8 border-[0.5px] border-border-subtle border-t-2 border-t-[#C8860A] shadow-card transition-all hover:shadow-lg group rounded-none">
                <span className="mb-6 text-primary text-3xl block group-hover:scale-110 transition-transform">
                  {/* Mock for Material Icon */}
                  <div className="w-8 h-8 flex items-center justify-center font-mono text-sm border border-primary rounded-full">{b.icon[0].toUpperCase()}</div>
                </span>
                <h3 className="font-ui text-ui-lg font-bold mb-4 text-dark">{b.title}</h3>
                <p className="font-ui text-ui-sm text-secondary leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Product Demo ─── */}
        <section className="bg-section-dark overflow-hidden text-center" style={{ paddingTop: '128px', paddingBottom: '128px' }}>
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="mb-16">
              <h2 className="font-display text-white mb-6 font-normal" style={{ fontSize: '38px' }}>Experience the precision.</h2>
              <div className="flex justify-center gap-8 border-b border-white/10">
                {['Dashboard', 'New Entry', 'P&L', 'GST'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setDemoTab(tab)}
                    className={`pb-4 text-ui-sm font-ui transition-colors cursor-pointer border-none bg-transparent ${demoTab === tab ? 'text-white border-b-2 border-[#C8860A]' : 'text-stone-500 hover:text-stone-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-[#1A1A1A] rounded-lg border border-white/10 p-2 shadow-2xl">
                <img 
                  className="w-full rounded-md opacity-90 contrast-125" 
                  src="/images/homepage/demo-screenshot.jpg" 
                  alt="Product UI" 
                />
              </div>
              <div className="absolute -right-12 top-1/4 bg-[#C8860A] p-6 hidden xl:block shadow-2xl">
                <span className="text-white text-4xl block mb-2">🔒</span>
                <p className="text-white font-ui-xs mt-2 uppercase tracking-widest font-bold">Bank-grade Security</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Feature Grid ─── */}
        <section className="px-8 max-w-[1200px] mx-auto text-center" style={{ paddingTop: '128px', paddingBottom: '128px' }}>
          <div className="mb-24">
            <span className="text-ui-xs font-ui-xs text-amber-text uppercase tracking-widest">Complete Control</span>
            <h2 className="font-display mt-4 font-normal leading-[1.15]" style={{ fontSize: '48px' }}>Modules built for Indian scale.</h2>
          </div>
          <div className="space-y-24">
            {modules.map((m, i) => (
              <div key={m.title} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
                <div className={m.reverse ? 'order-1 md:order-2' : ''}>
                  <h3 className="font-display text-display-lg mb-6 font-normal" style={{ fontSize: '26px' }}>{m.title}</h3>
                  <p className="text-ui-md text-secondary mb-8 leading-relaxed">{m.desc}</p>
                  {m.points.length > 0 && (
                    <ul className="space-y-4 list-none p-0 m-0">
                      {m.points.map((p) => (
                        <li key={p} className="flex items-center gap-3 font-ui text-ui-sm text-secondary">
                          <span className="text-primary font-bold">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.cta && (
                    <Link 
                      href={m.cta.href} 
                      className="text-[#C8860A] font-bold font-ui text-ui-sm flex items-center gap-2 group no-underline mt-8"
                    >
                      {m.cta.label} <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  )}
                </div>
                <div className={`bg-section-muted p-8 border-[0.5px] border-border-subtle ${m.reverse ? 'order-2 md:order-1' : ''}`}>
                  <img 
                    className="w-full h-auto shadow-screenshot grayscale contrast-110" 
                    src={m.image} 
                    alt={m.alt} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="bg-section-muted px-8 border-y-[0.5px] border-border-subtle overflow-hidden" style={{ paddingTop: '128px', paddingBottom: '128px' }}>
          <div className="max-w-[1320px] mx-auto text-center">
            <div className="mb-16">
              <span className="text-ui-xs font-ui-xs text-amber-text uppercase tracking-widest">Testimonials</span>
              <h2 className="font-display text-display-xl mt-4 font-normal">Loved by Founders &amp; CAs.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {[
                { quote: "ComplianceOS is the first tool that understands how Indian businesses actually operate. The GST reconciliation alone saves our team 20 hours a week.", author: "Arjun Mehta", role: "CEO, Bharat Logistics", image: "/images/homepage/person-arjun.jpg" },
                { quote: "As a CA, I recommend ComplianceOS to all my clients. The audit trails are bulletproof and the reporting format is exactly what banks need.", author: "Priya Sharma", role: "Senior Partner, Sharma & Co.", image: "/images/homepage/person-priya.jpg" },
              ].map((t) => (
                <div key={t.author} className="bg-white p-12 border-[0.5px] border-border-subtle relative group hover:border-[#C8860A] transition-all rounded-none">
                  <span className="text-[#C8860A] text-6xl opacity-20 absolute top-8 left-8 select-none font-display">"</span>
                  <p className="text-ui-lg italic font-display text-on-surface mb-8 relative z-10 leading-relaxed font-normal">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img className="w-12 h-12 rounded-none object-cover grayscale" src={t.image} alt={t.author} />
                    <div>
                      <p className="font-bold font-ui text-ui-sm">{t.author}</p>
                      <p className="text-ui-xs font-ui text-light uppercase tracking-tighter">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Conversion Section ─── */}
        <section className="px-8 bg-section-amber" style={{ paddingTop: '128px', paddingBottom: '128px' }}>
          <div className="max-w-[800px] mx-auto text-center border-[0.5px] border-primary/20 p-16 bg-white/50 backdrop-blur-sm shadow-xl rounded-none">
            <h2 className="font-display text-display-xl md:text-marketing-xl mb-6 font-normal">Ready to bring precision to your books?</h2>
            <p className="text-ui-lg text-secondary mb-10">Join 5,000+ Indian businesses managing their compliance with zero stress.</p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <Link href="/signup" className="bg-[#C8860A] text-white px-10 py-5 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-[#825500] transition-all group rounded-none inline-flex items-center gap-1">
                Start Free Trial <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/contact" className="border border-on-surface text-on-surface px-10 py-5 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-on-surface hover:text-white transition-all rounded-none inline-flex items-center gap-1">
                Talk to Us
              </Link>
            </div>
            <p className="text-ui-xs font-ui text-text-light mt-8">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
