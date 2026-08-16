import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const liveIntegrations = [
  {
    id: '01',
    title: 'Email',
    desc: 'Outbound invoices and documents delivered over SMTP via nodemailer.',
    status: 'Live',
  },
  {
    id: '02',
    title: 'OCR providers',
    desc: 'Invoice scanning with Tesseract.js by default; an OpenAI-compatible vision endpoint can be configured for structured extraction.',
    status: 'Live',
  },
  {
    id: '03',
    title: 'Storage',
    desc: 'Supabase storage in production, with a local-driver fallback for development and self-hosting.',
    status: 'Live',
  },
  {
    id: '04',
    title: 'Sign-in',
    desc: 'Credentials-based authentication through NextAuth, backed by the local database.',
    status: 'Live',
  },
  {
    id: '05',
    title: 'Redis',
    desc: 'Optional caching and queue support, health-checked at startup.',
    status: 'Live',
  },
];

const plannedIntegrations = [
  {
    id: '06',
    title: 'GSTN / GSP adapter',
    desc: 'A mock adapter exists today for return payloads; production GSP connectivity is scheduled.',
    status: 'Planned',
  },
  {
    id: '07',
    title: 'ITR e-filing adapter',
    desc: 'Currently a mock only; the generated return is downloaded and filed on the portal by hand.',
    status: 'Planned',
  },
  {
    id: '08',
    title: 'Production IRP (NIC e-invoice)',
    desc: 'IRN payloads are prepared to the NIC schema; the production IRP connection is on the roadmap.',
    status: 'Planned',
  },
  {
    id: '09',
    title: 'E-way bill portal',
    desc: 'Payloads are prepared from sales invoices; portal connectivity is on the roadmap.',
    status: 'Planned',
  },
  {
    id: '10',
    title: 'Bank feeds and reconciliation',
    desc: 'Statement-based reconciliation will replace manual matching.',
    status: 'Planned',
  },
  {
    id: '11',
    title: 'Invoice delivery beyond SMTP',
    desc: 'WhatsApp and email delivery channels beyond the current SMTP path.',
    status: 'Planned',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-96 pb-space-64">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <div className="max-w-4xl">
              <h1 className="font-display text-hero text-dark tracking-tight text-balance mb-8">
                What connects today, and what is mapped for next.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                A short list, kept honest. Every integration here is either running in production today or marked clearly as planned.
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
                eyebrow="Integration ledger"
                title="Connected today"
                lede="Five integrations are live. Each one is configurable without touching the ledger."
              />
            </Reveal>
            <ul className="list-none p-0 m-0 mt-12">
              {liveIntegrations.map((item, index) => (
                <Reveal as="li" key={item.id} delay={0.05 * index}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-6 border-b-[0.5px] border-border-subtle items-baseline">
                    <span className="sm:col-span-1 font-mono text-ui-2xs text-amber pt-1">{item.id}</span>
                    <h3 className="sm:col-span-3 font-display text-display-lg text-dark leading-snug tracking-tight">
                      {item.title}
                    </h3>
                    <p className="sm:col-span-6 font-ui text-ui-md text-mid leading-relaxed">{item.desc}</p>
                    <span className="sm:col-span-2 font-mono text-ui-xs uppercase tracking-[0.18em] text-amber text-right">
                      {item.status}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-space-96">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8">
            <Reveal>
              <SectionHeader
                title="On the roadmap"
                lede="Six planned connections, each with a clear status. GSP and e-filing adapters run against sandbox mocks today; production connections are scheduled."
              />
            </Reveal>
            <ul className="list-none p-0 m-0 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plannedIntegrations.map((item, index) => (
                <Reveal as="li" key={item.id} delay={0.05 * index}>
                  <div className="h-full rounded-sm border border-border-subtle bg-surface p-5 flex flex-col gap-2">
                    <span className="font-mono text-ui-2xs uppercase tracking-[0.18em] text-light">
                      {item.status}
                    </span>
                    <h3 className="font-display text-display-lg text-dark leading-snug tracking-tight">
                      {item.title}
                    </h3>
                    <p className="font-ui text-ui-md text-mid leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-space-96 bg-section-dark">
          <div className="max-w-[1320px] mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <h2 className="font-display text-marketing-xl text-white leading-[1.08] tracking-tight text-balance mb-6">
                How integrations are built
              </h2>
              <p className="font-ui text-ui-md text-sidebar-dim leading-relaxed mb-8 max-w-[52ch]">
                Every connection goes through a typed API (tRPC) with per-tenant isolation. A webhook or adapter never touches the ledger directly; it calls the same commands as the interface, so the event store stays the single write path.
              </p>
              <ul className="list-none p-0 m-0 space-y-3">
                <li className="font-mono text-mono-sm text-sidebar-muted">
                  Typed endpoints, validated on both sides
                </li>
                <li className="font-mono text-mono-sm text-sidebar-muted">
                  Per-tenant isolation on every request
                </li>
                <li className="font-mono text-mono-sm text-sidebar-muted">
                  Every integration auditable in the event log
                </li>
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="bg-surface border border-border-subtle rounded-sm overflow-x-auto">
                <div className="px-6 py-4 border-b-[0.5px] border-border-subtle font-mono text-ui-xs text-light">
                  typings that ship with the API
                </div>
                <ul className="list-none p-0 m-0">
                  <li className="px-6 py-3 border-b-[0.5px] border-border-subtle font-mono text-mono-sm text-mid">
                    tenant-scoped procedures
                  </li>
                  <li className="px-6 py-3 border-b-[0.5px] border-border-subtle font-mono text-mono-sm text-mid">
                    status surfaced per connection
                  </li>
                  <li className="px-6 py-3 font-mono text-mono-sm text-mid">
                    docs generated from the schema
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <CtaBand
          title="One ledger, connected where it counts."
          lede="Start free and see which integrations light up for your business today."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
