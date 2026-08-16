import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';

export default function ContactSuccessPage() {
  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />
      <main id="main-content" className="flex flex-col items-center justify-center py-32 px-8 text-center">
        <Icon name="check_circle" className="text-[56px] text-amber mb-8" />
        <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-4">
          Message received
        </p>
        <h1 className="font-display text-marketing-xl text-dark mb-4 leading-tight text-balance">
          Your message is on its way.
        </h1>
        <p className="font-ui text-ui-md text-mid max-w-lg mx-auto leading-relaxed mb-12">
          Thank you for reaching out. We reply within one business day during the
          working week. In the meantime, the free plan is open and ready whenever
          you are.
        </p>
        <MarketingButton href="/" variant="secondary">
          Return to Home
        </MarketingButton>
      </main>
      <MarketingFooter />
    </div>
  );
}
