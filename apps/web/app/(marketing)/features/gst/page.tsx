import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const capabilities = [
  {
    id: '01',
    title: 'GSTR-1',
    desc: 'Outward supplies assembled from posted sales invoices, including e-invoice and e-way bill data.',
  },
  {
    id: '02',
    title: 'GSTR-2B reconciliation',
    desc: 'Purchase register matched against the portal statement; unmatched input tax flagged with drill-down to source documents.',
  },
  {
    id: '03',
    title: 'GSTR-3B',
    desc: 'The monthly summary of outward, inward and input tax credit, every figure traceable to its source entry.',
  },
  {
    id: '04',
    title: 'GSTR-9',
    desc: 'The annual return assembled from the period summaries, not rebuilt from scratch at year end.',
  },
  {
    id: '05',
    title: 'E-invoice IRN',
    desc: 'IRN and QR generated for B2B supplies above the notified turnover threshold, without leaving the invoice screen.',
  },
  {
    id: '06',
    title: 'E-way bills',
    desc: 'Generated from sales invoices for consignments above the value threshold, pre-populated from the same data.',
  },
  {
    id: '07',
    title: 'HSN master',
    desc: 'Tax rates and descriptions maintained per HSN code and applied at line level, so rates stay current.',
  },
  {
    id: '08',
    title: 'ITC ledger',
    desc: 'Input credit tracked per supplier, period and return, so every claim stays traceable when asked.',
  },
];

export default function GSTFeaturePage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-96">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="max-w-4xl">
              <h1 className="font-display text-marketing-hero text-dark leading-tight tracking-tight text-balance mb-8">
                GSTR-1, 2B and 3B generated from your own entries.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                The returns are written from invoices and journal entries you already posted, with ITC mismatches flagged before filing.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
          </div>
        </header>

        <section className="pb-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <div className="md:rotate-[0.5deg]">
                <BrowserFrame
                  src="/images/marketing/gst-hub.png"
                  alt="GST hub in Arthvahi showing return status and due dates"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-space-128 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <SectionHeader
                title="What the GST module does"
                lede="Eight capabilities, each one drawn from entries that already exist in the ledger."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 mt-12">
              {capabilities.map((cap) => (
                <Reveal as="li" key={cap.id}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-6 border-b-[0.5px] border-border-subtle">
                    <span className="sm:col-span-1 font-mono text-ui-2xs text-amber pt-1">{cap.id}</span>
                    <h2 className="sm:col-span-3 font-display text-display-lg text-dark leading-snug tracking-tight">
                      {cap.title}
                    </h2>
                    <p className="sm:col-span-8 font-ui text-ui-md text-mid leading-relaxed">{cap.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <SectionHeader
                title="A return with the receipts attached"
                lede="Every line of GSTR-1 points back to the invoices that produced it."
              />
              <p className="font-ui text-ui-md text-mid leading-relaxed mt-6 max-w-[60ch]">
                Open a row and see the supply, the buyer and the e-way bill beneath it. When the return is reviewed, the evidence is one click away.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <BrowserFrame
                src="/images/marketing/gstr1.png"
                alt="GSTR-1 return preview in Arthvahi"
              />
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="File from entries you already posted."
          lede="Start free, post your invoices, and the returns assemble themselves."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
