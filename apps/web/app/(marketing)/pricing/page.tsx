'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';

type Billing = 'monthly' | 'annual';

const plans = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    desc: 'For individual proprietors getting started with clean books.',
    features: ['Up to 25 invoices / month', 'GSTR-1 and GSTR-3B report generation', 'Single user'],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    monthly: 900,
    annual: 9000,
    desc: 'Advanced tools for growing Indian businesses.',
    features: [
      'Unlimited invoicing',
      'GSTR-1, 2B and 3B automations',
      'Automated bank reconciliation',
      'Up to 5 users',
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Business',
    monthly: 2400,
    annual: 24000,
    desc: 'Compliance at scale for larger operations.',
    features: [
      'TDS and TCS reporting',
      'Audit trail (MCA-aligned edit log)',
      'API integration support',
      'Dedicated support desk',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

const faqs = [
  {
    q: 'Which GST reports are included?',
    a: 'Arthvahi generates GSTR-1, matches GSTR-2B and prepares GSTR-3B summaries from your books. Filing happens on the GST portal, which stays the single source of truth for the government.',
  },
  {
    q: 'Can I import data from Tally or Zoho Books?',
    a: 'Yes. Guided migration flows map your existing chart of accounts and open balances from Tally and Zoho Books exports before you switch.',
  },
  {
    q: 'Is the audit trail MCA-compliant?',
    a: 'Both paid plans include an audit trail with an immutable edit log, aligned with the Ministry of Corporate Affairs mandate for accounting software.',
  },
  {
    q: 'What happens if I cancel my subscription?',
    a: 'You can export your data at any time. After cancellation your books stay readable for 30 days, then the account is archived.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. The Free plan covers limited invoicing and basic GST reporting with no time limit. Upgrade when your volume grows.',
  },
];

function formatINR(amount: number) {
  return amount.toLocaleString('en-IN');
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('annual');

  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content" className="max-w-[1320px] mx-auto px-8">
        {/* Hero */}
        <section className="pt-space-128 pb-space-64 text-center">
          <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6">
            Pricing
          </p>
          <h1 className="font-display text-marketing-xl text-dark leading-[1.08] tracking-tight text-balance max-w-2xl mx-auto">
            Simple pricing for Indian businesses.
          </h1>
          <p className="font-ui text-ui-md text-mid leading-relaxed mt-5 max-w-[55ch] mx-auto">
            No percentage games, no locked-in features. Two paid plans, both billed
            in whole annual or monthly amounts you can verify yourself.
          </p>
        </section>

        {/* Billing toggle: real accessible control */}
        <section className="flex justify-center mb-space-64">
          <div
            role="group"
            aria-label="Billing period"
            className="inline-flex bg-surface border border-border-subtle rounded-sm overflow-hidden"
          >
            {(['monthly', 'annual'] as const).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={billing === period}
                onClick={() => setBilling(period)}
                className={`px-6 py-2.5 font-ui text-ui-sm uppercase tracking-wider transition-colors cursor-pointer border-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${
                  billing === period
                    ? 'bg-section-dark text-white font-semibold'
                    : 'bg-transparent text-mid hover:text-dark'
                }`}
              >
                {period === 'annual' ? 'Annual' : 'Monthly'}
              </button>
            ))}
          </div>
        </section>

        {/* Pricing cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-space-96 items-stretch">
          {plans.map((plan) => {
            const isAnnual = billing === 'annual';
            const price = isAnnual ? plan.annual : plan.monthly;
            const perMonth = isAnnual ? plan.annual / 12 : plan.monthly;
            return (
              <div
                key={plan.name}
                className={`bg-surface border p-10 flex flex-col relative text-left ${
                  plan.popular ? 'border-amber border-t-2' : 'border-border-subtle'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-section-dark text-white text-ui-2xs px-4 py-1.5 uppercase font-bold tracking-widest rounded-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="font-mono text-mono-md text-amber uppercase tracking-tighter mb-2">
                  {plan.name}
                </h3>
                <p className="text-ui-sm text-mid mb-8">{plan.desc}</p>

                <div className="mb-8">
                  {price === 0 ? (
                    <div className="font-mono text-mono-lg text-dark">
                      ₹0<span className="text-ui-sm text-light"> / forever</span>
                    </div>
                  ) : (
                    <>
                      <div className="font-mono text-mono-lg text-dark">
                        ₹{formatINR(price)}
                        <span className="text-ui-sm text-light"> / {isAnnual ? 'yr' : 'mo'}</span>
                      </div>
                      <div className="text-ui-2xs uppercase text-light tracking-widest font-semibold mt-1">
                        {isAnnual
                          ? `billed annually · ₹${formatINR(perMonth)}/mo`
                          : `billed monthly · ₹${formatINR(perMonth)}/mo`}
                      </div>
                    </>
                  )}
                </div>

                <ul className="space-y-4 mb-12 flex-grow list-none p-0">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start">
                      <Icon name="check_circle" className="text-amber text-sm mr-3 mt-1" />
                      <span className="text-ui-sm text-dark">{f}</span>
                    </li>
                  ))}
                </ul>

                <MarketingButton
                  href={plan.href}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {plan.cta}
                </MarketingButton>
              </div>
            );
          })}
        </section>

        {/* FAQ */}
        <section className="pb-space-96 max-w-3xl mx-auto">
          <SectionHeader
            align="center"
            title="Frequently asked questions"
            className="mb-12"
          />
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={faq.q}
                className="group bg-surface border border-border-subtle rounded-sm"
                open={i === 0}
              >
                <summary className="flex justify-between items-center p-6 cursor-pointer select-none text-left">
                  <span className="font-ui text-ui-sm font-semibold text-dark">{faq.q}</span>
                  <Icon name="expand_more" className="transition-transform group-open:rotate-180 text-light" />
                </summary>
                <div className="px-6 pb-6 text-ui-sm text-mid text-left leading-relaxed">
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
