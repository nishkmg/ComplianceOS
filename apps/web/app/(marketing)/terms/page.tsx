'use client';

import Link from 'next/link';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingNav } from '@/components/marketing/nav';

export default function TermsPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />
      <main className="w-full max-w-[760px] mx-auto px-margin-mobile md:px-0 py-space-96">
        {/* Header */}
        <header className="mb-space-64 text-left">
          <p className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest mb-4">Last Updated: October 24, 2024</p>
          <h1 className="font-marketing-hero text-marketing-hero text-dark mb-6">Terms of Service</h1>
          <p className="font-ui-lg text-ui-lg text-mid max-w-2xl leading-relaxed">Please read these Terms of Service carefully before using the ComplianceOS platform. These terms define your rights and obligations as an Indian accounting professional utilizing our infrastructure.</p>
        </header>

        {/* TOC */}
        <nav className="bg-white border border-border-subtle p-8 mb-space-96 relative shadow-sm text-left">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
          <h2 className="font-mono-lg text-mono-lg mb-4 text-dark uppercase tracking-wide">Table of Contents</h2>
          <ul className="space-y-3 font-ui-md text-ui-md list-none p-0">
            {[
              { href: '#service-description', label: '1. Service Description & Scope' },
              { href: '#responsibilities', label: '2. User Responsibilities & Data' },
              { href: '#liability', label: '3. Limitation of Liability' },
              { href: '#termination', label: '4. Term & Termination' },
            ].map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-mid hover:text-primary-container hover:translate-x-1 transition-transform inline-block no-underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <article className="space-y-space-64 font-ui-md text-ui-md text-dark-variant leading-relaxed text-left">
          <section className="scroll-mt-32" id="service-description">
            <h2 className="font-display-xl text-display-xl text-dark mb-6">1. Service Description &amp; Scope</h2>
            <p className="mb-4">ComplianceOS provides cloud-based accounting and regulatory compliance software specifically tailored for the Indian fiscal ecosystem. The platform facilitates GST filing, ITR preparation, inventory management, and general ledger maintenance.</p>
            <p className="mb-4">We do not provide direct accounting, financial, legal, or tax advice. The platform is a technological tool designed to assist qualified Chartered Accountants, financial professionals, and business owners in executing their duties.</p>
            <div className="bg-section-muted p-6 border-l-2 border-primary-container mt-6">
              <p className="font-mono-md text-mono-md text-dark"><strong>Note:</strong> Service availability may be subject to maintenance windows, which are typically scheduled during non-peak hours (IST) to minimize disruption to filing deadlines.</p>
            </div>
          </section>

          <section className="scroll-mt-32" id="responsibilities">
            <h2 className="font-display-xl text-display-xl text-dark mb-6">2. User Responsibilities &amp; Data</h2>
            <p className="mb-4">You are entirely responsible for the accuracy, legality, and integrity of the financial data inputted into the ComplianceOS platform. We process this data strictly as a service provider acting on your instructions.</p>
            <ul className="list-none space-y-4 my-6 pl-4 border-l-[0.5px] border-border-subtle">
              {[
                'You must maintain the confidentiality of your account credentials and access tokens.',
                'You must ensure that all GSTINs and PANs associated with your entity management are valid and legally authorized.',
                'You are responsible for initiating filings before government-mandated deadlines; we are not liable for late fees or penalties.',
              ].map((item) => (
                <li key={item} className="relative pl-6">
                  <span className="absolute left-0 top-1 w-1.5 h-1.5 bg-primary-container rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="scroll-mt-32" id="liability">
            <h2 className="font-display-xl text-display-xl text-dark mb-6">3. Limitation of Liability</h2>
            <p className="mb-4">To the maximum extent permitted by applicable Indian law, ComplianceOS and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.</p>
            <p className="mb-4">Our total aggregate liability arising out of or relating to these terms is limited to the amount paid by you for the specific service module during the twelve (12) months immediately preceding the event giving rise to the claim.</p>
          </section>

          <section className="scroll-mt-32" id="termination">
            <h2 className="font-display-xl text-display-xl text-dark mb-6">4. Term &amp; Termination</h2>
            <p className="mb-4">These terms commence on the date you first accept them and continue until all subscriptions hereunder have expired or have been terminated.</p>
            <p className="mb-4">Upon termination, you will have a limited, 30-day window to export your compliance ledgers and reports archive. Following this period, we will securely delete your data in accordance with our data retention policies and applicable regulatory requirements.</p>
          </section>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
