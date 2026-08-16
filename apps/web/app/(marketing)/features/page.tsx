import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { CapabilityTicker } from '@/components/marketing/capability-ticker';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const cards = [
  {
    index: '01',
    label: 'Accounting',
    title: 'Books that stay in balance',
    copy: 'Double-entry journaling with validation at the point of entry. A chart of accounts mapped to Schedule III, fiscal-year sequencing and print-ready statements.',
    points: ['Journal entries', 'Chart of accounts', 'P&L and balance sheet'],
    image: '/images/marketing/journal.png',
    alt: 'Journal entries screen in Arthvahi',
    href: '/features/accounting',
    linkLabel: 'Read the accounting module',
    span: 'lg:col-span-7',
  },
  {
    index: '02',
    label: 'GST',
    title: 'Returns written from your own invoices',
    copy: 'GSTR-1, 2B and 3B generated from posted entries, with ITC mismatches flagged before filing and every figure traceable to a source invoice.',
    points: ['GSTR-1, 2B, 3B', 'E-invoice IRN', 'E-way bills'],
    href: '/features/gst',
    linkLabel: 'Read the GST module',
    span: 'lg:col-span-5',
  },
  {
    index: '03',
    label: 'Invoicing',
    title: 'An invoice is a journal entry waiting to happen',
    copy: 'GST-compliant invoices with GSTIN and HSN checks, gapless numbering and e-invoice IRN, posted to the ledger the moment they are saved.',
    points: ['GSTIN and HSN checks', 'E-invoice IRN', 'Gapless numbering'],
    href: '/features/invoicing',
    linkLabel: 'Read the invoicing module',
    span: 'lg:col-span-5',
  },
  {
    index: '04',
    label: 'ITR',
    title: 'From closed books to a filed return',
    copy: 'The annual return is computed from posted revenue and expenses within the financial year, with the old and new regimes compared side by side.',
    points: ['ITR-3 and ITR-4', 'Old vs new regime', 'Computed from books'],
    image: '/images/marketing/itr-returns.png',
    alt: 'ITR returns list in Arthvahi',
    href: '/features/itr',
    linkLabel: 'Read the ITR module',
    span: 'lg:col-span-7',
  },
  {
    index: '05',
    label: 'Payroll',
    title: 'Statutory deductions without the lookup tables',
    copy: 'PF, ESI, TDS and professional tax computed from salary structures each run, with payslips and challans prepared from the same figures.',
    points: ['PF, ESI, TDS, PT', 'Payslips and challans'],
    href: '/features/payroll',
    linkLabel: 'Read the payroll module',
    span: 'lg:col-span-4',
  },
  {
    index: '06',
    label: 'The rest of the ledger',
    title: 'Receivables, inventory and OCR feed the same books',
    copy: 'Every sale lands in receivables, every purchase is valued on FIFO, and scanned vendor bills are read into expense accounts. One ledger holds all of it.',
    points: ['Receivables ageing', 'FIFO inventory', 'OCR capture'],
    image: '/images/marketing/receivables.png',
    alt: 'Receivables view in Arthvahi',
    href: '/features/accounting',
    linkLabel: 'See the ledger',
    span: 'lg:col-span-8',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-96">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6">
                Platform overview
              </p>
              <h1 className="font-display text-marketing-hero text-dark leading-tight tracking-tight text-balance mb-8">
                One ledger. Every compliance return drawn from it.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                Accounting, GST, payroll and ITR that share a single set of books, so nothing is ever re-entered.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
            <Reveal>
              <BrowserFrame
                src="/images/marketing/dashboard.png"
                alt="Arthvahi dashboard showing the unified ledger"
              />
            </Reveal>
          </div>
        </header>

        <CapabilityTicker />

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {cards.map((card, i) => (
                <Reveal key={card.index} delay={i * 0.05} className={card.span}>
                  <article className="h-full flex flex-col bg-surface border border-border-subtle rounded-sm p-8 lg:p-10">
                    <div className="flex items-baseline gap-3 mb-5">
                      <span className="font-mono text-ui-2xs text-amber">{card.index}</span>
                      <span className="font-mono text-ui-2xs text-light">
                        {card.label}
                      </span>
                    </div>
                    <h2 className="font-display text-display-lg text-dark leading-snug tracking-tight mb-4">
                      {card.title}
                    </h2>
                    <p className="font-ui text-ui-md text-mid leading-relaxed mb-6">{card.copy}</p>
                    <ul className="list-none p-0 m-0 mb-6 space-y-2">
                      {card.points.map((point) => (
                        <li key={point} className="font-mono text-mono-sm text-mid">
                          {point}
                        </li>
                      ))}
                    </ul>
                    {card.image && (
                      <div className="mb-6">
                        <BrowserFrame
                          src={card.image}
                          alt={card.alt}
                          aspect="aspect-[16/10]"
                        />
                      </div>
                    )}
                    <div className="mt-auto">
                      <MarketingButton href={card.href} variant="ghost">
                        {card.linkLabel} <span aria-hidden="true">→</span>
                      </MarketingButton>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="Every module, one ledger underneath."
          lede="Bring your own numbers; every return follows from the entries."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
