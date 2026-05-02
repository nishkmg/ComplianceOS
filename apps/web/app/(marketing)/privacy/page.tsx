'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { Icon } from '@/components/ui/icon';
import { MarketingFooter } from '@/components/marketing/footer';
import Link from 'next/link';

const sections = [
  {
    id: 'section-1',
    title: '1. Information We Collect',
    content: [
      'We collect information that identifies, relates to, describes, references, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer, household, or device ("personal information").',
      'Specifically, ComplianceOS has collected the following categories of personal information from its consumers within the last twelve (12) months:',
    ],
    list: [
      '<strong>Identifiers:</strong> A real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol address, email address, account name, Social Security number, driver\'s license number, passport number, or other similar identifiers.',
      '<strong>Commercial Information:</strong> Records of personal property, products or services purchased, obtained, or considered, or other purchasing or consuming histories or tendencies.',
      '<strong>Financial Data:</strong> Bank account numbers, credit card numbers, debit card numbers, or any other financial information necessary for ledger processing and GST compliance.',
    ],
  },
  {
    id: 'section-2',
    title: '2. How We Use Your Information',
    content: [
      'We may use or disclose the personal information we collect for one or more of the following purposes:',
    ],
    list: [
      'To fulfill or meet the reason you provided the information. For example, if you share your name and contact information to request a price quote or ask a question about our accounting modules, we will use that personal information to respond to your inquiry.',
      'To provide, support, personalize, and develop our Website, products, and services, specifically tailoring GST reporting to your organizational profile.',
      'To create, maintain, customize, and secure your account with us.',
      'To process your requests, purchases, transactions, and payments and prevent transactional fraud.',
    ],
  },
  {
    id: 'section-3',
    title: '3. Data Storage & Security',
    content: [
      'ComplianceOS employs industry-standard, military-grade encryption protocols to safeguard your financial data. Data is encrypted both in transit (using TLS 1.3) and at rest (using AES-256).',
      'We store your data on secure servers located within jurisdictions that comply with local financial data residency requirements. Access to this infrastructure is strictly limited to authorized personnel who require such access to perform their duties, governed by the principle of least privilege.',
    ],
    highlight: 'Security Commitment: While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security. No method of transmission over the Internet, or method of electronic storage, is 100% secure.',
  },
  {
    id: 'section-4',
    title: '4. Third-Party Sharing',
    content: ['We do not sell your personal data. We only share your information with third parties in the following specific circumstances:'],
    list: [
      '<strong>Service Providers:</strong> We employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used.',
      '<strong>Legal Obligations:</strong> We may disclose your data where required to do so by law or subpoena or if we believe that such action is necessary to comply with the law and the reasonable requests of law enforcement or to protect the security or integrity of our Service.',
      '<strong>Business Transfers:</strong> If ComplianceOS is involved in a merger, acquisition or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.',
    ],
  },
  {
    id: 'section-5',
    title: '5. Your Compliance Rights',
    content: ['Depending on your location, you may have the following rights regarding your personal data:'],
    subSections: [
      { title: 'The Right to Access', text: 'You have the right to request copies of your personal data. We may charge you a small fee for this service.' },
      { title: 'The Right to Rectification', text: 'You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.' },
      { title: 'The Right to Erasure', text: 'You have the right to request that we erase your personal data, under certain conditions, primarily where it is no longer necessary for the purposes for which it was collected.' },
    ],
  },
  {
    id: 'section-6',
    title: '6. Contact Information',
    content: ['If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact our Data Protection Officer:'],
    contact: {
      email: 'privacy@complianceos.in',
      address: 'COM 07, First Floor, Vipul World, Sector 29, Gurgaon, Haryana 122001, India',
    },
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-page-bg text-dark min-h-screen">
      <MarketingNav />
      <main className="w-full max-w-[1200px] mx-auto px-gutter-desktop py-space-96">
        <header className="mb-space-64">
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-4">Last Updated: October 24, 2024</p>
          <h1 className="font-display text-marketing-xl text-dark mb-6">Privacy Policy</h1>
          <p className="font-ui text-ui-lg text-secondary max-w-2xl">This Privacy Policy describes how ComplianceOS collects, uses, and shares your personal information in connection with our accounting and compliance platform.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative">
          {/* TOC */}
          <aside className="lg:col-span-3 hidden lg:block text-left">
            <nav className="sticky top-32 border-l border-border-subtle pl-6 py-2">
              <span className="block font-ui text-ui-xs text-light uppercase tracking-widest mb-6">Table of Contents</span>
              <ul className="space-y-4 font-ui text-ui-sm text-secondary list-none p-0">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="hover:text-primary transition-colors duration-200 flex items-center group no-underline text-secondary">
                      <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <article className="lg:col-span-9 max-w-3xl">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-space-48 scroll-mt-32">
                <h2 className="font-display text-marketing-xl text-dark mb-6 border-b border-border-subtle pb-4">{section.title}</h2>
                <div className="font-ui text-ui-md text-secondary space-y-4 leading-relaxed text-left">
                  {section.content.map((p, i) => <p key={i}>{p}</p>)}
                  
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-outline-variant">
                      {section.list.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
                    </ul>
                  )}

                  {section.subSections && (
                    <div className="space-y-6 mt-6">
                      {section.subSections.map((sub) => (
                        <div key={sub.title}>
                          <h4 className="font-ui font-bold text-dark mb-1">{sub.title}</h4>
                          <p>{sub.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.highlight && (
                    <div className="bg-surface-container-low border border-border-subtle p-6 mt-6">
                      <p className="font-ui text-ui-sm text-secondary">
                        <Icon name="lock" className="text-primary align-middle mr-2" />
                        {section.highlight}
                      </p>
                    </div>
                  )}

                  {section.contact && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-8 font-mono text-mono-md">
                      <div>
                        <span className="block text-light uppercase tracking-wider text-xs mb-2">Email Address</span>
                        <a href={`mailto:${section.contact.email}`} className="text-primary hover:text-amber transition-colors no-underline">{section.contact.email}</a>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
