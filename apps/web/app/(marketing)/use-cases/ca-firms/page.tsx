'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { Reveal } from '@/components/marketing/reveal';

const workflow = [
  {
    step: '01',
    title: 'Receive client books',
    desc: 'Clients post invoices, expenses and payments into their own ledger. Each client keeps its own books, isolated per workspace.',
  },
  {
    step: '02',
    title: 'Post and review',
    desc: 'Review-ready ledgers with every entry visible, so a manager can check a client\u2019s books before anything is filed.',
  },
  {
    step: '03',
    title: 'Generate returns',
    desc: 'GSTR-1 and GSTR-3B are generated from posted entries, and ITR-3 and ITR-4 are computed from closed books.',
  },
  {
    step: '04',
    title: 'File on the portal',
    desc: 'Arthvahi prepares the figures; you file them on the GST portal, which remains the government\u2019s source of truth.',
  },
  {
    step: '05',
    title: 'Archive with evidence',
    desc: 'Fiscal-year close with sequencing, print-ready Schedule III statements, and an immutable audit log per entity.',
  },
];

const firmCapabilities = [
  {
    title: 'Per-client isolation',
    desc: 'Workspace-level tenancy means each client\u2019s books are isolated from every other client\u2019s.',
  },
  {
    title: 'Event-sourced audit log',
    desc: 'Every posting, edit and close is appended as an immutable event, so the history of an entity is never rewritten.',
  },
  {
    title: 'Traceable figures',
    desc: 'Return figures trace back to source entries in the ledger, so a review question lands on the exact posting.',
  },
  {
    title: 'Role-based access',
    desc: 'Owner, accountant, manager and employee roles let a firm control who can post, review and close.',
  },
];

export default function CaFirmsPage() {
  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />
      <main id="main-content">
        {/* Text-led hero */}
        <header className="pt-space-64 pb-space-96 px-8 max-w-[1320px] mx-auto text-left">
          <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold">
            For CA firms
          </p>
          <h1 className="font-display text-marketing-hero text-dark leading-tight tracking-tight text-balance mt-4 max-w-[20ch]">
            One ledger per client. Every return drawn from it.
          </h1>
          <p className="font-ui text-ui-lg text-mid leading-relaxed mt-6 max-w-xl">
            Post once, review in the ledger, and let GSTR and ITR draw from the same closed books.
            Built for the way a practising firm actually works.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <MarketingButton href="/signup">
              Start Free <span aria-hidden="true">→</span>
            </MarketingButton>
            <MarketingButton href="/demo" variant="secondary">
              Book a Demo
            </MarketingButton>
          </div>
        </header>

        {/* Firm workflow */}
        <section className="pb-space-96 px-8 max-w-[1320px] mx-auto">
          <div className="grid lg:grid-cols-[minmax(0,26rem)_1fr] gap-16 lg:gap-20">
            <div>
              <SectionHeader
                title="From client books to filed returns."
                lede="Five steps, one system of record. The ledger is the source every return and statement is drawn from."
              />
            </div>
            <div className="lg:pt-16">
              <ol className="border-l border-border-subtle">
                {workflow.map((item, i) => (
                  <Reveal as="li" key={item.step} delay={i * 0.06} className="pl-8 pb-12 last:pb-0 relative">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-amber"
                      />
                      <p className="font-mono text-mono-sm text-amber">{item.step}</p>
                      <h3 className="font-display text-display-lg text-dark leading-snug text-balance mt-2">
                        {item.title}
                      </h3>
                      <p className="font-ui text-ui-sm text-mid leading-relaxed mt-2 max-w-[56ch]">
                        {item.desc}
                      </p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* GST product shot */}
        <section className="pb-space-96 px-8 max-w-[1320px] mx-auto">
          <Reveal>
            <figure>
              <figcaption className="font-mono text-mono-sm text-mid mb-3">
                GSTR-1, 2B and 3B drawn from posted invoices
              </figcaption>
              <BrowserFrame
                src="/images/marketing/gst-hub.png"
                alt="GST returns hub showing return types and filing status"
                className="shadow-screenshot"
                url="app.arthvahi.in/gst"
              />
            </figure>
          </Reveal>
        </section>

        {/* Review and evidence */}
        <section className="pb-space-96 px-8 max-w-[1320px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            <div className="lg:sticky lg:top-16">
              <SectionHeader
                title="Review-ready books, evidence built in."
                lede="When a client asks where a figure came from, the answer is one click into the ledger. When the audit trail matters, it is already there."
              />
              <ul className="mt-12 space-y-8">
                {firmCapabilities.map((cap, i) => (
                  <Reveal as="li" key={cap.title} delay={i * 0.06}>
                      <h3 className="font-mono text-mono-sm uppercase tracking-wider text-amber">
                        {cap.title}
                      </h3>
                      <p className="font-ui text-ui-sm text-mid leading-relaxed mt-2 max-w-[52ch]">
                        {cap.desc}
                      </p>
                  </Reveal>
                ))}
              </ul>
            </div>
            <div className="lg:pt-24">
              <Reveal>
                <figure>
                  <figcaption className="font-mono text-mono-sm text-mid mb-3">
                    Journal, every entry posted
                  </figcaption>
                  <BrowserFrame
                    src="/images/marketing/journal.png"
                    alt="Journal entries view with debit and credit lines"
                    className="shadow-screenshot"
                    url="app.arthvahi.in/ledger/journal"
                  />
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Portal source of truth band */}
        <section className="bg-section-amber py-space-64 px-8" aria-label="Where filing happens">
          <div className="max-w-[1320px] mx-auto">
            <Reveal>
              <div className="max-w-3xl">
                <p className="font-mono text-mono-sm uppercase tracking-wider text-dark/70">
                  On source of truth
                </p>
                <h2 className="font-display text-display-xl text-dark leading-[1.08] tracking-tight text-balance mt-4">
                  Filing happens on the GST portal. Arthvahi prepares the figures; the portal
                  remains the government&rsquo;s source of truth.
                </h2>
                <p className="font-ui text-ui-md text-dark/80 leading-relaxed mt-5 max-w-[60ch]">
                  We generate and review the numbers against your posted books. Submission stays
                  where the tax department keeps its records, and that is where the final return
                  lives.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="One ledger for every client you keep."
          lede="Free to start, no credit card required. Bring one client\u2019s books in and see the returns draw themselves."
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
