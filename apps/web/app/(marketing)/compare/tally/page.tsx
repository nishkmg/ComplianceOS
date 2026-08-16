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
        tally: 'Mature, battle-tested',
        arthvahi: 'Event-sourced, replayable',
        note: 'Both keep balanced books. Arthvahi numbers entries gaplessly within each financial year.',
      },
      {
        feature: 'Fiscal-year close',
        tally: 'Year-end lock',
        arthvahi: 'Close from settings; returns compute from the closed year',
        note: 'A closed year is preserved as filed, in both systems.',
      },
      {
        feature: 'Inventory',
        tally: 'Full inventory module',
        arthvahi: 'FIFO costing, HSN on every product',
        note: 'Arthvahi values stock on a FIFO basis and carries the HSN code to the return.',
      },
    ],
  },
  {
    group: 'Returns and compliance',
    rows: [
      {
        feature: 'GSTR-1 and GSTR-3B',
        tally: 'Reports prepared from vouchers',
        arthvahi: 'Generated from posted entries; 2B reconciled against own purchases',
        note: 'Both leave the actual filing to the GST portal.',
      },
      {
        feature: 'ITR-3 and ITR-4',
        tally: 'Books-based reports, prepared on the portal',
        arthvahi: 'Computed from closed books, both regimes',
        note: 'Arthvahi runs the computation on actual ledger income, not a generic calculator.',
      },
      {
        feature: 'Payroll statutory',
        tally: 'Payroll add-on',
        arthvahi: 'PF, ESI and TDS in the core',
        note: 'Form 16 is not offered by Arthvahi yet.',
      },
      {
        feature: 'Portal filing',
        tally: 'Manual; portal is source of truth',
        arthvahi: 'Manual; portal is source of truth',
        note: 'Neither path files automatically.',
      },
    ],
  },
  {
    group: 'Platform',
    rows: [
      {
        feature: 'Audit trail',
        tally: 'Audit trail feature',
        arthvahi: 'Immutable event log, tenant-isolated',
        note: 'Every entry in Arthvahi is append-only and replayable from the event store.',
      },
    ],
  },
];

const tallyStrengths = [
  'Familiar voucher workflows built over decades',
  'Years of existing data and history',
  'A large ecosystem of add-ons and consultants',
];

const arthvahiStrengths = [
  'Returns drawn from the same entries you posted',
  'ITR computed from closed books',
  'Event-sourced audit trail, immutable and replayable',
];

export default function CompareTallyPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-96 pb-space-64">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <div className="max-w-4xl">
              <h1 className="font-display text-hero text-dark tracking-tight text-balance mb-8">
                The rigour of Tally, none of the return assembly.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                Tally earned its place in Indian accounting. Arthvahi keeps the discipline, and draws GSTR and ITR from the entries you already posted.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
          </div>
        </header>

        <section className="py-space-96 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <SectionHeader
                eyebrow="Honest comparison"
                title="Row by row, where each system stands"
                lede="No import magic and no automatic filing are claimed here. The table says what each product does today."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12 bg-surface border border-border-subtle rounded-sm overflow-x-auto">
                <table className="w-full text-left font-ui text-ui-sm">
                  <caption className="sr-only">
                    Comparison of Tally and Arthvahi across core accounting, returns and compliance, and platform capabilities
                  </caption>
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[26%]">Capability</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[26%]">Tally</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[26%]">Arthvahi</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light w-[22%]">Notes</th>
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
                        <tr key={row.feature} className="align-top">
                          <th scope="row" className="px-6 py-4 font-ui font-medium text-dark">
                            {row.feature}
                          </th>
                          <td className="px-6 py-4 font-mono text-mono-sm text-mid">{row.tally}</td>
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
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                  <h2 className="font-display text-display-xl text-dark leading-snug tracking-tight mb-6">
                    Where Tally wins
                  </h2>
                  <ul className="list-none p-0 m-0">
                    {tallyStrengths.map((item) => (
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
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <SectionHeader
                title="Migration is guided setup, not an import"
                lede="Arthvahi does not import Tally data files today, and we will not pretend otherwise. Moving is a guided setup: map your chart of accounts and enter opening balances, and the ledger starts clean."
              />
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <MarketingButton href="/blog/moving-from-tally" variant="secondary">
                  Read the moving-from-Tally guide
                </MarketingButton>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-space-96">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <BrowserFrame
                src="/images/marketing/gst-hub.png"
                alt="GST hub in Arthvahi showing return status and due dates"
              />
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="Bookkeeping you already know, returns you do not assemble by hand."
          lede="Start free with the voucher-and-ledger workflow you know, and watch the returns assemble themselves."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
