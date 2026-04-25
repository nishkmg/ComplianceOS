// @ts-nocheck
'use client';

import { useRef, useEffect } from 'react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';
import { TeamCard } from '@/components/marketing/team-card';

const team = [
  { name: 'Aarav Mehta', role: 'Co-founder & CEO', bio: 'Chartered accountant by training. Built financial systems for 3 Indian unicorns before starting ComplianceOS.' },
  { name: 'Neha Sharma', role: 'Co-founder & CTO', bio: 'Previously led engineering at a FinTech SaaS startup. Has built accounting engines at scale.' },
  { name: 'Vikram Patel', role: 'Head of Design', bio: 'Product designer who spent 8 years making complex financial software usable. Believes density beats whitespace.' },
];

export default function AboutPage() {
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <section ref={heroRef} className="animate-in py-24 md:py-32">
          <div className="marketing-container max-w-3xl">
            <SectionLabel>About</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-6">
              We built the accounting software we wish existed when we started our businesses.
            </h1>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="marketing-container max-w-3xl font-ui text-[16px] text-mid leading-relaxed space-y-6">
            <p>Tally&apos;s interface was designed for Windows XP. QuickBooks is completely indifferent to Indian compliance. Zoho tries to do everything and kitchen-sink complexity gets in the way.</p>
            <p>We started ComplianceOS because we believe Indian businesses deserve accounting software that respects how they actually work — with Indian numbering, Indian fiscal years, Indian compliance forms, and Indian business contexts.</p>
            <p>Not an international product with an India locale bolted on.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="marketing-container max-w-5xl">
            <h2 className="font-display text-display-lg text-dark mb-8 text-center">The team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member) => (
                <TeamCard key={member.name} {...member} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-section-muted">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">Why we built it this way</h2>
            <p className="font-ui text-[15px] text-mid leading-relaxed mb-6">Three typefaces. One accent colour. Density over whitespace. We chose these design principles not for aesthetics but for usability — accountants spend 6-8 hours a day in this software. The same visual language applies on the app side, so the transition from finding us online to using the product feels seamless.</p>
            <p className="font-ui text-[15px] text-mid leading-relaxed">No gradients. No drop shadows. No illustrations of people shaking hands. The data does the talking.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="marketing-container max-w-3xl">
            <h2 className="font-display text-display-lg text-dark mb-8">What we believe</h2>
            <div className="space-y-6">
              {[
                'Your books should balance because the software prevents imbalance, not because you checked.',
                'Indian numbering is not a locale option. It is the default.',
                'A P&L should look like a P&L — typeset for print, not for a software screenshot.',
                'GST compliance is not a feature toggle. It is the foundation.',
                'Your financial data belongs in India. Always.',
              ].map((belief) => (
                <div key={belief} className="font-display text-display-md italic text-dark leading-relaxed border-l-4 border-amber pl-6">
                  {belief}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
