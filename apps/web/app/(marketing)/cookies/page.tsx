// @ts-nocheck
'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function CookiesPage() {
  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <article className="py-16 md:py-24">
          <div className="marketing-container max-w-[760px]">
            <h1 className="font-display text-[32px] md:text-[38px] font-normal text-dark leading-[1.2] mb-2">Cookie Policy</h1>
            <p className="font-ui text-[13px] text-light mb-8">Last updated: April 2026</p>
            <div className="font-ui text-[16px] text-dark leading-relaxed space-y-6">
              <p>ComplianceOS uses only essential cookies required for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
              <p>Authentication cookies expire when you log out or after 24 hours. Session cookies are used to maintain your login state across page loads within a single browser session.</p>
              <p>You can control cookie preferences through your browser settings. Blocking essential cookies will prevent you from logging into the application.</p>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
