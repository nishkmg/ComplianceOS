'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { Icon } from '@/components/ui/icon';

export default function HomePage() {
  const [demoTab, setDemoTab] = useState('Dashboard');

  const benefits = [
    { icon: 'account_balance', title: 'Books balance', desc: 'Automated double-entry reconciliation that actually adds up to zero.' },
    { icon: 'description', title: 'GST done', desc: 'One-click GSTR filing with auto-matching for ITC claims.' },
    { icon: 'analytics', title: 'Reports look like reports', desc: 'Print-ready financial statements formatted for Indian bank compliance.' },
    { icon: 'pin', title: 'Indian numbers', desc: 'Native support for lakhs, crores, and the Indian comma system.' },
    { icon: 'event_available', title: 'FY closes', desc: 'Seamless financial year transition with zero data loss or duplication.' },
  ];

  const modules: Array<{ title: string; desc: string; points: string[]; image: string; alt: string; cta?: { label: string; href: string }; reverse?: boolean }> = [
    {
      title: 'Accounting & Ledger Management',
      desc: 'Maintain a crystal clear audit trail. From journal entries to ledger balancing, ComplianceOS ensures every rupee is accounted for with physical-ledger accuracy.',
      points: ['Real-time double entry validation', 'Multi-entity consolidation'],
      image: '/images/homepage/module-accounting.png',
      alt: 'Detailed view of a financial ledger spreadsheet'
    },
    {
      title: 'Smart Invoicing',
      desc: 'Create professional, GST-compliant invoices in seconds. Manage receivables with automated payment reminders and multi-currency support.',
      points: [],
      image: '/images/homepage/module-invoicing.png',
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
    <div className="bg-page-bg text-dark font-ui selection:bg-primary-fixed min-h-screen">
      <MarketingNav />

      <main id="main-content">
        {/* ─── Hero Section ─── */}
        <header className="px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl text-left">
              <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-6 block">Made for India</span>
              <h1 className="font-display text-marketing-hero text-dark mb-8 leading-tight font-semibold tracking-tight">
                The accounting software that thinks in lakhs, not thousands.
              </h1>
              <p className="text-ui-lg font-ui text-secondary mb-10 max-w-lg leading-relaxed">
                Rigorous accounting precision built specifically for Indian fiscal realities. GST, Payroll, and Audit trails that CAs actually trust.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/signup" 
                  className="bg-amber text-white px-8 py-4 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-amber-hover transition-all group rounded-none inline-flex items-center gap-1"
                >
                  Get Started Today <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link 
                  href="/contact" 
                  className="border border-border-subtle text-dark px-8 py-4 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-on-surface hover:text-white transition-all rounded-none inline-flex items-center gap-1"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="shadow-screenshot overflow-hidden rounded-xl border border-border-subtle">
                <div className="browser-chrome">
                  <div className="browser-dot bg-[#FF5F56]"></div>
                  <div className="browser-dot bg-[#FFBD2E]"></div>
                  <div className="browser-dot bg-[#27C93F]"></div>
                </div>
                <img 
                  className="w-full h-auto" 
                  src="/images/homepage/hero-dashboard.png" 
                  alt="ComplianceOS Main Dashboard" 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white border border-border-subtle p-6 hidden lg:block shadow-lg">
                <p className="font-mono text-[18px] text-primary font-bold">₹ 1,45,00,000.00</p>
                <p className="text-ui-xs font-ui text-light uppercase tracking-tighter">Current FY Revenue</p>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Social Proof ─── */}
        <section className="bg-section-muted py-16 border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1200px] mx-auto px-8 text-center">
            <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber text-center mb-10">Trusted by India's leading firms &amp; CAs</p>
            <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-60 contrast-125">
              <img className="h-8" src="/images/homepage/logo1.png" alt="Trusted Brand" />
              <img className="h-8" src="/images/homepage/logo2.png" alt="Trusted Brand" />
              <img className="h-8" src="/images/homepage/logo3.png" alt="Trusted Brand" />
              <img className="h-8" src="/images/homepage/logo4.png" alt="Trusted Brand" />
              <img className="h-8" src="/images/homepage/logo5.png" alt="Trusted Brand" />
            </div>
          </div>
        </section>

        {/* ─── Core Benefits ─── */}
        <section className="py-space-128 px-8 max-w-[1320px] mx-auto">
          <div className="mb-16 text-left">
            <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber">Built for precision</span>
            <h2 className="font-display text-marketing-xl mt-4 max-w-2xl font-semibold leading-snug tracking-tight">Ledger-first design for the modern Indian enterprise.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white p-8 border border-border-subtle border-t-2 border-t-amber shadow-card transition-all hover:shadow-lg group rounded-none">
                <Icon name={b.icon} className="text-primary mb-6 block group-hover:scale-110 transition-transform" size={32} />
                <h3 className="font-ui text-ui-lg font-bold mb-4 text-dark">{b.title}</h3>
                <p className="font-ui text-ui-sm text-secondary leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Product Demo ─── */}
        <section className="bg-section-dark py-space-128 overflow-hidden text-center">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="mb-16">
              <h2 className="font-display text-marketing-xl text-white mb-6 font-semibold leading-snug tracking-tight">Experience the precision.</h2>
              <div className="flex justify-center gap-8 border-b border-white/10">
                {['Dashboard', 'New Entry', 'P&L', 'GST'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setDemoTab(tab)}
                    className={`pb-4 text-ui-sm font-ui transition-colors cursor-pointer border-none bg-transparent ${demoTab === tab ? 'text-white border-b-2 border-amber px-4' : 'text-secondary px-4 hover:text-lighter'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative max-w-5xl mx-auto">
              <div className="shadow-2xl overflow-hidden rounded-xl border border-white/10">
                <div className="browser-chrome bg-stone-800">
                  <div className="browser-dot bg-[#FF5F56]"></div>
                  <div className="browser-dot bg-[#FFBD2E]"></div>
                  <div className="browser-dot bg-[#27C93F]"></div>
                </div>
                <img 
                  className="w-full h-auto contrast-[1.1]" 
                  src="/images/homepage/demo-frame.png" 
                  alt="ComplianceOS Live Demo" 
                />
              </div>
              <div className="absolute -right-12 top-1/4 bg-amber p-6 hidden xl:block shadow-2xl">
                <Icon name="lock_reset" className="text-white text-4xl block mb-2" />
                <p className="text-white font-ui mt-2 uppercase tracking-widest font-bold">Bank-grade Security</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Feature Grid ─── */}
        <section className="py-space-128 px-gutter-desktop max-w-[1200px] mx-auto text-center">
          <div className="mb-24">
            <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber">Complete Control</span>
            <h2 className="font-display text-marketing-xl mt-4 font-semibold leading-snug tracking-tight">Modules built for Indian scale.</h2>
          </div>
          <div className="space-y-space-96">
            {modules.map((m, i) => (
              <div key={m.title} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
                <div className={m.reverse ? 'order-1 md:order-2' : ''}>
                  <h3 className="font-display text-display-lg mb-6 font-semibold leading-snug">{m.title}</h3>
                  <p className="text-ui-md text-secondary mb-8 leading-relaxed">{m.desc}</p>
                  {m.points.length > 0 && (
                    <ul className="space-y-4 list-none p-0 m-0">
                      {m.points.map((p) => (
                        <li key={p} className="flex items-center gap-3 font-ui text-ui-sm text-secondary">
                          <Icon name="check_circle" className="text-primary text-sm" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.cta && (
                    <Link 
                      href={m.cta.href} 
                      className="text-amber font-bold font-ui text-ui-sm flex items-center gap-2 group no-underline mt-8"
                    >
                      {m.cta.label} <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  )}
                </div>
                <div className={`bg-section-muted p-4 md:p-8 border border-border-subtle ${m.reverse ? 'order-2 md:order-1' : ''}`}>
                  <div className="shadow-screenshot overflow-hidden rounded-lg">
                    <div className="browser-chrome">
                      <div className="browser-dot bg-[#FF5F56]"></div>
                      <div className="browser-dot bg-[#FFBD2E]"></div>
                      <div className="browser-dot bg-[#27C93F]"></div>
                    </div>
                    <img 
                      className="w-full h-auto" 
                      src={m.image} 
                      alt={m.alt} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="bg-section-muted px-8 border-y-[0.5px] border-border-subtle overflow-hidden pt-32 pb-32">
          <div className="max-w-[1320px] mx-auto text-center">
            <div className="mb-16 text-center">
              <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber">Testimonials</span>
              <h2 className="font-display text-marketing-xl mt-4 font-semibold leading-snug tracking-tight">Loved by Founders &amp; CAs.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {testimonials.map((t) => (
                <div key={t.author} className="bg-white p-12 border border-border-subtle relative group hover:border-amber transition-all rounded-none">
                  <Icon name="format_quote" className="text-amber text-6xl opacity-20 absolute top-8 left-8 select-none" />
                  <p className="text-ui-lg italic font-display text-dark mb-8 relative z-10 leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-none bg-amber/10 flex items-center justify-center text-amber font-bold text-lg font-display">{t.author.split(' ').map(n => n[0]).join('')}</div>
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
        <section className="py-space-128 px-8 bg-section-amber">
          <div className="max-w-[800px] mx-auto text-center border border-primary/20 p-16 bg-white/50 backdrop-blur-sm shadow-xl rounded-none">
            <h2 className="font-display text-marketing-xl mb-6 font-semibold leading-snug tracking-tight">Ready to bring precision to your books?</h2>
            <p className="text-ui-lg text-secondary mb-10">Join 5,000+ Indian businesses managing their compliance with zero stress.</p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <Link href="/signup" className="bg-amber text-white px-10 py-5 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-amber-hover transition-all group rounded-none inline-flex items-center gap-1">
                Start Free Trial <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/contact" className="border border-border-subtle text-dark px-10 py-5 font-ui text-[14px] font-bold uppercase tracking-widest no-underline hover:bg-on-surface hover:text-white transition-all rounded-none inline-flex items-center gap-1">
                Talk to Us
              </Link>
            </div>
            <p className="text-ui-xs font-ui text-light mt-8">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
