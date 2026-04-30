'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function ContactSuccessPage() {
  return (
    <div className="bg-page-bg text-on-surface min-h-screen">
      <MarketingNav />
      <main className="flex flex-col items-center justify-center py-32 px-8 text-center">
        <Icon name="check_circle" className="text-[56px] text-primary-container mb-8" />
        <h1 className="font-display-xl text-display-xl text-on-surface mb-4">Message sent successfully.</h1>
        <p className="font-ui-md text-ui-md text-text-mid max-w-lg mx-auto leading-relaxed mb-12">Thank you for reaching out. Our team typically responds within 24 hours during business days.</p>
        <div className="flex gap-4">
          <Link href="/" className="bg-primary-container text-white px-8 py-4 font-ui-sm font-bold uppercase tracking-widest hover:bg-primary transition-all no-underline rounded-sm shadow-sm">
            Return to Home
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
