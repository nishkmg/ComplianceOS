// @ts-nocheck
'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function TermsPage() {
  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <article className="py-16 md:py-24">
          <div className="marketing-container max-w-[760px]">
            <h1 className="font-display text-[32px] md:text-[38px] font-normal text-dark leading-[1.2] mb-2">Terms of Service</h1>
            <p className="font-ui text-[13px] text-light mb-8">Last updated: April 2026</p>
            <div className="font-ui text-[16px] text-dark leading-relaxed space-y-6">
              <section>
                <h2 className="font-display text-display-lg text-dark mb-4">Service</h2>
                <p>ComplianceOS provides accounting, GST, invoicing, payroll, and ITR computation software to registered users. By using the service, you agree to these terms.</p>
              </section>
              <section>
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Your Responsibilities</h2>
                <p>You are responsible for the accuracy of the data you enter. ComplianceOS generates reports and computations based on your entries; it does not verify the underlying business transactions. You must ensure you have the right to store any employee or customer data in the system.</p>
              </section>
              <section>
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Limitation of Liability</h2>
                <p>ComplianceOS is provided as a tool to assist with financial record-keeping and compliance. It does not constitute professional accounting or legal advice. You should consult a qualified professional for advice specific to your situation.</p>
              </section>
              <section>
                <h2 className="font-display text-display-lg text-dark mt-10 mb-4">Termination</h2>
                <p>You may cancel your account at any time. Your data will remain accessible in read-only mode for 90 days after cancellation. After 90 days, your data will be permanently deleted.</p>
              </section>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
