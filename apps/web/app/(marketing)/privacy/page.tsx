// @ts-nocheck
'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function PrivacyPage() {
  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <article className="py-16 md:py-24">
          <div className="marketing-container max-w-[760px]">
            <h1 className="font-display text-[32px] md:text-[38px] font-normal text-dark leading-[1.2] mb-2">Privacy Policy</h1>
            <p className="font-ui text-[13px] text-light mb-8">Last updated: April 2026</p>

            <nav className="mb-10 font-ui text-[13px] space-y-2">
              {['Data Collected', 'How We Use It', 'Storage Location', 'Third Parties', 'User Rights', 'Contact'].map((s) => (
                <a key={s} href={`#${s.toLowerCase().replace(/\s+/g, '-')}`} className="block text-amber-text hover:underline">{s}</a>
              ))}
            </nav>

            <div className="font-ui text-[16px] text-dark leading-relaxed space-y-6">
              <section id="data-collected">
                <h2 className="font-display text-display-lg text-dark mb-4">Data Collected</h2>
                <p>We collect only the data necessary to provide our accounting service: your business information, contact details, financial entries, invoices, GST returns, payroll data, and employee information (where applicable).</p>
                <p>We do not collect browsing behaviour, click tracking, or any data unrelated to the operation of the accounting product.</p>
              </section>

              <section id="how-we-use-it">
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">How We Use It</h2>
                <p>Your financial data is used exclusively to power the ComplianceOS application — generating reports, computing tax, filing returns as directed by you. We never use your financial data for training, analytics, or any purpose outside your direct instructions.</p>
              </section>

              <section id="storage-location">
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Storage Location</h2>
                <p>All data is stored on servers located in India (AWS Mumbai region). Your data never leaves Indian jurisdiction. We maintain SOC 2-equivalent controls for data access and encryption.</p>
              </section>

              <section id="third-parties">
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Third Parties</h2>
                <p>We use AWS for infrastructure and SendGrid for transactional emails. Both are contractually prohibited from accessing your data beyond what is necessary to provide the service. We do not sell your data to anyone.</p>
              </section>

              <section id="user-rights">
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">User Rights</h2>
                <p>You can export your data at any time from within the application. You can request deletion of your account and all associated data by contacting us. We will complete deletion within 30 days of your request.</p>
              </section>

              <section id="contact">
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Contact</h2>
                <p>For privacy-related inquiries: <a href="mailto:privacy@complianceos.in" className="text-amber-text hover:underline">privacy@complianceos.in</a></p>
              </section>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
