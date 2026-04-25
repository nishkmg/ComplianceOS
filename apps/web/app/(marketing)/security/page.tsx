// @ts-nocheck
'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function SecurityPage() {
  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <article className="py-16 md:py-24">
          <div className="marketing-container max-w-[760px]">
            <h1 className="font-display text-[32px] md:text-[38px] font-normal text-dark leading-[1.2] mb-2">Security</h1>
            <p className="font-ui text-[13px] text-light mb-8">Last updated: April 2026</p>
            <div className="font-ui text-[16px] text-dark leading-relaxed space-y-6">
              <section>
                <h2 className="font-display text-display-lg text-dark mb-4">Encryption</h2>
                <p>All data in transit is encrypted using TLS 1.3. All data at rest is encrypted using AES-256. Database backups are also encrypted.</p>
              </section>
              <section>
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Data Residency</h2>
                <p>All data is stored exclusively on AWS servers in Mumbai, India. No data replication occurs outside India.</p>
              </section>
              <section>
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Access Controls</h2>
                <p>Access to production data is restricted to the founding team. All access is logged and audited. Multi-factor authentication is enforced for all infrastructure access.</p>
              </section>
              <section>
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Incident Response</h2>
                <p>If a security incident affects your data, we will notify you within 48 hours. For security concerns: <a href="mailto:security@complianceos.in" className="text-amber-text hover:underline">security@complianceos.in</a></p>
              </section>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
