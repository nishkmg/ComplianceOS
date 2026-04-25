// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

export default function PayrollPage() {
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
            <SectionLabel>Payroll</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-6">
              Payroll that knows PF from PT, and both from TDS.
            </h1>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">Salary structure</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-ui text-ui-xs text-light uppercase tracking-wider mb-4">Earnings</h3>
                  <div className="space-y-2 font-mono text-[13px]">
                    <div>Basic <span className="float-right">₹25,000</span></div>
                    <div>HRA <span className="float-right">₹12,500</span></div>
                    <div className="font-ui text-[11px] text-light">~40-50% of basic, auto-calculated</div>
                    <div>Special Allowance <span className="float-right">₹8,500</span></div>
                    <div className="border-t border-border pt-2 font-ui font-medium text-dark">Gross <span className="float-right font-mono">₹46,000</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-ui text-ui-xs text-light uppercase tracking-wider mb-4">Deductions</h3>
                  <div className="space-y-2 font-mono text-[13px]">
                    <div>PF <span className="float-right">₹3,000</span></div>
                    <div className="font-ui text-[11px] text-light">12% of basic — auto-calculated</div>
                    <div>Professional Tax <span className="float-right">₹200</span></div>
                    <div className="font-ui text-[11px] text-light">By state — auto-set</div>
                    <div className="border-t border-border pt-2 font-ui font-medium text-success">Net Pay <span className="float-right font-mono">₹42,800</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-section-muted">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-4">Employee self-service</h2>
            <div className="rounded-xl shadow-card overflow-hidden border border-border bg-surface p-8">
              <div className="text-center">
                <div className="font-display text-display-md text-dark mb-2">Monthly Payslip</div>
                <div className="font-mono text-[15px] space-y-1">
                  <div>Earnings: ₹46,000</div>
                  <div>Deductions: ₹3,200</div>
                  <div className="text-amber text-[20px] pt-2 border-t border-border">Net Pay: ₹42,800</div>
                </div>
                <div className="font-ui text-[11px] text-light mt-4">Employer PF contribution: ₹3,250</div>
              </div>
            </div>
            <p className="font-ui text-[13px] text-light mt-2">Employees see their own payslips. No PDFs emailed every month.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-4">Compliance reports</h2>
            <p className="font-ui text-[14px] text-mid">PF challan, ESI challan, Professional Tax workings, Form 16 data — the reports your CA needs for filings, generated not typed.</p>
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="marketing-container">
            <Link href="/signup" className="marketing-btn-primary text-[16px] px-7 py-3.5 no-underline">
              Start with payroll <span className="cta-arrow">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
