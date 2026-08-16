'use client';

import { useState } from 'react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { Reveal } from '@/components/marketing/reveal';
import { CtaBand } from '@/components/marketing/cta-band';

const SUBMIT_ERROR =
  'We could not send your request. Email us directly at hello@arthvahi.in and we will reply within one business day.';

const SUCCESS = 'Request received. We reply within one business day.';

const labelCls = 'text-ui-2xs font-mono uppercase tracking-widest text-mid';
const inputCls =
  'h-9 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-dark shadow-sm placeholder:text-light focus-visible:outline-none focus-visible:border-amber focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

const demoAgenda = [
  'GST returns generated from posted entries',
  'ITR-3 and ITR-4 computed from the same books',
  'A double-entry ledger your accountant can review',
  'Fiscal-year close with end-to-end sequencing',
];

const nextSteps = [
  {
    step: '01',
    title: 'We reply within one business day',
    desc: 'A short call to confirm your books, your return cycle and what you want to see first.',
  },
  {
    step: '02',
    title: 'A 30-minute walkthrough on your books',
    desc: 'Posted entries, generated returns and the ledger, running on your real numbers.',
  },
  {
    step: '03',
    title: 'Guided setup or questions',
    desc: 'Leave with a working ledger and a clear next step, or just answers.',
  },
];

const faqs = [
  {
    q: 'Is it free to try?',
    a: 'Yes. You can start free with a real chart of accounts in minutes, and there is no credit card required to try it.',
  },
  {
    q: 'Do I need my CA present?',
    a: 'No. The account supports owner and accountant roles, so you can keep working on your own and invite your CA to review when you are ready.',
  },
  {
    q: 'What if I use Tally or Zoho?',
    a: 'We do not import books from Tally or Zoho today. Guided setup maps your chart of accounts and you start posting fresh; your CA can review everything from the ledger.',
  },
  {
    q: 'Will the demo touch my real data?',
    a: 'Only if you want it to. Your workspace stays private and your books are never shared without your say-so.',
  },
];

export default function DemoPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    const detail: string[] = [];
    const company = fd.get('company') as string;
    const phone = fd.get('phone') as string;
    const role = fd.get('role') as string;
    const note = fd.get('message') as string;
    if (role) detail.push(`I am: ${role}`);
    if (company) detail.push(`Company: ${company}`);
    if (phone) detail.push(`Phone: ${phone}`);
    if (note) detail.push(`Note: ${note}`);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          subject: 'Demo request',
          message: detail.join('\n') || 'Demo request',
        }),
      });
      if (res.ok) {
        setStatus('done');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />
      <main id="main-content">
        {/* Hero */}
        <header className="pt-space-64 pb-space-64 px-5 md:px-8 max-w-[1320px] mx-auto text-left">
          <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold">
            Book a demo
          </p>
          <h1 className="font-display text-hero text-dark tracking-tight text-balance mt-4">
            Thirty minutes on your books. No setup, no obligation.
          </h1>
          <p className="font-ui text-ui-lg text-mid leading-relaxed mt-6 max-w-xl">
            See GST, ITR and payroll from one ledger, in a 30 minute walkthrough on your own books.
          </p>
          <p className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light mt-10 mb-4">
            What you will see in 30 minutes
          </p>
          <ul className="space-y-2.5">
            {demoAgenda.map((item) => (
              <li key={item} className="flex items-baseline gap-3 font-ui text-ui-md text-mid">
                <span aria-hidden="true" className="font-mono text-mono-sm text-amber">▹</span>
                {item}
              </li>
            ))}
          </ul>
        </header>

        {/* Form + what happens next */}
        <section className="pb-space-96 px-5 md:px-8 max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form card */}
            <div className="lg:col-span-7 bg-surface p-12 border border-border-subtle border-t-2 border-t-amber">
              <p className="font-mono text-mono-sm text-amber uppercase tracking-tighter mb-10">
                Request a demo
              </p>

              {status === 'done' ? (
                <div className="border border-border-subtle rounded-sm bg-section-muted p-8" role="status">
                  <p className="font-display text-display-lg text-dark text-balance">{SUCCESS}</p>
                  <p className="font-ui text-ui-sm text-mid leading-relaxed mt-3">
                    We will write to the email you gave us to schedule your walkthrough.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2 text-left">
                      <label htmlFor="name" className={labelCls}>
                        Name
                      </label>
                      <input id="name" name="name" type="text" required className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                      <label htmlFor="email" className={labelCls}>
                        Work email
                      </label>
                      <input id="email" name="email" type="email" required className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2 text-left">
                      <label htmlFor="company" className={labelCls}>
                        Company
                      </label>
                      <input id="company" name="company" type="text" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                      <label htmlFor="phone" className={labelCls}>
                        Phone <span className="normal-case tracking-normal text-light">(optional)</span>
                      </label>
                      <input id="phone" name="phone" type="tel" className={inputCls} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="role" className={labelCls}>
                      I am
                    </label>
                    <select
                      id="role"
                      name="role"
                      className={`${inputCls} appearance-none cursor-pointer`}
                      required
                    >
                      <option value="" disabled>
                        Select one
                      </option>
                      <option value="founder">Founder</option>
                      <option value="accountant">Accountant</option>
                      <option value="ca-in-practice">CA in practice</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="message" className={labelCls}>
                      Message <span className="normal-case tracking-normal text-light">(optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className={`${inputCls} resize-none`}
                      placeholder="What would you like to see first?"
                    />
                  </div>
                  {status === 'error' && (
                    <p className="text-ui-sm font-mono text-danger" role="alert">
                      {SUBMIT_ERROR}
                    </p>
                  )}
                  <div className="pt-4">
                    <MarketingButton type="submit" className="w-full" disabled={status === 'submitting'}>
                      {status === 'submitting' ? 'Sending…' : 'Book a Demo'}
                      <span aria-hidden="true">→</span>
                    </MarketingButton>
                  </div>
                </form>
              )}
            </div>

            {/* What happens next */}
            <div className="lg:col-span-5 lg:pt-4">
              <p className="font-mono text-mono-sm text-amber uppercase tracking-tighter mb-8">
                What happens next
              </p>
              <ol className="border-l border-border-subtle">
                {nextSteps.map((s, i) => (
                  <Reveal as="li" key={s.step} delay={i * 0.08} className="pl-8 pb-10 last:pb-0 relative">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 -translate-x-1/2 w-2 h-2 rounded-none bg-amber"
                      />
                      <p className="font-mono text-mono-sm text-amber">{s.step}</p>
                      <h2 className="font-display text-display-lg text-dark leading-snug text-balance mt-2">
                        {s.title}
                      </h2>
                      <p className="font-ui text-ui-sm text-mid leading-relaxed mt-2">{s.desc}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Product shot */}
        <section className="pb-space-96 px-5 md:px-8 max-w-[1320px] mx-auto">
          <Reveal>
            <figure>
              <figcaption className="font-mono text-mono-sm text-mid mb-3">
                The dashboard you will walk through
              </figcaption>
              <BrowserFrame
                src="/images/marketing/dashboard.png"
                alt="Arthvahi dashboard showing the books summary"
                className="shadow-screenshot"
              />
            </figure>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="pb-space-96 px-5 md:px-8 max-w-[1320px] mx-auto">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="font-display text-marketing-xl text-dark leading-[1.08] tracking-tight text-balance">
                Before you book.
              </h2>
              <div className="mt-10 divide-y divide-border-subtle border-y border-border-subtle">
                {faqs.map((f) => (
                  <details key={f.q} className="group py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-display text-display-lg text-dark leading-snug text-balance focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
                      {f.q}
                      <span
                        aria-hidden="true"
                        className="font-mono text-mono-lg text-amber transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="font-ui text-ui-md text-mid leading-relaxed mt-4 max-w-[55ch]">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <CtaBand
          title="Skip the demo, start the ledger."
          lede="Free to start, no credit card required. Your chart of accounts is ready in minutes."
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
