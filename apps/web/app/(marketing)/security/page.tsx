'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { Icon } from '@/components/ui/icon';
import { MarketingFooter } from '@/components/marketing/footer';
import Link from 'next/link';

const features = [
  { icon: 'encryption', title: 'Encryption at Rest', desc: 'All data is encrypted using AES-256 encryption. Your financial records are stored with the same standards used by major financial institutions.' },
  { icon: 'travel_explore', title: 'Data Residency', desc: 'Your data never leaves India. We operate exclusively through AWS Mumbai (ap-south-1) region, ensuring full compliance with Indian data localization laws.' },
  { icon: 'vpn_key', title: 'Access Control', desc: 'Role-based access control (RBAC) with granular permissions. Multi-factor authentication (MFA) enforced for all administrative accounts.' },
  { icon: 'verified_user', title: 'Audit Trail', desc: 'Every action within the system is logged and immutable. Complete traceability for all journal entries, modifications, and data exports.' },
  { icon: 'api', title: 'Secure API Gateway', desc: 'All API communications are encrypted via TLS 1.3. API access requires OAuth 2.0 authentication with short-lived access tokens.' },
  { icon: 'shield', title: 'Compliance Framework', desc: 'Built to align with ICAI guidelines and IT Act 2000 requirements. Regular third-party security audits and penetration testing.' },
];

export default function SecurityPage() {
  return (
    <div className="bg-page-bg text-dark min-h-screen antialiased">
      <MarketingNav />
      <main className="pt-space-128 pb-space-96 px-gutter-desktop">
        <div className="max-w-6xl mx-auto space-y-space-96">
          {/* Hero */}
          <section className="text-center flex flex-col items-center gap-6">
            <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber border-b-[0.5px] border-border-subtle pb-2">Platform Security</span>
            <h1 className="font-marketing-hero text-marketing-hero text-dark max-w-3xl leading-tight mt-6">
              Institutional-Grade Protection for Indian Enterprises.
            </h1>
            <p className="font-ui text-ui-lg text-secondary max-w-2xl mt-4 leading-relaxed">
              We approach data security with the rigorous precision of a financial ledger. Designed specifically for CTOs overseeing sensitive Indian compliance data, our architecture guarantees zero compromise on confidentiality and integrity.
            </p>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter-wide">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-border-subtle border-t-2 border-t-amber p-10 flex flex-col gap-6 hover:shadow-sm transition-shadow duration-300 text-left">
                <div className="flex items-center gap-4">
                  <Icon name={f.icon} className="text-amber text-3xl" />
                  <h3 className="font-display text-marketing-xl text-dark">{f.title}</h3>
                </div>
                <p className="font-ui text-ui-md text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </section>

          {/* CTA */}
          <section className="bg-section-amber border border-border-subtle p-16 text-center">
            <h2 className="font-display text-marketing-xl text-dark mb-6">Want to review our full security posture?</h2>
            <p className="font-ui text-ui-md text-secondary max-w-xl mx-auto mb-8">We provide detailed security documentation for enterprise prospects. Contact our security team for a full review.</p>
            <Link href="/contact" className="bg-amber text-white px-10 py-4 font-ui text-ui-sm font-bold inline-flex items-center gap-2 group hover:bg-amber-hover transition-all no-underline">
              Request Security Whitepaper
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
