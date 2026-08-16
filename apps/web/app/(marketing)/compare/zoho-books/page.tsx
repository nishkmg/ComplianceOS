import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const comparisonGroups = [
  {
    group: 'Core accounting',
    rows: [
      {
        feature: 'Double-entry ledger',
        zoho: 'Yes, multi-company',
        arthvahi: 'Yes, event-sourced',
        note: 'Both validate balance at the point of entry.',
      },
      {
        feature: 'Multi-currency',
        zoho: 'Full support',
        arthvahi: 'INR-first today',
        note: 'Arthvahi is built for Indian books first.',
      },
      {
        feature: 'Bank feeds',
        zoho: 'Bank feeds and reconciliation',
        arthvahi: 'On the roadmap',
        note: 'Automatic statement import is planned for Arthvahi.',
      },
    ],
  },
  {
    group: 'Compliance',
    rows: [
      {
        feature: 'GST returns',
        zoho: 'Return preparation',
        arthvahi: 'GSTR-1 and 3B generated from posted entries; 2B reconciled against own purchases',
        note: 'Both file manually on the GST portal.',
      },
      {
        feature: 'ITR-3 and ITR-4',
        zoho: 'Not offered',
        arthvahi: 'Computed from closed books, both regimes',
        note: 'The computation runs on actual ledger income.',
      },
      {
        feature: 'Schedule III statements',
        zoho: 'Standard financial reports',
        arthvahi: 'Print-ready Schedule III P&L and balance sheet',
        note: 'Arthvahi typesets statements for print and for the bank.',
      },
      {
        feature: 'Payroll statutory',
        zoho: 'Payroll add-on',
        arthvahi: 'PF, ESI and TDS in the core',
        note: 'Form 16 is not offered by Arthvahi yet.',
      },
    ],
  },
  {
    group: 'Platform',
    rows: [
      {
        feature: 'App ecosystem',
        zoho: 'Marketplace of apps',
        arthvahi: 'Typed tRPC API, per-tenant isolation',
        note: 'Arthvahi integrations are fewer and deliberately built in-house.',
      },
      {
        feature: 'Audit trail',
        zoho: 'Audit logs',
        arthvahi: 'Immutable event store',
        note: 'Every Arthvahi entry is append-only and replayable.',
      },
    ],
  },
];

const zohoStrengths = [
  'Full multi-currency and bank feed support',
  'A large marketplace of apps',
  'Global footprint beyond Indian compliance',
];

const arthvahiStrengths = [
  'Returns and ITR drawn from the same entries',
  'Print-ready Schedule III statements',
  'Event-sourced audit trail with tenant isolation',
];

export default function CompareZohoBooksPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-96 pb-space-64">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="max-w-4xl">
              <h1 className="font-display text-marketing-hero text-dark leading-tight tracking-tight text-balance mb-8">
                The breadth of Zoho Books, the depth of Indian compliance.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                Zoho Books is strong on global accounting and connections. Arthvahi goes deep where Indian compliance starts: returns from posted entries and ITR from closed books.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
          </div>
        </header>

        <section className="py-space-96 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <SectionHeader
                eyebrow="Honest comparison"
                title="Capability by capability"
                lede="Where Zoho leads on breadth, Arthvahi leads on compliance depth. No automatic filing is claimed on either side."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12 bg-surface border border-border-subtle rounded-sm overflow-x-auto">
                <table className="w-full text-left font-ui text-ui-sm">
                  <caption className="sr-only">
                    Comparison of Zoho Books and Arthvahi across core accounting, compliance, and platform capabilities
                  </caption>
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[24%]">Capability</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[25%]">Zoho Books</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[27%]">Arthvahi</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[24%]">Notes</th>
                    </tr>
                  </thead>
                  {comparisonGroups.map((group) => (
                    <tbody key={group.group} className="align-top">
                      <tr className="border-b border-border-subtle bg-section-muted">
                        <th scope="rowgroup" colSpan={4} className="px-6 py-3 font-mono text-ui-2xs uppercase tracking-[0.18em] text-light">
                          {group.group}
                        </th>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.feature} className="border-b-[0.5px] border-border-subtle align-top">
                          <th scope="row" className="px-6 py-4 font-ui font-medium text-dark">
                            {row.feature}
                          </th>
                          <td className="px-6 py-4 font-mono text-mono-sm text-mid">{row.zoho}</td>
                          <td className="px-6 py-4 font-mono text-mono-sm text-amber">{row.arthvahi}</td>
                          <td className="px-6 py-4 font-ui text-ui-xs text-mid leading-relaxed">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-space-96">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                  <h2 className="font-display text-display-xl text-dark leading-snug tracking-tight mb-6">
                    Where Zoho Books wins
                  </h2>
                  <ul className="list-none p-0 m-0">
                    {zohoStrengths.map((item) => (
                      <li key={item} className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-display text-display-xl text-dark leading-snug tracking-tight mb-6">
                    Where Arthvahi wins
                  </h2>
                  <ul className="list-none p-0 m-0">
                    {arthvahiStrengths.map((item) => (
                      <li key={item} className="font-mono text-mono-sm text-amber border-b-[0.5px] border-border-subtle py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-space-96 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <SectionHeader
                title="Moving over is a guided setup"
                lede="Arthvahi does not import Zoho exports today. Export your chart of accounts and opening balances from Zoho, then map them during onboarding. The wizard walks the mapping one account at a time, and the ledger starts clean."
              />
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <MarketingButton href="/blog/moving-from-tally" variant="secondary">
                  Read the migration guide
                </MarketingButton>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <BrowserFrame
                src="/images/marketing/journal.png"
                alt="Journal entries screen in Arthvahi"
              />
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="Global breadth or Indian depth. Try the depth on your own books."
          lede="Start free and post your first entry; the returns compute themselves from there."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
