// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';
import { FeatureCard } from '@/components/marketing/feature-card';
import { TestimonialCard } from '@/components/marketing/testimonial-card';

/* ─── Intersection Observer Hook ───────────────────────────── */
function useScrollIn(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ─── Benefit Card Data ────────────────────────────────────── */
const benefits = [
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
    headline: 'Books that balance themselves',
    description: 'Every journal entry is double-entry by construction. Posting is blocked until debits equal credits — the UI enforces what your accountant has always manually checked.',
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    headline: 'GST done without a CA on call',
    description: 'GSTR-1, GSTR-2B, and GSTR-3B generated from your own entries. ITC reconciliation built in. File the return yourself — record the ARN, done.',
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    headline: 'Reports that look like reports',
    description: 'P&L and Balance Sheet in Schedule III format, typeset for print. Send to your CA or a bank directly from the browser — no export, no reformatting.',
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    headline: 'Indian numbers, everywhere',
    description: '₹12,45,000 — not ₹1,245,000. Every amount in the Indian numbering system, every time. This is the only accounting software that gets this right without a plugin.',
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    headline: 'One FY closes, the next one opens',
    description: 'Apr–Mar fiscal years built in from day one. Two concurrent open FYs for year-end transitions. No "financial year workaround" required.',
  },
];

const modules = [
  { href: '/features/accounting', name: 'Accounting', desc: 'Double-entry ledger, chart of accounts, trial balance, P&L, balance sheet — built for Schedule III and beyond.' },
  { href: '/features/gst', name: 'GST Returns', desc: 'GSTR-1, GSTR-2B, GSTR-3B generated from your entries. ITC reconciliation with auto-match.' },
  { href: '/features/invoicing', name: 'Invoicing', desc: 'GST-compliant invoices with automatic tax calculation. Post to your books with one click.' },
  { href: '/features/payroll', name: 'Payroll', desc: 'PF, ESI, PT, TDS — all statutory components calculated automatically. Payslips self-serve.' },
  { href: '/features/itr', name: 'ITR Returns', desc: 'From P&L to tax computation to self-assessment. Old vs new regime comparison built in.' },
];

const testimonials = [
  {
    quote: 'The P&L actually looks like a P&L — not like a software printout. My CA was surprised I generated it myself.',
    name: 'Priya Sharma',
    role: 'Proprietor, Sharma Garments',
    location: 'Mumbai',
  },
  {
    quote: 'We moved from Tally last quarter. The GST reconciliation alone saved us a week of accountant time every month.',
    name: 'Rahul Verma',
    role: 'Partner, Verma & Sons Trading',
    location: 'Delhi',
  },
  {
    quote: 'The Indian numbering everywhere is such a relief. No more explaining to international software why we use lakhs.',
    name: 'Anita Desai',
    role: 'CFO, Desai Manufacturing Pvt. Ltd.',
    location: 'Pune',
  },
];

/* ─── Demo Tabs ──────────────────────────────────────────── */
const demoTabs = ['Dashboard', 'New Entry', 'P&L Report', 'GST Return'];

export default function HomePage() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const testimonialTimer = useRef(null);

  const heroRef = useScrollIn(0.1);
  const benefitsRef = useScrollIn(0.1);
  const demoRef = useScrollIn(0.1);
  const modulesRef = useScrollIn(0.1);
  const ctaRef = useScrollIn(0.1);

  /* Auto-advance testimonials */
  useEffect(() => {
    testimonialTimer.current = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(testimonialTimer.current);
  }, []);

  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />

      <main id="main-content">
        {/* ═══ 3.1 Hero Section ═══ */}
        <section ref={heroRef} className="animate-in py-32 md:py-40">
          <div className="marketing-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <SectionLabel>Built for Indian Business</SectionLabel>
                <h1 className="font-display text-[var(--marketing-hero)] font-normal text-dark leading-[1.1] mb-6">
                  The accounting software<br className="hidden lg:block" />
                  that thinks in lakhs,<br className="hidden lg:block" />
                  not thousands.
                </h1>
                <p className="font-ui text-[14px] md:text-[16px] text-mid leading-relaxed max-w-[560px] mb-8">
                  Double-entry books, GST returns, payroll and ITR — fully connected, built from scratch for how Indian businesses actually work.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Link href="/signup" className="marketing-btn-primary text-[16px] px-7 py-3.5 no-underline">
                    Start free <span className="cta-arrow">→</span>
                  </Link>
                  <Link href="/features" className="inline-flex items-center gap-2 px-6 py-3.5 font-ui text-[16px] font-medium text-dark border border-dark rounded-md hover:bg-section-muted transition-colors no-underline">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12"><polygon points="3,2 10,6 3,10" /></svg>
                    Watch demo
                  </Link>
                </div>
                <p className="font-ui text-[13px] text-light">
                  Free to start<span className="mx-2">·</span>No credit card<span className="mx-2">·</span>Indian FY Apr–Mar
                </p>
              </div>
              <div className="rounded-2xl shadow-screenshot overflow-hidden bg-surface border border-border">
                <div className="bg-section-muted px-4 py-2 flex items-center gap-2 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-amber" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="ml-4 font-ui text-[12px] text-light">app.complianceos.in</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="font-ui text-[11px] text-light uppercase tracking-wider mb-1">Active Fiscal Year</div>
                      <div className="font-mono text-[13px] text-amber font-medium">FY 2026-27</div>
                    </div>
                    <div className="font-ui text-[11px] text-light">Good morning, Mehta Textiles</div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Revenue (MTD)', value: '₹12,45,000', color: 'text-amber' },
                      { label: 'Expenses (MTD)', value: '₹8,45,200', color: 'text-danger' },
                      { label: 'Net Profit (MTD)', value: '₹3,99,800', color: 'text-success' },
                      { label: 'Cash Balance', value: '₹24,50,000', color: 'text-dark' },
                    ].map((kpi) => (
                      <div key={kpi.label} className="border border-border rounded-md p-3 border-t-2 border-t-amber">
                        <div className="font-ui text-[10px] text-light uppercase tracking-wider mb-1">{kpi.label}</div>
                        <div className={`font-mono text-[14px] font-medium ${kpi.color}`}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3.3 Core Benefits ═══ */}
        <section ref={benefitsRef} className="animate-in py-24 md:py-32">
          <div className="marketing-container">
            <div className="text-center mb-16">
              <SectionLabel>Why ComplianceOS</SectionLabel>
              <h2 className="font-display text-[28px] md:text-[38px] font-normal text-dark leading-[1.2]">
                Everything an Indian business needs,<br />in one place that actually works.
              </h2>
            </div>
            <div className="animate-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className={`animate-in ${i >= 3 ? 'lg:col-span-1 lg:max-w-[400px] lg:mx-auto' : ''}`}>
                  <FeatureCard icon={b.icon} headline={b.headline} description={b.description} href={`/features/${b.headline.toLowerCase().includes('gst') ? 'gst' : b.headline.toLowerCase().includes('book') || b.headline.toLowerCase().includes('report') || b.headline.toLowerCase().includes('indian') || b.headline.toLowerCase().includes('fy') ? 'accounting' : 'accounting'}`} />
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/features" className="font-ui text-[15px] font-medium text-amber-text hover:underline no-underline">
                See all features <span className="cta-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ 3.4 Product Demo Section ═══ */}
        <section ref={demoRef} className="animate-in bg-dark text-white py-24 md:py-32">
          <div className="marketing-container">
            <div className="text-center mb-12">
              <SectionLabel>THE PRODUCT</SectionLabel>
              <h2 className="font-display text-[28px] md:text-[38px] font-normal text-white leading-[1.2]">
                See a journal entry posted<br />in under 10 seconds.
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {demoTabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setDemoIndex(i)}
                  className={`px-4 py-2 font-ui text-[14px] rounded-md transition-colors cursor-pointer border ${
                    i === demoIndex
                      ? 'bg-amber/10 text-amber border-amber'
                      : 'text-light bg-transparent border-transparent hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="rounded-2xl shadow-screenshot overflow-hidden bg-surface max-w-4xl mx-auto">
              <div className="bg-section-muted px-4 py-2 flex items-center gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-danger" />
                <div className="w-3 h-3 rounded-full bg-amber" />
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="ml-4 font-ui text-[12px] text-light">app.complianceos.in</span>
              </div>
              <div className="p-8 min-h-[280px] flex items-center justify-center text-dark">
                <div className="text-center">
                  <div className="font-display text-display-lg text-dark mb-2">
                    {['Dashboard overview with real-time KPIs', 'Journal entry with balance bar', 'Schedule III P&L report', 'GSTR-3B summary'][demoIndex]}
                  </div>
                  <p className="font-ui text-ui-md text-light">
                    {['Revenue, expenses, net profit — all in Indian numbering format.',
                      'Double-entry enforced. Post blocked until balance hits ₹0.00.',
                      'Typeset for print. Send directly to your CA.',
                      'Auto-populated from your entries. Enter ARN, done.'][demoIndex]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3.5 Feature Grid ═══ */}
        <section ref={modulesRef} className="animate-in py-24 md:py-32">
          <div className="marketing-container">
            <h2 className="font-display text-[28px] md:text-[38px] font-normal text-dark leading-[1.2] text-center mb-16">
              Everything connected.<br />Nothing siloed.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((m) => (
                <Link key={m.href} href={m.href} className="group block bg-surface border border-[#E8E4DC] rounded-lg p-8 no-underline hover:shadow-card transition-shadow relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  <h3 className="font-display text-display-lg text-dark mb-2">{m.name}</h3>
                  <p className="font-ui text-[15px] text-mid leading-relaxed mb-4">{m.desc}</p>
                  <span className="font-ui text-[15px] font-medium text-amber-text opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                    Learn more <span className="cta-arrow">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 3.6 Testimonials ═══ */}
        <section className="py-24 md:py-32 bg-section-muted">
          <div className="marketing-container">
            <div className="text-center mb-12">
              <SectionLabel>From Our Users</SectionLabel>
              <h2 className="font-display text-[28px] md:text-[38px] font-normal text-dark leading-[1.2]">
                They switched from Tally.<br />Here&apos;s what they said.
              </h2>
            </div>
            <div className="max-w-2xl mx-auto" role="region" aria-label="User testimonials">
              <TestimonialCard {...testimonials[testimonialIndex]} />
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
                  className="bg-transparent border-none cursor-pointer text-light hover:text-dark p-2"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex gap-2" role="tablist" aria-label="Testimonial indicators">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIndex(i)}
                      role="tab"
                      aria-selected={i === testimonialIndex}
                      aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
                      className={`rounded-full border-none cursor-pointer transition-all ${
                        i === testimonialIndex ? 'w-2 h-2 bg-amber' : 'w-1.5 h-1.5 bg-[#E8E4DC]'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setTestimonialIndex((i) => (i + 1) % testimonials.length)}
                  className="bg-transparent border-none cursor-pointer text-light hover:text-dark p-2"
                  aria-label="Next testimonial"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3.7 Conversion CTA ═══ */}
        <section ref={ctaRef} className="animate-in py-24 md:py-32" style={{ background: 'rgba(200,134,10,0.06)', borderTop: '0.5px solid rgba(200,134,10,0.2)', borderBottom: '0.5px solid rgba(200,134,10,0.2)' }}>
          <div className="marketing-container text-center">
            <h2 className="font-display text-[28px] md:text-[38px] font-normal text-dark leading-[1.2] mb-4">
              Ready to move off Tally?
            </h2>
            <p className="font-ui text-[16px] md:text-[18px] text-mid mb-8">
              Start free. No credit card.<br />No migration consultant required.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Link href="/signup" className="marketing-btn-primary text-[16px] px-7 py-3.5 no-underline">
                Start free <span className="cta-arrow">→</span>
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3.5 font-ui text-[16px] font-medium text-dark border border-dark rounded-md hover:bg-section-muted transition-colors no-underline">
                Talk to us
              </Link>
            </div>
            <p className="font-ui text-[13px] text-light">
              Your data stays in India. Always.
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
