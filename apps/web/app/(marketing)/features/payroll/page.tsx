import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { CtaBand } from '@/components/marketing/cta-band';
import { Reveal } from '@/components/marketing/reveal';

const statutory = [
  {
    id: '01',
    title: 'Provident fund',
    desc: '12% of basic wages from the employee and the employer each, on wages up to the statutory ceiling.',
  },
  {
    id: '02',
    title: 'ESI',
    desc: 'Health insurance for employees below the wage threshold: 0.75% from the employee and 3.25% from the employer.',
  },
  {
    id: '03',
    title: 'TDS on salary',
    desc: 'Deducted under Section 192 at the slab rates in force, with investment declarations applied to the projection.',
  },
  {
    id: '04',
    title: 'Professional tax',
    desc: 'A state levy with its own slab; the schedule is applied for the state the employee works in.',
  },
];

const steps = [
  { id: '01', title: 'Define salary structures', desc: 'Basic, allowances and perquisites per employee, with the statutory components attached once.' },
  { id: '02', title: 'Run the month', desc: 'Salaries computed from attendance and arrears on the run date, in one pass.' },
  { id: '03', title: 'Deductions applied', desc: 'PF, ESI, TDS and professional tax calculated per employee from the same structure.' },
  { id: '04', title: 'Payslips and challan data', desc: 'Slips generated for employees; PF ECR and ESI, TDS and PT challan figures prepared from the run totals.' },
  { id: '05', title: 'Returns assembled', desc: 'Monthly and quarterly filing figures assembled from what was already computed, not re-keyed.' },
];

export default function PayrollPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />

      <main id="main-content">
        <header className="pt-space-128 pb-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="max-w-4xl">
              <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold mb-6">
                Payroll
              </p>
              <h1 className="font-display text-hero text-dark leading-tight tracking-tight text-balance mb-8">
                One payroll run, every statutory figure.
              </h1>
              <p className="font-ui text-ui-lg text-mid leading-relaxed max-w-xl mb-10">
                PF, ESI, TDS and professional tax computed from salary structures, with challans and returns prepared after each run.
              </p>
              <MarketingButton href="/signup">
                Start Free <span aria-hidden="true">→</span>
              </MarketingButton>
            </div>
          </div>
        </header>

        <section className="py-space-128 bg-section-muted border-y-[0.5px] border-border-subtle">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <Reveal className="lg:col-span-5">
              <SectionHeader
                title="The four deductions, spelled out"
                lede="Rates and ceilings follow the current statutory schedule, kept current in the codebase as notifications are published."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 lg:col-span-7">
              {statutory.map((item) => (
                <Reveal as="li" key={item.id}>
                  <div className="py-6 border-b-[0.5px] border-border-subtle first:pt-0 last:border-b-0 hover:bg-section-muted/50 transition-colors">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-ui-2xs text-amber">{item.id}</span>
                      <h2 className="font-display text-display-lg text-dark leading-snug tracking-tight">
                        {item.title}
                      </h2>
                    </div>
                    <p className="font-ui text-ui-md text-mid leading-relaxed max-w-[52ch]">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <Reveal>
              <SectionHeader
                title="How a payroll run works"
                lede="Five steps, from structure to the filing documents. No payslip is typed by hand."
              />
            </Reveal>
            <ol className="list-none p-0 m-0 mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {steps.map((step) => (
                <Reveal as="li" key={step.id}>
                  <div className="py-6 border-b-[0.5px] border-border-subtle hover:bg-section-muted/50 transition-colors">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-ui-2xs text-amber">{step.id}</span>
                      <h2 className="font-ui text-ui-sm font-semibold text-dark">{step.title}</h2>
                    </div>
                    <p className="font-ui text-ui-sm text-mid leading-relaxed max-w-[48ch]">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <CtaBand
          title="Payroll, without the lookup tables."
          lede="Start free, define one salary structure, and run the month."
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
