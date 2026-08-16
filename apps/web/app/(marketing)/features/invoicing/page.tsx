import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const rules = [
  'GSTIN verified against the portal before save',
  'HSN codes checked against the tax-rate master',
  'Invoice numbers gapless within the financial year',
  'CGST, SGST and IGST split by place of supply',
  'E-invoice IRN generated for registered buyers',
];

const flow = [
  { step: '01', title: 'Invoice saved', desc: 'GSTIN and HSN checks pass, the next number is assigned.' },
  { step: '02', title: 'Entry posted', desc: 'The customer account debited, revenue and output tax credited.' },
  { step: '03', title: 'Receivables updated', desc: 'The invoice appears in the customer ledger, dated and due.' },
  { step: '04', title: 'GSTR-1 ready', desc: 'The supply lands in the outward-return data for the period.' },
];

const entryShape = [
  'Debit: customer receivables',
  'Credit: sales revenue',
  'Credit: CGST output',
  'Credit: SGST output',
];

export default function InvoicingPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-128">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6">
                Invoicing
              </p>
              <h1 className="font-display text-marketing-hero text-dark leading-tight tracking-tight text-balance mb-8">
                Invoices that post to the books themselves.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                Every invoice checks GSTIN and HSN, numbers itself, and writes the journal entry when saved.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
            <Reveal>
              <BrowserFrame
                src="/images/marketing/invoices.png"
                alt="Invoice list in Arthvahi"
              />
            </Reveal>
          </div>
        </header>

        <section className="bg-section-muted border-y-[0.5px] border-border-subtle py-space-96">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <Reveal>
              <SectionHeader
                title="A sale, from invoice to journal entry"
                lede="Nothing on an invoice stays on the invoice. Saving one posts a double-entry record to the books."
              />
              <ul className="list-none p-0 m-0 mt-10 space-y-3">
                {rules.map((rule) => (
                  <li key={rule} className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle pb-3">
                    {rule}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="bg-surface border border-border-subtle rounded-sm p-8 lg:p-10">
                <h2 className="font-display text-display-lg text-dark leading-snug tracking-tight mb-8">
                  Invoice to journal entry, automatically
                </h2>
                <ol className="list-none p-0 m-0">
                  {flow.map((item) => (
                    <li key={item.step} className="border-b-[0.5px] border-border-subtle py-5 first:pt-0 last:border-b-0">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="font-mono text-ui-2xs text-amber">{item.step}</span>
                        <h3 className="font-ui text-ui-sm font-semibold text-dark">{item.title}</h3>
                      </div>
                      <p className="font-ui text-ui-sm text-mid leading-relaxed">{item.desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal className="lg:order-2">
              <SectionHeader
                title="The entry an invoice writes"
                lede="Save an invoice and the matching entry is posted: the customer account debited, revenue and output tax credited. Nothing typed twice."
              />
              <ul className="list-none p-0 m-0 mt-10 space-y-3">
                {entryShape.map((line) => (
                  <li key={line} className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle pb-3">
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="lg:order-1">
              <BrowserFrame
                src="/images/marketing/journal.png"
                alt="Journal entry created from an invoice"
              />
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="Create an invoice, get a journal entry."
          lede="Sign up free and watch the first invoice post itself to the ledger."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
