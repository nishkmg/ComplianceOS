
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function PayrollPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />
      <main className="pt-32 pb-24">
        {/* Hero */}
        <header className="pt-space-128 pb-space-96 px-8 max-w-[1200px] mx-auto text-center">
          <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-6 block font-bold">PAYROLL & COMPLIANCE</span>
          <h1 className="font-marketing-hero text-marketing-hero text-dark max-w-4xl mx-auto mb-8">
            Payroll that knows PF from PT, and both from TDS.
          </h1>
          <p className="font-ui text-ui-lg text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            Automate India's complex statutory landscape. From automated tax slabs to state-specific Professional Tax, we handle the math so you can focus on the mission.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="bg-amber text-white px-10 py-4 font-ui tracking-wider no-underline rounded-sm shadow-sm font-bold uppercase tracking-widest text-sm inline-flex items-center gap-2">
              Schedule a Demo <span>→</span>
            </Link>
          </div>
        </header>

        {/* Salary Structure */}
        <section className="py-space-96 px-8 bg-section-muted">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 text-left">
              <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-6 block font-bold">Salary Structure</span>
              <h2 className="font-display text-marketing-xl text-dark mb-6">Auto-calculated statutory components.</h2>
              <p className="font-ui text-ui-md text-secondary leading-relaxed mb-8">PF at 12% of basic. ESI at 0.75% for eligible employees. Professional Tax auto-set by state. TDS projection updated every month based on current deductions. No manual lookups.</p>
              <ul className="space-y-4">
                {[
                  "PF 12% of basic — auto-calculated",
                  "ESI 0.75% for employees under ₹21,000",
                  "Professional Tax by state — auto-set",
                  "TDS projection updated monthly",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Icon name="check_circle" className="text-amber" />
                    <span className="font-ui text-sm text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7 bg-white border border-border-subtle p-8 shadow-sm">
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between py-2 border-b border-stone-50">
                  <span className="font-ui text-secondary">Basic Salary</span>
                  <span className="font-bold">₹45,000.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-50">
                  <span className="font-ui text-secondary">HRA</span>
                  <span className="font-bold">₹18,000.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-50">
                  <span className="font-ui text-secondary">Conveyance Allowance</span>
                  <span className="font-bold">₹5,000.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-50">
                  <span className="font-ui text-secondary">Special Allowance</span>
                  <span className="font-bold">₹12,000.00</span>
                </div>
                <div className="flex justify-between border-b border-stone-50 py-4 text-danger">
                  <span className="font-ui font-bold">PF Deduction</span>
                  <span className="font-bold">-₹1,800.00</span>
                </div>
                <div className="flex justify-between py-4 bg-section-dark text-white px-6 -mx-6 mt-4">
                  <span className="font-ui font-bold uppercase tracking-widest text-xs">Gross Monthly CTC</span>
                  <span className="font-bold">₹77,000.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payslip */}
        <section className="py-space-128 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-4 block font-bold">Employee Experience</span>
              <h2 className="font-display text-marketing-xl text-dark mb-4">A payslip that speaks human.</h2>
              <p className="font-ui text-ui-md text-secondary max-w-2xl mx-auto leading-relaxed">Reduce payroll queries by 60% with detailed tax breakups and investment declarations baked right into the slip.</p>
            </div>
            <div className="bg-white border border-border-subtle p-12 max-w-4xl mx-auto shadow-sm">
              <div className="flex justify-between items-start pb-8 mb-8 border-b border-border-subtle">
                <div>
                  <span className="font-display text-lg font-bold block">ComplianceOS</span>
                  <p className="text-xs text-light mt-1">Salary Slip — September 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-ui font-bold">Rahul Sharma</p>
                  <p className="text-xs text-light">EMP-2024-001 · Compliance</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-ui text-[10px] uppercase text-light font-bold mb-4">Earnings</p>
                  <div className="space-y-3">
                    {[{ label: "Basic", val: "45,000" }, { label: "HRA", val: "18,000" }, { label: "Conveyance", val: "5,000" }, { label: "Special Allowance", val: "12,000" }].map(e => (
                      <div key={e.label} className="flex justify-between text-sm">
                        <span className="text-secondary">{e.label}</span>
                        <span className="font-mono">₹{e.val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-sm pt-4 border-t border-border-subtle">
                      <span className="uppercase text-[10px] font-ui tracking-widest">Gross Pay</span>
                      <span className="font-mono">₹80,000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-ui text-[10px] uppercase text-light font-bold mb-4">Deductions</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Provident Fund</span>
                      <span className="font-mono text-danger">-₹1,800</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Professional Tax</span>
                      <span className="font-mono text-danger">-₹200</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">TDS</span>
                      <span className="font-mono text-danger">-₹4,500</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-4 border-t border-border-subtle">
                      <span className="uppercase text-[10px] font-ui tracking-widest">Net Pay</span>
                      <span className="font-mono text-success">₹73,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-space-96 px-8 text-center bg-section-amber">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-marketing-xl text-dark mb-6">Stop computing payroll manually.</h2>
            <p className="font-ui text-ui-md text-secondary mb-10">Auto-calculated PF, ESI, PT, and TDS for every employee, every month.</p>
            <Link href="/signup" className="bg-amber text-white px-10 py-5 font-ui font-bold uppercase tracking-widest hover:bg-amber-hover transition-all no-underline rounded-sm shadow-sm inline-flex items-center gap-2">
              Start Free <span>→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
