'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { CapabilityTicker } from '@/components/marketing/capability-ticker';
import { Reveal } from '@/components/marketing/reveal';

const moduleTabs = [
  {
    id: 'gst',
    label: 'GST',
    title: 'Returns from the ledger, reconciled and ready',
    desc: 'GSTR-1, 2B and 3B built from posted invoices, with purchase-side reconciliation for ITC claims.',
    src: '/images/marketing/gst-hub.png',
    alt: 'GST returns hub showing return types and filing status',
  },
  {
    id: 'gstr1',
    label: 'GSTR-1',
    title: 'One return, section by section',
    desc: 'A generated GSTR-1 with outward supplies organised the way the portal expects them.',
    src: '/images/marketing/gstr1.png',
    alt: 'Generated GSTR-1 return with outward supplies table',
  },
  {
    id: 'itr',
    label: 'ITR',
    title: 'Income tax from the same books',
    desc: 'ITR-3 and ITR-4 computed directly from posted revenue and expenses, with the annual projection in place.',
    src: '/images/marketing/itr-returns.png',
    alt: 'ITR returns list showing computation status',
  },
  {
    id: 'invoicing',
    label: 'Invoicing',
    title: 'Invoices that carry the compliance forward',
    desc: 'GST-compliant invoices with e-invoice IRN payloads, printed or sent, with every line posting to the ledger.',
    src: '/images/marketing/invoices.png',
    alt: 'Invoice list with draft and issued statuses',
  },
];

const testimonials = [
  {
    quote:
      'My accountant\u2019s GSTR-1 matches the ledger I keep every day. Year end is now a review, not a rebuild.',
    author: 'Rohan Deshpande',
    role: 'CA in practice, Pune',
  },
  {
    quote:
      'We closed our first financial year with every balance tying to the bank statement. Arthvahi became our system of record.',
    author: 'Ananya Iyer',
    role: 'Founder, homeware brand, Jaipur',
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(moduleTabs[0].id);
  const reduce = useReducedMotion();
  const active = moduleTabs.find((t) => t.id === activeTab) ?? moduleTabs[0];

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          // translate-only on mount: opacity fades during load are caught
          // mid-flight by automated contrast scanners (blended colors fail)
          initial: { y: 24 },
          animate: { y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className="bg-page-bg text-dark font-ui selection:bg-amber-soft min-h-screen">
      <MarketingNav />

      <main id="main-content">
        {/* ─── Hero ─── */}
        <header className="px-6 md:px-8 lg:px-12 max-w-[1320px] mx-auto pt-24 pb-24 md:pt-32 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="max-w-[34rem]">
              <motion.p
                {...rise(0.05)}
                className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6"
              >
                Indian compliance · one ledger
              </motion.p>
              <motion.h1
                {...rise(0.15)}
                className="font-display text-marketing-hero text-dark leading-tight tracking-tight text-balance"
              >
                Accounts that speak the language of Indian compliance.
              </motion.h1>
              <motion.p
                {...rise(0.25)}
                className="font-ui text-ui-lg text-mid leading-relaxed mt-6 max-w-lg"
              >
                Double-entry books, GST, ITR and payroll in one ledger, built for the way Indian
                businesses actually file.
              </motion.p>
              <motion.div {...rise(0.35)} className="flex flex-wrap gap-4 mt-10">
                <MarketingButton href="/signup">
                  Start Free <span aria-hidden="true">→</span>
                </MarketingButton>
                <MarketingButton href="/demo" variant="secondary">
                  Book a Demo
                </MarketingButton>
              </motion.div>
            </div>
            <motion.div {...rise(0.45)}>
              <BrowserFrame
                src="/images/marketing/dashboard.png"
                alt="Arthvahi dashboard showing the books summary"
                className="shadow-screenshot"
              />
            </motion.div>
          </div>
        </header>

        <CapabilityTicker />

        {/* ─── Modules ─── */}
        <section className="py-space-128 px-6 md:px-8 max-w-[1320px] mx-auto">
          <div className="grid lg:grid-cols-[minmax(0,26rem)_1fr] gap-16 lg:gap-20">
            <div>
              <SectionHeader
                eyebrow="Built for the Indian fiscal code"
                title="Every return, from one ledger."
                lede="Each module starts from the same double-entry books, so the numbers you file match the numbers you book."
              />
              <div
                role="tablist"
                aria-label="Product modules"
                className="mt-12 flex flex-col border-l border-border-subtle"
              >
                {moduleTabs.map((tab, i) => {
                  const selected = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      id={`module-tab-${tab.id}`}
                      aria-selected={selected}
                      aria-controls={`module-panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-left group border-none bg-transparent cursor-pointer px-6 py-5 border-l-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber ${
                        selected
                          ? 'border-amber'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <span
                        className={`font-mono text-mono-sm mb-1.5 block transition-colors ${
                          selected ? 'text-amber' : 'text-light group-hover:text-mid'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')} / {tab.label}
                      </span>
                      <span
                        className={`font-display text-display-lg block leading-snug text-balance transition-colors ${
                          selected ? 'text-dark' : 'text-mid group-hover:text-dark'
                        }`}
                      >
                        {tab.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:pt-24">
              <div
                key={active.id}
                role="tabpanel"
                id={`module-panel-${active.id}`}
                aria-labelledby={`module-tab-${active.id}`}
                className="lg:sticky lg:top-16"
              >
                <motion.div
                  {...(reduce
                    ? {}
                    : {
                        initial: { opacity: 0, y: 16 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
                      })}
                >
                  <BrowserFrame
                    src={active.src}
                    alt={active.alt}
                    className="shadow-screenshot"
                    aspect="aspect-[16/11]"
                  />
                  <p className="font-ui text-ui-sm text-mid leading-relaxed mt-6 max-w-[52ch]">
                    {active.desc}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Ledger strip ─── */}
        <section className="bg-section-dark py-space-128 px-6 md:px-8">
          <div className="max-w-[1320px] mx-auto">
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="font-display text-display-xl text-white leading-[1.08] tracking-tight text-balance">
                  The ledger does the filing.
                </h2>
                <p className="font-ui text-ui-md text-sidebar-dim leading-relaxed mt-5 max-w-[60ch]">
                  Returns draw directly from the same double-entry books, so what you file is what
                  you booked.
                </p>
              </div>
            </Reveal>
            <div className="grid lg:grid-cols-2 gap-16 mt-16">
              <Reveal>
                <figure>
                  <figcaption className="font-mono text-mono-sm text-sidebar-muted mb-3">
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
              <Reveal delay={0.1}>
                <figure className="lg:mt-16">
                  <figcaption className="font-mono text-mono-sm text-sidebar-muted mb-3">
                    Receivables, aged and followed up
                  </figcaption>
                  <BrowserFrame
                    src="/images/marketing/receivables.png"
                    alt="Receivables view showing invoice age and outstanding amounts"
                    className="shadow-screenshot"
                    url="app.arthvahi.in/receivables"
                  />
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="py-space-128 px-6 md:px-8">
          <div className="max-w-[1320px] mx-auto">
            <SectionHeader
              title="From the people who keep the books."
              lede="Illustrative accounts from practising accountants and founders."
            />
            <div className="grid lg:grid-cols-2 gap-8 mt-16">
              {testimonials.map((t, i) => (
                <Reveal key={t.author} delay={i * 0.1}>
                  <blockquote
                    className={`bg-surface border border-border-subtle rounded-sm p-10 ${
                      i === 1 ? 'lg:mt-16' : ''
                    }`}
                  >
                    <p className="font-display text-display-lg text-dark leading-snug text-balance">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4 mt-8">
                      <span
                        aria-hidden="true"
                        className="w-10 h-10 rounded-sm bg-amber-soft text-amber flex items-center justify-center font-mono text-mono-sm font-semibold"
                      >
                        {t.author
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      <div>
                        <p className="font-ui text-ui-sm font-semibold text-dark">{t.author}</p>
                        <p className="font-mono text-mono-sm text-mid mt-0.5">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          title="Start with one ledger. File everything from it."
          lede="Free to start, no credit card required. Your chart of accounts is ready in minutes."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
