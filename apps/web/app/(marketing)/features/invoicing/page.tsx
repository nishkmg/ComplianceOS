'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { formatIndianNumber } from '@/lib/format';

export default function InvoicingPage() {
  return (
    <div className="bg-page-bg text-dark antialiased min-h-screen">
      <MarketingNav />
      <main className="pt-32 pb-24">
        {/* Hero */}
        <header className="pt-space-128 pb-space-96 px-8 max-w-[1320px] mx-auto overflow-hidden">
          <div className="max-w-[800px] text-left">
            <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-6 block font-bold">Automated Invoicing</span>
            <h1 className="font-marketing-hero text-marketing-hero text-dark mb-8 leading-tight">
              Invoices that post to your books automatically. <span className="italic text-amber">No double entry.</span>
            </h1>
            <p className="font-ui text-ui-lg text-secondary max-w-[600px] mb-12 leading-relaxed">Every invoice created is instantly reconciled against your GST ledger and bank statements. Precision at the point of transaction.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="bg-amber text-white px-8 py-4 font-ui font-bold group flex items-center no-underline rounded-sm shadow-sm uppercase tracking-widest text-sm">
                Get Started <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
          {/* Flow Diagram */}
          <div className="mt-space-96 relative p-12 bg-white border border-border-subtle shadow-sm text-center">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-6 relative z-10">
              {[
                { icon: "description", title: "Invoice Created", desc: "GST, HSN & PAN verified" },
                { icon: "sync", title: "JE Auto-generated", desc: "Double-entry posted" },
                { icon: "account_balance_wallet", title: "Receivables Updated", desc: "Customer ledger live" },
                { icon: "gavel", title: "GST Liability Updated", desc: "GSTR-1 ready" },
              ].map((s, i) => (
                <div key={s.title} className="text-center p-6 border border-dashed border-border-subtle bg-page-bg rounded-sm">
                  <Icon name={s.icon} className="text-4xl text-amber mb-3 block" />
                  <h3 className="font-ui font-bold text-dark mb-1">{s.title}</h3>
                  <p className="font-ui text-xs text-secondary">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Invoice Preview */}
        <section className="py-space-128 bg-section-muted">
          <div className="max-w-[1320px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-4 block font-bold">Precision Compliance</span>
              <h2 className="font-display text-marketing-xl text-dark mb-6">Built for the Indian Fiscal Code</h2>
              <p className="font-ui text-ui-md text-secondary mb-8 leading-relaxed">ComplianceOS understands local complexities. From Rule 46 requirements to automatic CGST/SGST/IGST splitting based on place of supply.</p>
              <ul className="space-y-4">
                {[
                  { title: "E-Invoicing Ready", desc: "One-click IRN and QR code generation for GST compliance." },
                  { title: "HSN/SAC Validation", desc: "Built-in HSN code validation ensures correct tax rates." },
                  { title: "Invoice Sequencing", desc: "Gapless invoice numbering enforced per fiscal year." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <Icon name="check_circle" className="text-amber" />
                    <div>
                      <p className="font-ui font-bold text-dark">{item.title}</p>
                      <p className="font-ui text-xs text-secondary">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-border-subtle p-8 shadow-sm rounded-sm">
              <div className="border-b border-border-subtle pb-4 mb-4 flex justify-between">
                <div>
                  <div className="font-display text-lg font-bold mb-1">Mehta Textiles</div>
                  <div className="font-ui text-xs text-light">GSTIN: 27AABCU1234D1Z5</div>
                </div>
                <div className="text-right">
                  <div className="font-ui text-xs text-light font-bold uppercase tracking-wider">Invoice #</div>
                  <div className="font-mono text-sm">INV-2026-001</div>
                </div>
              </div>
              <table className="w-full font-mono text-sm">
                <thead><tr className="text-light border-b border-border-subtle"><th className="text-left pb-2 font-bold text-[10px] uppercase tracking-widest font-ui">Item</th><th className="text-right pb-2 font-ui text-[10px] uppercase font-bold">HSN</th><th className="text-right pb-2 font-ui text-[10px] uppercase font-bold">Amount</th></tr></thead>
                <tbody>
                  <tr className="border-b border-border-subtle"><td className="py-3">Cotton fabric premium</td><td className="text-right text-secondary">5208</td><td className="text-right font-bold">₹26,250</td></tr>
                  <tr><td className="py-3">Silk thread bulk</td><td className="text-right text-secondary">5007</td><td className="text-right font-bold">₹10,080</td></tr>
                </tbody>
              </table>
              <div className="text-right mt-4 pt-4 border-t border-border-subtle">
                <div className="font-ui text-xs text-light mb-1">CGST: ₹900 · SGST: ₹900</div>
                <div className="font-mono text-lg text-amber font-bold">₹37,230</div>
              </div>
            </div>
          </div>
        </section>

        {/* OCR Section */}
        <section className="py-space-128">
          <div className="max-w-[1320px] mx-auto px-8">
            <div className="text-center max-w-[700px] mx-auto mb-16">
              <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-amber mb-4 block font-bold">Input Intelligence</span>
              <h2 className="font-display text-marketing-xl text-dark mb-6">Snap a vendor bill, we do the rest</h2>
              <p className="font-ui text-ui-md text-secondary leading-relaxed">Our proprietary OCR engine is trained on Indian invoice formats. It extracts PAN, GSTIN, and line items with high accuracy, mapping them to your expense accounts automatically.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-space-96 px-8 text-center bg-section-amber">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-marketing-xl text-dark mb-6">Start invoicing the right way.</h2>
            <p className="font-ui text-ui-md text-secondary mb-10">GST-compliant, automatically posted, and ready to send in one click.</p>
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
