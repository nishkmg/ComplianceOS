import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const team = [
  {
    name: 'Arjun Mehta',
    role: 'Co-Founder, CEO',
    bio: 'Former Big 4 auditor who spent a decade unravelling complex corporate structures before concluding the software was the bottleneck, not the legislation.',
    image: '/images/about/arjun.jpg',
  },
  {
    name: 'Priya Sharma',
    role: 'Co-Founder, CTO',
    bio: 'Systems architect obsessed with data integrity. Led engineering teams at leading fintech firms before turning to the foundational layer of compliance.',
    image: '/images/about/priya.jpg',
  },
  {
    name: 'Rajiv Desai',
    role: 'Head of Tax Policy',
    bio: 'Three decades navigating the Indian tax code. Ensures every feature we ship reflects the latest gazette notifications and tribunal rulings.',
    image: '/images/about/rajiv.jpg',
  },
];

const beliefs = [
  {
    title: 'Compliance is a feature, not friction',
    desc: 'Built correctly, tax compliance is not an end-of-month panic. It is an invisible byproduct of standard business operations.',
  },
  {
    title: 'Data integrity is paramount',
    desc: 'We do not allow soft deletes or untraceable edits. Every action carries an indelible audit trail. Trust is built on immutable records.',
  },
  {
    title: 'Professionals deserve professional tools',
    desc: 'We reject gamified interfaces for financial software. CAs and accountants need power-user density and keyboard-centric workflows, not simplified dashboards.',
  },
  {
    title: 'Local nuance over global scale',
    desc: 'We will not compromise our integration with Indian tax structures to launch in another market. Depth over breadth, always.',
  },
];

const principles = [
  { index: '01', title: 'Monospaced precision', desc: 'Numeric integrity through fixed-width typography, on screen and in print.' },
  { index: '02', title: 'Measured whitespace', desc: 'Cognitive relief for dense data sets. Ink and paper, not noise.' },
  { index: '03', title: 'Tonal restraint', desc: 'Contrast, not color, establishes hierarchy. One amber accent for what matters.' },
  { index: '04', title: 'Tabular alignment', desc: 'Figures line up in columns the way a ledger page demands.' },
];

export default function AboutPage() {
  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />

      <main className="max-w-[1320px] mx-auto px-8">
        {/* Hero */}
        <section className="pt-space-128 pb-space-96">
          <div className="max-w-4xl">
            <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6 border-l-2 border-amber pl-4">
              About Arthvahi
            </p>
            <h1 className="font-display text-marketing-xl text-dark leading-[1.08] tracking-tight text-balance mb-8">
              We built the accounting software we wished existed when we started our businesses.
            </h1>
            <p className="font-ui text-ui-md text-mid leading-relaxed max-w-2xl">
              A rejection of generic SaaS in favour of editorial precision. Designed
              around the nuances of Indian compliance and high-stakes fiscal
              management, the way a ledger page is designed: for clarity and permanence.
            </p>
          </div>
        </section>

        <div className="h-px bg-border-subtle" />

        {/* Problem */}
        <section className="py-space-96">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-5">
                <h2 className="font-display text-display-xl text-dark mb-6 leading-tight text-balance">
                  Global tools ignore local realities.
                </h2>
                <div className="space-y-6 text-ui-md text-mid leading-relaxed">
                  <p>
                    Most accounting platforms treat Indian compliance as an
                    afterthought, a secondary module bolted onto a Western framework.
                    The result is convoluted workflows, manual GST reconciliation and
                    constant anxiety about audit trails.
                  </p>
                  <p>
                    We felt that friction firsthand. The tools were either too simple
                    for real complexity or too archaic to be usable. So we built the
                    middle path: software that understands the Indian ledger.
                  </p>
                </div>
              </div>
              <div className="md:col-span-7">
                <div className="bg-section-muted border border-border-subtle p-2">
                  <div className="aspect-[4/3] bg-section-muted overflow-hidden">
                    <img
                      src="/images/about/problem.jpg"
                      alt="A stack of paper financial documents on a desk"
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <div className="h-px bg-border-subtle" />

        {/* Philosophy */}
        <section className="py-space-96 bg-section-muted">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <h2 className="font-display text-display-xl text-dark mb-6 leading-tight text-balance">
                A design philosophy rooted in print.
              </h2>
              <p className="font-ui text-ui-md text-mid leading-relaxed mb-6">
                We deliberately set aside the vibrant, bubbly aesthetic of modern
                SaaS. Accounting is a serious discipline that demands deep focus.
              </p>
              <p className="font-ui text-ui-md text-mid leading-relaxed">
                Our interface draws on high-end financial publishing and the physical
                ledger. The off-white surface reduces eye strain during long
                reconciliation sessions; monospaced figures keep tabular data
                perfectly aligned.
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <div className="border-t-2 border-dark">
                {principles.map((p) => (
                  <div
                    key={p.index}
                    className="grid grid-cols-12 gap-4 py-6 border-b border-border-subtle"
                  >
                    <span className="col-span-2 font-mono text-mono-sm text-amber">{p.index}</span>
                    <div className="col-span-10">
                      <h3 className="font-mono text-mono-md text-dark uppercase tracking-tighter mb-1">
                        {p.title}
                      </h3>
                      <p className="text-ui-sm text-mid">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-border-subtle" />

        {/* Team */}
        <section className="py-space-96">
          <h2 className="font-display text-display-xl text-dark mb-12 text-balance">
            Built by people who have prepared books, not just sold software.
          </h2>
          <div className="divide-y divide-border-subtle border-y border-border-subtle">
            {team.map((member) => (
              <div key={member.name} className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 items-center">
                <div className="md:col-span-2">
                  <div className="aspect-square max-w-[120px] overflow-hidden bg-section-muted">
                    <img
                      src={member.image}
                      alt={`Portrait of ${member.name}`}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                </div>
                <div className="md:col-span-4">
                  <h3 className="font-display text-display-lg text-dark">{member.name}</h3>
                  <p className="font-mono text-mono-sm text-amber uppercase tracking-tighter mt-1">
                    {member.role}
                  </p>
                </div>
                <p className="md:col-span-6 text-ui-sm text-mid leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border-subtle" />

        {/* Values: ledger-style list */}
        <section className="py-space-96 mb-space-64">
          <h2 className="font-display text-display-xl text-dark mb-12 text-balance">
            What we believe
          </h2>
          <div>
            {beliefs.map((b, i) => (
              <div
                key={b.title}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 py-8 border-t border-border-subtle"
              >
                <span className="md:col-span-2 font-mono text-mono-sm text-amber">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="md:col-span-10">
                  <h3 className="font-display text-display-lg text-dark mb-2 leading-tight">
                    {b.title}
                  </h3>
                  <p className="font-ui text-ui-md text-mid leading-relaxed max-w-[60ch]">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <CtaBand
        title="Keep books the way you actually work."
        lede="Start free, import your chart of accounts, and see whether the ledger fits your practice before you pay a rupee."
        note="Free plan · no card required"
      />

      <MarketingFooter />
    </div>
  );
}
