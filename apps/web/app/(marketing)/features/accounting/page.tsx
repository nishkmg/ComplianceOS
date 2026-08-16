import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const pillars = [
  {
    id: '01',
    title: 'Chart of accounts',
    desc: 'A hierarchy mapped to Schedule III, with Indian account codes ready before the first entry.',
  },
  {
    id: '02',
    title: 'Journal entry engine',
    desc: 'Fiscal-year sequencing, auto-numbering and balance validation at the point of entry.',
  },
  {
    id: '03',
    title: 'Financial reports',
    desc: 'Schedule III P&L and balance sheet, typeset for print and for the bank.',
  },
];

export default function AccountingPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="max-w-4xl">
              <h1 className="font-display text-hero text-dark leading-tight tracking-tight text-balance mb-8">
                One ledger, from the first entry to the closing balance sheet.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                Every entry is validated for balance before it posts, so the books stay true without a month-end scramble.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
          </div>
        </header>

        <section className="bg-section-dark py-space-128">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <h2 className="font-display text-marketing-xl text-white leading-[1.08] tracking-tight text-balance mb-6">
                Entries must balance before they post.
              </h2>
              <p className="font-ui text-ui-md text-sidebar-dim leading-relaxed mb-8 max-w-[52ch]">
                A journal entry cannot be saved unless debits equal credits. The constraint is enforced at the point of entry, so an out-of-balance voucher never reaches the books.
              </p>
              <ul className="list-none p-0 m-0 space-y-3">
                <li className="font-mono text-mono-sm text-sidebar-muted">
                  <span aria-hidden="true" className="text-amber mr-2">▹</span>
                  Debit and credit totals checked on every voucher
                </li>
                <li className="font-mono text-mono-sm text-sidebar-muted">
                  <span aria-hidden="true" className="text-amber mr-2">▹</span>
                  Unbalanced entries rejected, not flagged for later
                </li>
                <li className="font-mono text-mono-sm text-sidebar-muted">
                  <span aria-hidden="true" className="text-amber mr-2">▹</span>
                  Reversal and adjustment entries posted to the same rules
                </li>
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <BrowserFrame
                src="/images/marketing/journal.png"
                alt="Journal entries screen in Arthvahi"
                className="shadow-md"
              />
            </Reveal>
          </div>
        </section>

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <SectionHeader
                title="Three parts of the ledger"
                lede="Everything else in Arthvahi, from invoices to ITR, runs on these."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 mt-12">
              {pillars.map((pillar) => (
                <Reveal as="li" key={pillar.id}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-6 border-b-[0.5px] border-border-subtle hover:bg-section-muted/50 transition-colors">
                    <span className="sm:col-span-1 font-mono text-ui-2xs text-amber pt-1">{pillar.id}</span>
                    <h2 className="sm:col-span-3 font-display text-display-lg text-dark leading-snug tracking-tight">
                      {pillar.title}
                    </h2>
                    <p className="sm:col-span-8 font-ui text-ui-md text-mid leading-relaxed">{pillar.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <CtaBand
          title="A ledger that never goes out of balance."
          lede="Start free and post your first journal entry today."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
