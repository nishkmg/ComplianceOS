// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { PricingCard } from '@/components/marketing/pricing-card';
import { FAQItem } from '@/components/marketing/faq-item';
import { SectionLabel } from '@/components/marketing/section-label';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: ['Accounting module', '1 fiscal year', 'Basic reports (Trial Balance, P&L)', 'Community support'],
    cta: 'Start free',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Pro',
    price: 12000,
    features: ['Everything in Free, plus:', 'GST module (GSTR-1/2B/3B)', 'Invoicing with GST compliance', 'Unlimited fiscal years', 'Email support within 24h'],
    cta: 'Start Pro',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Business',
    price: 24000,
    features: ['Everything in Pro, plus:', 'Payroll module (PF/ESI/PT/TDS)', 'ITR module with computation', 'Priority support (4h response)', 'Dedicated account manager'],
    cta: 'Contact us',
    href: '/contact',
    featured: false,
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
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
        <section ref={heroRef} className="animate-in py-24 md:py-32 text-center">
          <div className="marketing-container">
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-10">
              Simple pricing for Indian businesses.
            </h1>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="flex items-center bg-section-muted rounded-md p-1" role="radiogroup" aria-label="Billing period">
                <button
                  onClick={() => setIsAnnual(true)}
                  role="radio"
                  aria-checked={isAnnual}
                  className={`px-4 py-2 font-ui text-[14px] rounded-md transition-colors cursor-pointer border-none ${isAnnual ? 'bg-surface text-dark shadow-sm' : 'text-mid hover:text-dark'}`}
                >
                  Annual
                </button>
                <button
                  onClick={() => setIsAnnual(false)}
                  role="radio"
                  aria-checked={!isAnnual}
                  className={`px-4 py-2 font-ui text-[14px] rounded-md transition-colors cursor-pointer border-none ${!isAnnual ? 'bg-surface text-dark shadow-sm' : 'text-mid hover:text-dark'}`}
                >
                  Monthly
                </button>
              </div>
              {isAnnual && (
                <span className="font-ui text-[13px] text-amber font-medium">Save 20% with annual billing</span>
              )}
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <PricingCard key={plan.name} {...plan} isAnnual={isAnnual} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-section-muted">
          <div className="marketing-container max-w-2xl">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="font-display text-display-xl text-dark mb-8">Common questions</h2>
            <div>
              <FAQItem question="What happens to my data when my free trial ends?" answer="Your data remains accessible in read-only mode. You can upgrade or export your data at any time. We do not hold your data hostage." />
              <FAQItem question="Can I switch plans mid-year?" answer="Yes. Upgrades take effect immediately. Downgrades apply at the next billing cycle. No data is lost." />
              <FAQItem question="Does pricing include GST filing?" answer="GST filing is included in the Pro and Business plans. Free plan includes accounting only. Pricing does not include GST portal fees." />
              <FAQItem question="Is my data stored in India?" answer="Yes. All data is stored on servers located in India (AWS Mumbai region). Your data never leaves Indian jurisdiction." />
              <FAQItem question="Can I add multiple businesses?" answer="Each business (tenant) requires a separate subscription. Contact us for multi-business pricing." />
              <FAQItem question="Is there a setup fee?" answer="No setup fee. No implementation fee. No hidden charges. Free plan is genuinely free." />
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
