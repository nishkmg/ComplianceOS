import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const payloadFields = [
  { field: 'Document', desc: 'Invoice number and date, with the transaction typed as B2B.' },
  { field: 'Seller', desc: 'Your GSTIN, legal name and address.' },
  { field: 'Buyer', desc: 'Their GSTIN, legal name, state and place of supply.' },
  { field: 'Lines', desc: 'HSN, quantity, unit price, tax rate and the CGST, SGST and IGST split.' },
  { field: 'Values', desc: 'Assessable value, tax totals and the invoice total.' },
  { field: 'IRN', desc: 'The invoice reference number returned by the IRP, with the signed QR generated alongside.' },
];

const roadmap = [
  {
    id: '01',
    title: 'Payload prepared',
    desc: 'Every B2B invoice generates the full IRN payload per the NIC e-invoice schema v1.03, QR included.',
  },
  {
    id: '02',
    title: 'Sandbox validation',
    desc: 'The same payload is checked against the NIC test IRP before anything is relied upon.',
  },
  {
    id: '03',
    title: 'Production IRP connection',
    desc: 'Live portal submission is on the roadmap. Until it lands, nothing is claimed that the gateway has not confirmed.',
  },
];

const fits = [
  { id: '01', title: 'E-invoice generated', desc: 'IRN payload prepared for the supply, QR alongside.' },
  { id: '02', title: 'Lands in GSTR-1', desc: 'The supply appears in the outward-return data for the period.' },
  { id: '03', title: 'Posted to the ledger', desc: 'The same invoice already debited receivables and credited revenue and output tax.' },
];

export default function EinvoiceFeaturePage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-128">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6">
                E-invoice
              </p>
              <h1 className="font-display text-hero-split text-dark tracking-tight text-balance mb-8">
                E-invoices built to the NIC schema, IRP-ready.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                Every B2B invoice generates an IRN payload and QR per schema v1.03. Production portal submission is on the roadmap.
              </p>
              <div className="flex flex-wrap gap-4">
                <MarketingButton href="/signup">
                  Start Free <span aria-hidden="true">→</span>
                </MarketingButton>
                <MarketingButton href="/contact" variant="secondary">
                  Book a Demo
                </MarketingButton>
              </div>
            </div>
            <BrowserFrame
              src="/images/marketing/gstr1.png"
              alt="GSTR-1 return preview in Arthvahi"
              className="shadow-md"
            />
          </div>
        </header>

        <section className="py-space-128 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <SectionHeader
                title="What an e-invoice carries"
                lede="Six blocks, every one a real field in the payload built from your invoice."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 mt-12 max-w-4xl">
              {payloadFields.map((item) => (
                <Reveal as="li" key={item.field}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-6 border-b-[0.5px] border-border-subtle hover:bg-section-muted/50 transition-colors">
                    <span className="sm:col-span-1 font-mono text-ui-2xs text-amber pt-0.5">
                      {String(payloadFields.indexOf(item) + 1).padStart(2, '0')}
                    </span>
                    <h3 className="sm:col-span-3 font-mono text-mono-md text-dark leading-relaxed">
                      {item.field}
                    </h3>
                    <p className="sm:col-span-8 font-ui text-ui-md text-mid leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <SectionHeader
                title="From payload to portal"
                lede="Three steps. The first is built today; the last is on the roadmap."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 mt-14 max-w-3xl space-y-3">
              {roadmap.map((step) => (
                <Reveal as="li" key={step.id}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 rounded-sm border border-border-subtle bg-surface px-4 py-3 transition-all duration-200 hover:shadow-md hover:border-amber/40">
                    <span className="font-mono text-ui-2xs text-amber">{step.id}</span>
                    <h3 className="font-mono text-mono-md text-dark leading-relaxed">{step.title}</h3>
                    <p className="font-ui text-ui-md text-mid leading-relaxed sm:ml-auto sm:max-w-[48ch]">
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <p className="font-mono text-mono-sm text-mid border-t-[0.5px] border-border-subtle pt-6 mt-12 max-w-3xl">
              E-way bill payloads are prepared from sales invoices above the value threshold; portal connection is on the roadmap.
            </p>
          </div>
        </section>

        <section className="py-space-128 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <SectionHeader
                title="How it fits"
                lede="The e-invoice is not a side artifact. It is one step in the same flow that reaches GSTR-1 and the ledger."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 mt-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {fits.map((step, i) => (
                <Reveal as="li" key={step.id}>
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="font-mono text-ui-2xs text-amber">{step.id}</span>
                    {i < fits.length - 1 && (
                      <span className="font-mono text-mono-sm text-light hidden lg:inline" aria-hidden="true">
                        →
                      </span>
                    )}
                  </div>
                  <h3 className="font-mono text-mono-md text-dark leading-relaxed mb-2">{step.title}</h3>
                  <p className="font-ui text-ui-sm text-mid leading-relaxed">{step.desc}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <CtaBand
          title="Your e-invoices, prepared and waiting for the IRP."
          lede="Start free. The payload is built from your invoices; the portal connection is next on the roadmap."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
