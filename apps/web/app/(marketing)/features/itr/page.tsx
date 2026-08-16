import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const regimeRows = [
  { line: 'Business income, from posted entries', old: '₹20,000', neu: '₹20,000' },
  { line: 'Deductions (80C, 80D, HRA)', old: 'Available', neu: 'Not available' },
  { line: 'Basic exemption limit', old: '₹3,00,000', neu: '₹3,00,000' },
  { line: 'Tax payable', old: '₹0', neu: '₹0' },
];

export default function ITRFeaturePage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="max-w-4xl">
              <h1 className="font-display text-hero text-dark leading-tight tracking-tight text-balance mb-8">
                The return, computed from your closed books.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                Post entries, close the year, and ITR-3 or ITR-4 is computed from what the ledger already holds.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
          </div>
        </header>

        <section className="py-space-128 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <SectionHeader
                title="Old regime or new, run on your actual income"
                lede="The same income, run through both regimes side by side. Not a generic calculator."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12 bg-surface border border-border-subtle rounded-sm overflow-x-auto">
                <table className="w-full text-left font-ui text-ui-sm">
                  <caption className="sr-only">
                    Old versus new tax regime on a business income of ₹20,000
                  </caption>
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light">Line item</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light text-right">Old regime</th>
                      <th scope="col" className="px-6 py-4 font-mono text-ui-xs text-light text-right">New regime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {regimeRows.map((row) => (
                      <tr key={row.line}>
                        <th scope="row" className="px-6 py-4 font-ui font-medium text-dark">
                          {row.line}
                        </th>
                        <td className="px-6 py-4 font-mono text-mono-sm text-mid text-right">{row.old}</td>
                        <td className="px-6 py-4 font-mono text-mono-sm text-mid text-right">{row.neu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 font-mono text-ui-xs text-light max-w-2xl">
                Illustrative example: a business income of ₹20,000 sits below the exemption limit under both regimes, so the tax is ₹0 either way. The regimes diverge as income grows: the new regime lowers slab rates and drops most deductions, the old regime keeps the deductions.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <SectionHeader
                title="One review, then file"
                lede="The computation runs against the closed year's entries, and the return is generated for download in one step."
              />
              <ul className="list-none p-0 m-0 mt-10 space-y-3">
                <li className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle pb-3">
                  Income computed from the ledger, not from a spreadsheet
                </li>
                <li className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle pb-3">
                  Deductions applied where the chosen regime allows them
                </li>
                <li className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle pb-3">
                  Return generated as a document ready for the portal
                </li>
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <BrowserFrame
                src="/images/marketing/itr-returns.png"
                alt="ITR returns list in Arthvahi"
              />
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="File this year from the ledger you already closed."
          lede="Start free and compute a return from the year your books already hold."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
