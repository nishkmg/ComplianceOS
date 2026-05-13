
import { MarketingNav } from '@/components/marketing/nav';
import { Icon } from '@/components/ui/icon';
import { MarketingFooter } from '@/components/marketing/footer';
import Link from 'next/link';

const modules = [
  { 
    id: '01 / Core',
    name: 'Precision Accounting', 
    desc: 'Double-entry bookkeeping redefined with automated reconciliation and immutable audit trails. Built to satisfy the most rigorous statutory audits.',
    bullets: [
      'Multi-currency sub-ledgers with real-time forex adjustment.',
      'Automated bank feed matching with 99.8% accuracy.',
      'Configurable chart of accounts compliant with Schedule III.'
    ],
    image: '/images/features/accounting.jpg',
    href: '/features/accounting'
  },
  { 
    id: '02 / Taxation',
    name: 'GST Intelligence', 
    desc: 'Navigate the complexities of Indian GST with a module that validates data before submission, drastically reducing notice probabilities.',
    bullets: [
      'Direct API integration with the GSTN portal.',
      'Automated GSTR-2A/2B versus Purchase Register reconciliation.',
      'E-way bill generation directly from source invoices.'
    ],
    image: '/images/features/gst.jpg',
    reverse: true,
    href: '/features/gst'
  },
  { 
    id: '03 / Operations',
    name: 'E-Invoicing Standard', 
    desc: 'Issue universally compliant electronic invoices in milliseconds. Formatted perfectly for B2B transactions and immediate government ledgering.',
    bullets: [
      'Instant IRN and QR code generation via NIC integration.',
      'Customizable, professional templates mapping to statutory fields.',
      'Automated recurring billing schedules.'
    ],
    image: '/images/features/invoicing.jpg',
    href: '/features/invoicing'
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />
      
      <main className="flex flex-col items-center pt-16">
        {/* Hero Section */}
        <section className="w-full max-w-5xl text-center pt-space-128 pb-space-96 px-gutter-desktop">
          <h2 className="font-ui text-amber uppercase tracking-[0.2em] mb-6 inline-block border-b border-amber pb-1">Platform Architecture</h2>
          <h1 className="font-marketing-hero text-marketing-hero text-dark mx-auto max-w-4xl">
            Every module your accountant wanted. Built together, not bolted on.
          </h1>
          <p className="font-ui text-ui-lg text-secondary mt-8 max-w-2xl mx-auto leading-relaxed">
            A unified ledger system engineered for strict adherence to Indian compliance standards, eliminating reconciliation errors before they occur.
          </p>
        </section>

        {/* Modules Zigzag Container */}
        <section className="w-full max-w-6xl space-y-space-96 px-gutter-desktop pb-space-128">
          {modules.map((m) => (
            <article key={m.name} className={`flex flex-col items-center gap-gutter-wide ${m.reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
              <div className={`flex-1 space-y-6 ${m.reverse ? 'md:pl-12' : 'md:pr-12'} text-left`}>
                <div className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber">{m.id}</div>
                <h3 className="font-display text-marketing-xl text-dark">{m.name}</h3>
                <p className="font-ui text-ui-md text-secondary leading-relaxed">
                  {m.desc}
                </p>
                <ul className="space-y-3 font-mono text-mono-md text-secondary pt-4 list-none p-0">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <Icon name="check_circle" className="text-primary text-lg mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Link href={m.href} className="group inline-flex items-center gap-2 font-ui text-ui-sm text-amber font-medium hover:text-primary transition-colors no-underline">
                    Explore module 
                    <Icon name="arrow_forward" className="text-sm transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="flex-1 w-full bg-white border border-border-subtle border-t-2 border-t-primary p-2 shadow-sm rounded-sm">
                <div className="aspect-[4/3] w-full bg-section-muted relative overflow-hidden rounded-sm border border-border-subtle/50">
                  <img src={m.image} alt={m.name} className="object-cover w-full h-full opacity-90" />
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
