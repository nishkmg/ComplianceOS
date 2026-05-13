
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function ContactSuccessPage() {
  return (
    <div className="bg-page-bg text-dark min-h-screen">
      <MarketingNav />
      <main className="flex flex-col items-center justify-center py-32 px-8 text-center">
        <Icon name="check_circle" className="text-[56px] text-amber mb-8" />
        <h1 className="font-display text-marketing-xl text-dark mb-4">Message sent successfully.</h1>
        <p className="font-ui text-ui-lg text-secondary max-w-lg mx-auto leading-relaxed mb-12">Thank you for reaching out. Our team typically responds within 24 hours during business days.</p>
        <div className="flex gap-4">
          <Link href="/" className="bg-amber text-white px-8 py-4 font-ui font-bold uppercase tracking-widest hover:bg-amber-hover transition-all no-underline rounded-sm shadow-sm">
            Return to Home
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
