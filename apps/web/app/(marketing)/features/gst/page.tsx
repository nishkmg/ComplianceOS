
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function GSTFeaturePage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />
      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-8 pt-16 pb-space-64">
          <div className="max-w-4xl text-left">
            <div className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-6 block font-bold">GST Compliance Engine</div>
            <h1 className="font-marketing-hero text-marketing-hero text-dark mb-8">
              GSTR-1, GSTR-2B, GSTR-3B — generated from your own entries. Not re-entered.
            </h1>
            <p className="font-ui text-ui-lg text-secondary max-w-2xl mb-10 leading-relaxed">
              Stop manually reconciling spreadsheets. Our engine maps your daily accounting entries directly to Indian GST return formats, highlighting ITC mismatches before you file.
            </p>
            <div className="flex gap-6">
              <Link href="/signup" className="bg-amber text-white px-8 py-4 font-ui text-sm font-bold uppercase tracking-widest hover:bg-amber-hover transition-all no-underline rounded-sm shadow-sm">
                Start Free <span className="inline-block ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* KPI Stats */}
        <section className="max-w-[1200px] mx-auto px-8 mb-space-64">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "GSTR Returns", value: "3" },
              { label: "ITC Auto-Match Rate", value: "99.2%" },
              { label: "E-way Bills Generated", value: "1,200+" },
              { label: "Tax Saved (MTD)", value: "₹ 2.4L" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-border-subtle border-t-2 border-t-amber p-6 shadow-sm text-left">
                <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2 font-bold">{s.label}</p>
                <p className="font-mono text-2xl font-bold text-dark">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Zigzag Modules */}
        <section className="space-y-space-64 max-w-[1200px] mx-auto px-8 pb-space-64">
          {[
            { icon: "receipt", title: "Auto-Generated Returns", desc: "GSTR-1, 2B, and 3B are generated directly from your invoices and journal entries. No double data entry, no manual mapping, no transcription errors.", reversed: false },
            { icon: "difference", title: "ITC Reconciliation", desc: "Auto-match your purchase register with the GSTR-2B statement from the portal. Unmatched items are flagged instantly with drill-down to source documents.", reversed: true },
            { icon: "local_shipping", title: "E-Way Bill Integration", desc: "Generate e-way bills directly from your sales invoices without switching portals. One click. Pre-populated. GST-compliant.", reversed: false },
          ].map((m) => (
            <div key={m.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${m.reversed ? 'lg:direction-rtl' : ''}`}>
              <div className={`text-left ${m.reversed ? 'lg:order-2' : ''}`}>
                <h3 className="font-display text-marketing-xl text-dark mb-6">{m.title}</h3>
                <p className="font-ui text-ui-md text-secondary leading-relaxed">{m.desc}</p>
              </div>
              <div className={`bg-section-muted border border-border-subtle p-8 ${m.reversed ? 'lg:order-1' : ''}`}>
                <div className="aspect-[4/3] bg-white border border-border-subtle flex items-center justify-center">
                  <Icon name={m.icon} className="text-6xl text-light/30" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Feature Grid */}
        <section className="bg-section-muted py-space-64">
          <div className="max-w-[1200px] mx-auto px-8">
            <h2 className="font-display text-marketing-xl text-dark mb-16 text-center">Everything your GST module needs.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "checklist", title: "Matching Engine", desc: "Two-way reconciliation between your purchase ledger and GSTR-2A/2B auto-drafted statement." },
                { icon: "auto_fix_high", title: "Auto-filing Ready", desc: "Generate exact JSON payloads for the GST portal. No format conversions needed before upload." },
                { icon: "summarize", title: "3B with Drill-down", desc: "Every line in your GSTR-3B can be traced back to the source invoice or journal entry." },
              ].map((f) => (
                <div key={f.title} className="bg-white border border-border-subtle p-8 shadow-sm border-t-2 border-t-amber text-left">
                  <Icon name={f.icon} className="text-amber text-3xl mb-4 block" />
                  <h3 className="font-ui font-bold text-dark mb-3">{f.title}</h3>
                  <p className="font-ui text-sm text-secondary leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-space-96 px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-marketing-xl text-dark mb-6">Start generating compliant returns today.</h2>
            <p className="font-ui text-ui-md text-secondary mb-10">No GST data entry. No CSV exports. No portal re-entry.</p>
            <Link href="/signup" className="bg-amber text-white px-10 py-5 font-ui text-sm font-bold uppercase tracking-widest hover:bg-amber-hover transition-all no-underline rounded-sm shadow-sm inline-flex items-center gap-2">
              Start Free <span className="inline-block">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
