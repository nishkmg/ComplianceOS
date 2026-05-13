'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

const plans = [
  {
    name: 'Free',
    price: 0,
    desc: 'For individual proprietors just getting started.',
    features: ['Up to 25 Invoices / month', 'Basic GST Reporting'],
    notFeatures: ['Automated Reconciliation', 'Custom Tax Audit Support'],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: 8999,
    desc: 'Advanced tools for growing Indian startups.',
    features: ['Unlimited Invoicing', 'GSTR-1, 2, & 3B Automations', 'Automated Bank Reconciliation', 'Multi-user access (Up to 5)'],
    cta: 'Upgrade to Pro',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Business',
    price: 24999,
    desc: 'Enterprise-grade compliance for scale.',
    features: ['TDS & TCS Reporting', 'Audit Trail (MCA Compliant)', 'Dedicated Account Manager', 'API Integration Support'],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

const faqs = [
  { q: 'Is my data hosted in India?', a: 'Yes, all ComplianceOS data is hosted on local Indian servers to ensure compliance with data localization laws and to provide the lowest latency possible for our users.' },
  { q: 'Can I import data from Tally or Zoho?', a: 'Absolutely. We offer one-click migration tools for Tally, Zoho Books, and Quickbooks, ensuring you can transition your entire financial history without losing a single entry.' },
  { q: 'Is the Pro plan MCA compliant?', a: 'Yes, our Pro and Business plans include the mandatory Audit Trail (edit log) feature as per the latest Ministry of Corporate Affairs (MCA) guidelines.' },
  { q: 'Do you offer support for GST filing?', a: 'We provide automated generation of GSTR-1, 2, and 3B reports. For the Pro plan and above, we also offer direct filing via our secure API gateway.' },
  { q: 'What happens if I cancel my subscription?', a: 'You retain read-only access to your data for up to 7 years, as required by Indian tax laws. You can also export all your data in Excel or PDF formats at any time.' },
  { q: 'Can my CA access my account for free?', a: 'Yes, every paid plan includes one complimentary "Auditor Seat" specifically designed for your Chartered Accountant to review books and pull reports.' },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />

      <main className="max-w-[1200px] mx-auto px-8 mt-16">
        {/* Hero Section */}
        <section className="pt-space-128 pb-space-96 text-center">
          <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-6 block">Our Plans</span>
          <h1 className="font-display text-marketing-xl text-dark max-w-2xl mx-auto mb-8">Simple pricing for Indian businesses.</h1>
          <p className="text-ui-lg font-ui text-secondary max-w-xl mx-auto">Precision accounting and GST compliance designed for the unique needs of Bharat's growing enterprises.</p>
        </section>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center space-x-6 mb-space-64">
          <span className="text-ui-sm font-ui text-dark">Monthly Billing</span>
          <div 
            className="w-14 h-7 bg-outline-variant rounded-full p-1 cursor-pointer flex items-center transition-colors"
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-ui-sm font-ui text-dark ${isAnnual ? 'font-bold' : ''}`}>Annual Billing</span>
            <span className="bg-primary-fixed text-on-primary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Save 20%</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-space-128 items-stretch">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-white border border-border-subtle p-10 flex flex-col relative transition-all duration-300 ${plan.popular ? 'border-t-2 border-t-primary shadow-screenshot' : 'shadow-card'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-4 py-1.5 uppercase font-bold tracking-widest">Most Popular</div>
              )}
              <div className="mb-8 text-left">
                <h3 className="text-ui-lg font-ui text-dark mb-2">{plan.name}</h3>
                <p className="text-ui-sm font-ui text-secondary">{plan.desc}</p>
              </div>
              <div className="mb-8 text-left">
                <div className="font-mono-lg text-mono-lg text-dark mb-1">
                  ₹{isAnnual ? plan.price.toLocaleString('en-IN') : Math.round(plan.price * 1.25 / 12).toLocaleString('en-IN')}
                  <span className="text-ui-sm font-ui text-light">/{isAnnual ? 'yr' : 'mo'}</span>
                </div>
                <div className="text-[10px] uppercase text-light tracking-widest font-bold">
                  {isAnnual ? 'Billed Annually' : 'Billed Monthly'}
                </div>
              </div>
              <ul className="space-y-4 mb-12 flex-grow list-none p-0 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start">
                    <Icon name="check_circle" className="text-amber text-sm mr-3 mt-1" />
                    <span className="text-ui-sm font-ui">{f}</span>
                  </li>
                ))}
                {plan.notFeatures?.map((f) => (
                  <li key={f} className="flex items-start text-light">
                    <Icon name="cancel" className="text-outline-variant text-sm mr-3 mt-1" />
                    <span className="text-ui-sm font-ui">{f}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href={plan.href} 
                className={`w-full py-3 text-ui-sm font-ui font-bold flex justify-center items-center group transition-all no-underline ${plan.popular ? 'bg-primary text-white' : 'border border-border-subtle text-dark hover:bg-on-surface hover:text-white'}`}
              >
                {plan.cta} {plan.popular && <span className="ml-2 transform group-hover:translate-x-1 duration-200">→</span>}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <section className="mb-space-128">
          <div className="bg-section-amber p-16 border border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h2 className="font-display text-marketing-xl mb-6">Built for Indian CA Standards.</h2>
              <p className="text-ui-md font-ui text-secondary mb-8 leading-relaxed">Every pixel and ledger entry in ComplianceOS is built to align with the Institute of Chartered Accountants of India (ICAI) guidelines and modern GST frameworks.</p>
              <div className="flex space-x-12">
                <div>
                  <div className="font-mono-lg text-mono-lg text-primary font-bold">99.9%</div>
                  <div className="text-ui-xs font-ui uppercase tracking-widest text-light font-bold">Accuracy Rate</div>
                </div>
                <div>
                  <div className="font-mono-lg text-mono-lg text-primary font-bold">50k+</div>
                  <div className="text-ui-xs font-ui uppercase tracking-widest text-light font-bold">Businesses</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/images/pricing/report.jpg" 
                alt="Trial Balance Report" 
                className="shadow-screenshot bg-white border border-border-subtle w-full h-auto" 
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-space-128 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-4 block">Knowledge Base</span>
            <h2 className="font-display text-marketing-xl">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={faq.q} className="group bg-white border border-border-subtle" open={i === 0}>
                <summary className="flex justify-between items-center p-6 cursor-pointer select-none text-left">
                  <span className="font-ui text-ui-lg font-semibold">{faq.q}</span>
                  <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-ui-sm font-ui text-secondary text-left leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
