'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

const sections = [
  { id: 'data-collected', title: 'Data Collected' },
  { id: 'how-we-use-it', title: 'How We Use It' },
  { id: 'storage', title: 'Storage Location' },
  { id: 'third-parties', title: 'Third Parties' },
  { id: 'user-rights', title: 'User Rights' },
  { id: 'contact', title: 'Contact' },
];

export default function LegalPage({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <article className="py-16 md:py-24">
          <div className="marketing-container max-w-[760px]">
            <h1 className="font-display text-[32px] md:text-[38px] font-normal text-dark leading-[1.2] mb-2">{title}</h1>
            {lastUpdated && <p className="font-ui text-[13px] text-light mb-8">Last updated: {lastUpdated}</p>}
            
            <nav className="mb-10 font-ui text-[13px] space-y-2">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block text-amber-text hover:underline">{s.title}</a>
              ))}
            </nav>
            
            <div className="font-ui text-[16px] text-dark leading-relaxed space-y-6">
              {children}
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
