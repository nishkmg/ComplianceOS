
import { MarketingNav } from '@/components/marketing/nav';
import { Icon } from '@/components/ui/icon';
import { MarketingFooter } from '@/components/marketing/footer';

export default function CookiesPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />
      <main className="w-full min-h-screen pt-space-96 pb-space-128">
        <article className="max-w-[800px] mx-auto px-gutter-desktop">
          <header className="mb-space-64 text-center">
            <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber block mb-4">Legal Information</span>
            <h1 className="font-display text-marketing-xl text-dark mb-6">Cookie Policy</h1>
            <p className="font-ui text-ui-lg text-secondary max-w-2xl mx-auto">Last updated: October 15, 2024. This policy explains how ComplianceOS uses cookies and similar technologies to recognize you when you visit our website.</p>
          </header>

          <div className="space-y-space-48 border-t-[0.5px] border-border-subtle pt-space-48 text-left">
            {/* What are cookies */}
            <section>
              <h2 className="font-display text-marketing-xl text-dark mb-6 flex items-center gap-3">
                <Icon name="cookie" className="text-amber" />
                What are cookies?
              </h2>
              <p className="font-ui text-ui-md text-secondary leading-relaxed">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p className="font-ui text-ui-md text-secondary leading-relaxed mt-4">
                Cookies set by the website owner (in this case, ComplianceOS) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., like advertising, interactive content, and analytics).
              </p>
            </section>

            {/* Why cookies */}
            <section>
              <h2 className="font-display text-marketing-xl text-dark mb-6 flex items-center gap-3">
                <Icon name="manage_search" className="text-amber" />
                Why do we use cookies?
              </h2>
              <p className="font-ui text-ui-md text-secondary leading-relaxed mb-6">
                We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Websites to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white border border-border-subtle p-8 border-t-2 border-t-amber">
                  <h3 className="font-ui text-ui-lg text-dark mb-3">Essential Cookies</h3>
                  <p className="font-ui text-ui-sm text-secondary">These cookies are strictly necessary to provide you with services available through our Websites and to use some of its features, such as access to secure areas.</p>
                </div>
                <div className="bg-white border border-border-subtle p-8 border-t-2 border-t-amber">
                  <h3 className="font-ui text-ui-lg text-dark mb-3">Performance Cookies</h3>
                  <p className="font-ui text-ui-sm text-secondary">These cookies are used to enhance the performance and functionality of our Websites but are non-essential to their use.</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-section-amber border border-border-subtle p-10">
              <h2 className="font-display text-marketing-xl text-dark mb-4">Contact Us</h2>
              <p className="font-ui text-ui-md text-secondary mb-6">If you have any questions about our use of cookies or other technologies, please email us at privacy@complianceos.in.</p>
              <a href="mailto:privacy@complianceos.in" className="inline-flex items-center gap-2 text-primary font-ui hover:text-amber transition-colors group no-underline">
                Contact Privacy Team
                <Icon name="arrow_forward" className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </section>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
