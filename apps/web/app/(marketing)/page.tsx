// @ts-nocheck
'use client';

import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/footer';

export default function HomePage() {
  return (
    <div className="bg-page-bg min-h-screen" style={{ fontFamily: 'Syne, sans-serif' }}>
      {/* ═══ TopNavBar (exact Stitch HTML) ═══ */}
          <nav className="sticky top-0 w-full z-50 bg-[#F4F2EE]/90 border-b border-[#E8E4DC]" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="flex justify-between items-center px-8 py-4" style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <Link href="/" className="text-2xl font-bold font-display text-dark no-underline">
            ComplianceOS
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/features" className="text-[#C8860A] font-bold border-b-2 border-[#C8860A] pb-1 font-ui text-[14px] no-underline hover:text-dark transition-colors" style={{ letterSpacing: '-0.01em' }}>
              Features
            </Link>
            <Link href="/pricing" className="text-mid font-medium font-ui text-[14px] no-underline hover:text-dark transition-colors" style={{ letterSpacing: '-0.01em' }}>
              Pricing
            </Link>
            <Link href="/about" className="text-mid font-medium font-ui text-[14px] no-underline hover:text-dark transition-colors" style={{ letterSpacing: '-0.01em' }}>About Us</Link>
            <Link href="/blog" className="text-mid font-medium font-ui text-[14px] no-underline hover:text-dark transition-colors" style={{ letterSpacing: '-0.01em' }}>Resources</Link>
          </div>
          <Link href="/signup" className="bg-[#C8860A] text-white px-6 py-2.5 font-ui text-[14px] font-bold uppercase no-underline hover:opacity-90 transition-all group rounded-none" style={{ lineHeight: 'normal', letterSpacing: '0.1em' }}>
            Start Free <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </nav>

      {/* ═══ Hero Section (exact Stitch) ═══ */}
      <header className="px-8 mx-auto" style={{ paddingTop: '128px', paddingBottom: '96px', maxWidth: '1320px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div style={{ maxWidth: '576px' }}>
            <div className="text-[12px] font-medium uppercase mb-6 select-none" style={{ color: '#B47500', letterSpacing: '0.2em', fontWeight: 500, fontFamily: 'Syne, sans-serif' }}>
              Made for India
            </div>
            <h1 className="font-display text-dark mb-8" style={{ fontSize: '64px', lineHeight: '1.1', fontWeight: 400 }}>
              The accounting software that thinks in lakhs, not thousands.
            </h1>
            <p className="mb-10" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: 400, fontFamily: 'Syne, sans-serif', color: '#5f5e5e', maxWidth: '512px' }}>
              Rigorous accounting precision built specifically for Indian fiscal realities. GST, Payroll, and Audit trails that CAs actually trust.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="bg-[#C8860A] text-white font-ui text-[14px] font-bold uppercase no-underline hover:opacity-90 transition-all group inline-flex items-center gap-2 rounded-none" style={{ padding: '16px 32px', letterSpacing: '0.1em' }}>
                Get Started Today <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/contact" className="border border-dark text-dark font-ui text-[14px] font-bold uppercase no-underline hover:bg-dark hover:text-white transition-all inline-flex items-center gap-2 rounded-none" style={{ padding: '16px 32px', letterSpacing: '0.1em' }}>
                Book a Demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <img className="w-full h-auto border border-border-subtle" src="/images/homepage/hero-dashboard.jpg" alt="Modern minimalist accounting software dashboard" style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.2)', filter: 'grayscale(0.2) contrast(1.05)' }} />
            <div className="absolute -bottom-6 -left-6 bg-white border border-border-subtle p-6 hidden lg:block">
              <p className="font-mono text-[14px] text-amber font-bold" style={{ color: '#825500' }}>₹ 1,45,00,000.00</p>
              <p className="text-[12px] uppercase" style={{ letterSpacing: '-0.05em', color: '#888888', fontWeight: 500, fontFamily: 'Syne, sans-serif' }}>Current FY Revenue</p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Social Proof (exact Stitch) ═══ */}
      <section className="bg-[#F4F2EE] py-16 border-y border-border-subtle">
        <div className="px-8 mx-auto text-center" style={{ maxWidth: '1200px' }}>
          <p className="text-[12px] text-center mb-10" style={{ color: '#888888', fontWeight: 500, fontFamily: 'Syne, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Trusted by India's leading firms &amp; CAs
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-60" style={{ filter: 'contrast(1.25)', filter: 'grayscale(1)' }}>
            <div className="h-8 flex items-center text-ui-sm text-light">COMPLIANCE OS</div>
            <div className="h-8 flex items-center text-ui-sm text-light">ACME CORP</div>
            <div className="h-8 flex items-center text-ui-sm text-light">FINANCE PRO</div>
            <div className="h-8 flex items-center text-ui-sm text-light">INDIA INC</div>
            <div className="h-8 flex items-center text-ui-sm text-light">BUSINESS CO</div>
          </div>
        </div>
      </section>

      {/* ═══ Core Benefits (exact Stitch) ═══ */}
      <section className="px-8 mx-auto" style={{ paddingTop: '128px', paddingBottom: '128px', maxWidth: '1320px' }}>
        <div className="mb-16">
          <div className="text-[12px] font-medium uppercase tracking-widest" style={{ color: '#B47500', fontFamily: 'Syne, sans-serif', fontWeight: 500 }}>
            Built for precision
          </div>
          <h2 className="font-display text-dark mt-4" style={{ fontSize: '38px', lineHeight: '1.2', fontWeight: 400, maxWidth: '544px' }}>
            Ledger-first design for the modern Indian enterprise.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { icon: 'account_balance', title: 'Books balance', desc: 'Automated double-entry reconciliation that actually adds up to zero.' },
            { icon: 'description', title: 'GST done', desc: 'One-click GSTR filing with auto-matching for ITC claims.' },
            { icon: 'analytics', title: 'Reports look like reports', desc: 'Print-ready financial statements formatted for Indian bank compliance.' },
            { icon: 'pin', title: 'Indian numbers', desc: 'Native support for lakhs, crores, and the Indian comma system.' },
            { icon: 'event_available', title: 'FY closes', desc: 'Seamless financial year transition with zero data loss or duplication.' },
          ].map((b) => (
            <div key={b.title} className="bg-white p-8 border border-border-subtle" style={{ borderTop: '2px solid #C8860A' }}>
              <div className="text-amber mb-6 text-2xl" aria-hidden="true">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="font-bold mb-4 text-dark" style={{ fontSize: '15px', lineHeight: '1.5', fontFamily: 'Syne, sans-serif' }}>{b.title}</h3>
              <p className="text-ui-sm" style={{ color: '#5f5e5e' }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Product Demo (exact Stitch) ═══ */}
      <section className="bg-[#111111] overflow-hidden" style={{ paddingTop: '128px', paddingBottom: '128px' }}>
        <div className="px-8 mx-auto" style={{ maxWidth: '1320px' }}>
          <div className="text-center mb-16">
            <h2 className="font-display text-white mb-6" style={{ fontSize: '38px', lineHeight: '1.2', fontWeight: 400 }}>Experience the precision.</h2>
            <div className="flex justify-center gap-8 border-b border-white/10 max-w-[400px] mx-auto">
              {['Dashboard', 'New Entry', 'P&L', 'GST'].map((tab, i) => (
                <button key={tab} className={`pb-4 font-ui text-[14px] px-4 cursor-pointer bg-transparent border-none ${i === 0 ? 'text-white border-b-2 border-[#C8860A]' : 'text-stone-500 border-b-2 border-transparent hover:text-stone-300'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mx-auto" style={{ maxWidth: '1024px' }}>
            <div className="bg-[#1A1A1A] rounded-lg border border-white/10 p-2 shadow-2xl">
              <img className="w-full rounded-md opacity-90" src="/images/homepage/demo-screenshot.jpg" alt="Professional financial dashboard interface with dark mode" style={{ filter: 'contrast(1.25)' }} />
            </div>
            <div className="absolute -right-12 top-1/4 bg-[#C8860A] p-6 hidden xl:block">
              <svg className="w-8 h-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-white text-[12px] uppercase mt-2" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 500 }}>Bank-grade Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Feature Grid (exact Stitch) ═══ */}
      <section className="px-8 mx-auto" style={{ paddingTop: '128px', paddingBottom: '128px', maxWidth: '1200px' }}>
        <div className="text-center mb-24">
          <div className="text-[12px] font-medium uppercase tracking-widest" style={{ color: '#B47500', fontFamily: 'Syne, sans-serif', fontWeight: 500 }}>
            Complete Control
          </div>
          <h2 className="font-display text-dark mt-4" style={{ fontSize: '48px', lineHeight: '1.15', fontWeight: 400 }}>Modules built for Indian scale.</h2>
        </div>
        <div className="space-y-24">
          {/* Module 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="font-display text-dark mb-6" style={{ fontSize: '26px', lineHeight: '1.3', fontWeight: 400 }}>Accounting &amp; Ledger Management</h3>
              <p className="mb-8" style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400, fontFamily: 'Syne, sans-serif', color: '#5f5e5e' }}>
                Maintain a crystal clear audit trail. From journal entries to ledger balancing, ComplianceOS ensures every rupee is accounted for with physical-ledger accuracy.
              </p>
              <ul className="space-y-4">
                {['Real-time double entry validation', 'Multi-entity consolidation'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-ui-sm" style={{ color: '#5f5e5e', fontFamily: 'Syne, sans-serif' }}>
                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#825500' }} fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-section-muted p-8 border border-border-subtle">
              <img className="w-full h-auto" src="/images/homepage/module-accounting.jpg" alt="Detailed view of a financial ledger spreadsheet" style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.2)', filter: 'grayscale(1) contrast(1.1)' }} />
            </div>
          </div>
          {/* Module 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-section-muted p-8 border border-border-subtle">
              <img className="w-full h-auto" src="/images/homepage/module-gst.jpg" alt="GST filing confirmation screen" style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.2)', filter: 'contrast(1.1)' }} />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="font-display text-dark mb-6" style={{ fontSize: '26px', lineHeight: '1.3', fontWeight: 400 }}>GST Compliance &amp; Filing</h3>
              <p className="mb-8" style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400, fontFamily: 'Syne, sans-serif', color: '#5f5e5e' }}>
                Never fear an audit again. Our GST module handles HSN/SAC codes, auto-calculates SGST/CGST/IGST, and generates JSON files ready for the GST portal.
              </p>
              <ul className="space-y-4">
                {['Auto-matched GSTR-2B reconciliation', 'E-way bill integration'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-ui-sm" style={{ color: '#5f5e5e', fontFamily: 'Syne, sans-serif' }}>
                    <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#825500' }} fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Module 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="font-display text-dark mb-6" style={{ fontSize: '26px', lineHeight: '1.3', fontWeight: 400 }}>Smart Invoicing</h3>
              <p className="mb-8" style={{ fontSize: '16px', lineHeight: '1.6', fontWeight: 400, fontFamily: 'Syne, sans-serif', color: '#5f5e5e' }}>
                Create professional, GST-compliant invoices in seconds. Manage receivables with automated payment reminders and multi-currency support.
              </p>
              <Link href="/features/invoicing" className="text-[#C8860A] font-bold font-ui text-[14px] flex items-center gap-2 group no-underline">
                Explore Invoicing <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div className="bg-section-muted p-8 border border-border-subtle">
              <img className="w-full h-auto" src="/images/homepage/module-invoicing.jpg" alt="Professional invoice template" style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.2)', filter: 'grayscale(1)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Testimonials (exact Stitch) ═══ */}
      <section className="bg-section-muted overflow-hidden border-y border-border-subtle" style={{ paddingTop: '128px', paddingBottom: '128px' }}>
        <div className="px-8 mx-auto" style={{ maxWidth: '1320px' }}>
          <div className="text-center mb-16">
            <div className="text-[12px] font-medium uppercase tracking-widest" style={{ color: '#B47500', fontFamily: 'Syne, sans-serif', fontWeight: 500 }}>
            Testimonials
          </div>
            <h2 className="font-display text-dark mt-4" style={{ fontSize: '38px', lineHeight: '1.2', fontWeight: 400 }}>Loved by Founders &amp; CAs.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { quote: '"ComplianceOS is the first tool that understands how Indian businesses actually operate. The GST reconciliation alone saves our team 20 hours a week."', name: 'Arjun Mehta', role: 'CEO, Bharat Logistics', img: 'person-arjun.jpg' },
              { quote: '"As a CA, I recommend ComplianceOS to all my clients. The audit trails are bulletproof and the reporting format is exactly what banks need."', name: 'Priya Sharma', role: 'Senior Partner, Sharma & Co.', img: 'person-priya.jpg' },
            ].map((t) => (
              <div key={t.name} className="bg-white p-12 border border-border-subtle relative">
                <div className="text-[#C8860A] opacity-20 absolute top-8 left-8" style={{ fontSize: '60px', fontWeight: 400, fontFamily: 'Playfair Display, serif', lineHeight: '1' }}>"</div>
                <p className="mb-8 relative z-10 italic font-display" style={{ fontSize: '18px', lineHeight: '1.5', color: '#211b13', fontFamily: 'Syne, sans-serif' }}>{t.quote}</p>
                <div className="flex items-center gap-4">
                  <img className="w-12 h-12 object-cover grayscale" src={'/images/homepage/' + t.img} alt={t.name} />
                  <div>
                    <p className="font-bold text-ui-sm text-dark">{t.name}</p>
                    <p className="text-[12px] uppercase tracking-tighter" style={{ color: '#888888', fontWeight: 500, fontFamily: 'Syne, sans-serif' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Conversion CTA (exact Stitch) ═══ */}
      <section className="px-8" style={{ paddingTop: '128px', paddingBottom: '128px', background: 'rgba(200, 134, 10, 0.06)' }}>
        <div className="mx-auto text-center border border-amber/20 p-16 bg-white/50 backdrop-blur-sm" style={{ maxWidth: '800px' }}>
          <h2 className="font-display text-dark mb-6" style={{ fontSize: '48px', lineHeight: '1.15', fontWeight: 400 }}>Ready to bring precision to your books?</h2>
          <p className="mb-10" style={{ fontSize: '18px', lineHeight: '1.5', fontWeight: 400, fontFamily: 'Syne, sans-serif', color: '#5f5e5e' }}>
            Join 5,000+ Indian businesses managing their compliance with zero stress.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link href="/signup" className="bg-[#C8860A] text-white font-ui text-[14px] font-bold uppercase no-underline hover:opacity-90 transition-all group inline-flex items-center gap-2 rounded-none" style={{ padding: '20px 40px', letterSpacing: '0.1em' }}>
              Start Free Trial <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/contact" className="border border-dark text-dark font-ui text-[14px] font-bold uppercase no-underline hover:bg-dark hover:text-white transition-all inline-flex items-center gap-2 rounded-none" style={{ padding: '20px 40px', letterSpacing: '0.1em' }}>
              Talk to Us
            </Link>
          </div>
          <p className="text-[12px] mt-8" style={{ color: '#888888', fontWeight: 500, fontFamily: 'Syne, sans-serif' }}>No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
