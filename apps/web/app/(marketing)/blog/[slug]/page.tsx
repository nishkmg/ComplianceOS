// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function BlogPostPage({ params }) {
  const articleRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const article = articleRef.current;
      const bar = progressRef.current;
      if (!article || !bar) return;
      const scrolled = window.scrollY - article.offsetTop;
      const total = article.offsetHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrolled / total, 0), 1);
      bar.style.width = `${progress * 100}%`;
      bar.setAttribute('aria-valuenow', Math.round(progress * 100));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      {/* Reading progress bar */}
      <div
        ref={progressRef}
        className="fixed top-0 left-0 h-0.5 bg-amber z-[101]"
        role="progressbar"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
        style={{ width: '0%' }}
      />

      <MarketingNav />
      <main id="main-content">
        <article ref={articleRef} className="py-16 md:py-24">
          <div className="marketing-container max-w-[680px]">
            <Link href="/blog" className="font-ui text-[13px] text-mid hover:text-dark no-underline mb-8 inline-block">← Back to blog</Link>
            
            <h1 className="font-display text-[32px] md:text-[38px] font-normal text-dark leading-[1.2] mb-4">
              Moving from Tally to ComplianceOS: A Practical Guide
            </h1>
            
            <div className="flex items-center gap-2 font-ui text-[13px] text-light mb-10">
              <span>Aarav Mehta</span>
              <span>·</span>
              <span>15 Apr 2026</span>
            </div>

            <div className="font-ui text-[17px] text-dark leading-relaxed space-y-6">
              <p>If you&apos;re reading this, you&apos;re probably a Tally user considering a switch. You&apos;ve heard about the new generation of accounting software, but you have questions: How long does migration take? What happens to my historical data? Will my CA need to learn a new system?</p>
              
              <p>We&apos;ve helped over 50 businesses migrate from Tally to ComplianceOS. Here&apos;s what the process actually looks like.</p>
              
              <h2 className="font-display text-[26px] text-dark mt-10 mb-4">Before you start</h2>
              
              <p>You need three things before beginning your migration: your opening balances as of the migration date, a list of your chart of accounts, and your GST registration details. Most of these are already available in your Tally export.</p>
              
              <blockquote className="font-display text-display-md italic text-mid border-l-4 border-amber pl-5 py-2 my-8">
                Your opening balances are the single most important input. Get these right, and the rest follows.
              </blockquote>
              
              <h2 className="font-display text-[26px] text-dark mt-10 mb-4">The migration process</h2>
              
              <p>Step 1 — Export your chart of accounts from Tally. Step 2 — Import it into ComplianceOS. Step 3 — Enter your opening balances. Step 4 — Verify your trial balance matches.</p>
              
              <p>The entire process typically takes 2-4 hours for a business with 50-100 accounts. For simpler setups, it can be done in under an hour.</p>
              
              <h2 className="font-display text-[26px] text-dark mt-10 mb-4">Running in parallel</h2>
              
              <p>We recommend running both systems in parallel for one month. Post entries in ComplianceOS first, then verify against Tally. By the end of the month, you&apos;ll have confidence in the new system.</p>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
