import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const fifoSteps = [
  {
    id: '01',
    title: 'Goods received',
    desc: 'A purchase receipt opens a stock layer, each one carrying quantity, unit cost, batch number and receipt date.',
  },
  {
    id: '02',
    title: 'Goods delivered',
    desc: 'A sales delivery consumes the oldest layer first. First in, first out, without blending costs.',
  },
  {
    id: '03',
    title: 'Cost taken from the layer',
    desc: 'The cost of goods sold is the delivered layer\u2019s own unit cost, so margins stay tied to what was actually paid.',
  },
  {
    id: '04',
    title: 'Layers keep their costs',
    desc: 'Whatever remains stays valued at the price each batch was bought at, layer by layer, to the last unit.',
  },
];

const stockOps = [
  'Receive: purchases land in stock and open a layer',
  'Deliver: sales consume the oldest stock first',
  'Adjust: corrections record a dated movement',
];

const stockFlags = [
  'Low stock: items below the on-hand threshold are flagged',
  'Out of stock: items at zero on-hand are counted and listed',
  'Valuation report: stock value per product, from remaining layers',
];

export default function InventoryFeaturePage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-96">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="max-w-4xl">
              <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6">
                Inventory
              </p>
              <h1 className="font-display text-marketing-hero text-dark leading-tight tracking-tight text-balance mb-8">
                Inventory valued the way your CA values it.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                FIFO valuation computed from the goods you actually received, batch by batch, at the cost you paid.
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
              <div className="md:-rotate-[0.5deg]">
                <BrowserFrame
                  src="/images/marketing/inventory.png"
                  alt="Inventory overview in Arthvahi showing stock and valuation"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-space-128 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <SectionHeader
                title="FIFO, from receipt to sale"
                lede="Purchases land as layers. Deliveries draw from the oldest layer first. The stock value on the balance sheet is the sum of the layers that remain."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 mt-14">
              {fifoSteps.map((step) => (
                <Reveal as="li" key={step.id}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-6 border-b-[0.5px] border-border-subtle">
                    <span className="sm:col-span-1 font-mono text-ui-2xs text-amber pt-0.5">{step.id}</span>
                    <h3 className="sm:col-span-4 font-mono text-mono-md text-dark leading-relaxed">
                      {step.title}
                    </h3>
                    <p className="sm:col-span-7 font-ui text-ui-md text-mid leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
              <Reveal as="li">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 pt-6">
                  <span className="sm:col-span-1 font-mono text-ui-2xs text-amber pt-0.5">BL</span>
                  <p className="sm:col-span-11 font-mono text-mono-md text-dark leading-relaxed">
                    Stock value = remaining quantity × unit cost, summed across layers
                  </p>
                </div>
              </Reveal>
            </ol>
          </div>
        </section>

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <SectionHeader
                title="Movements traced, thresholds flagged"
                lede="Every stock operation is a dated record, and the summary keeps the items that need attention in plain view."
              />
            </Reveal>
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <Reveal>
                <ul className="list-none p-0 m-0 space-y-3 mb-10">
                  {stockOps.map((line) => (
                    <li key={line} className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle pb-3">
                      {line}
                    </li>
                  ))}
                </ul>
                <BrowserFrame
                  src="/images/marketing/stock.png"
                  alt="Stock movements in Arthvahi with batch and receipt details"
                />
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="list-none p-0 m-0 space-y-3 mb-10">
                  {stockFlags.map((line) => (
                    <li key={line} className="font-mono text-mono-sm text-mid border-b-[0.5px] border-border-subtle pb-3">
                      {line}
                    </li>
                  ))}
                </ul>
                <BrowserFrame
                  src="/images/marketing/products.png"
                  alt="Product list in Arthvahi with HSN codes and stock flags"
                />
              </Reveal>
            </div>
          </div>
        </section>

        <CtaBand
          title="Stock valued from the goods you actually hold."
          lede="Start free, receive your first purchase, and watch the layers build."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
