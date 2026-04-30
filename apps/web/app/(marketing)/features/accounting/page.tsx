'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function AccountingPage() {
  return (
    <div className="bg-page-bg text-on-surface antialiased min-h-screen">
      <MarketingNav />
      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-8 pt-16 pb-space-64">
          <div className="max-w-4xl text-left">
            <div className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest mb-6 font-bold">General Ledger Engine</div>
            <h1 className="font-marketing-hero text-marketing-hero text-on-surface mb-8">
              Double-entry accounting that enforces what your CA has always asked for.
            </h1>
            <p className="font-ui-lg text-ui-lg text-text-mid max-w-2xl mb-10 leading-relaxed">
              From journal entry to balance sheet — every rupee is validated at the point of entry. Not at month end.
            </p>
            <div className="flex gap-6">
              <Link href="/signup" className="bg-primary-container text-white px-8 py-4 font-ui-sm text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all no-underline rounded-sm shadow-sm">
                Start Building <span className="inline-block ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Balance Constraint Demo */}
        <section className="max-w-[1200px] mx-auto px-8 py-space-64">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-48 items-center">
            <div className="text-left order-2 lg:order-1">
              <span className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest font-bold">The Balance Constraint</span>
              <h2 className="font-display-xl text-display-xl text-on-surface mt-4 mb-6">Entries must balance before they post.</h2>
              <p className="font-ui-md text-ui-md text-text-mid leading-relaxed">Unlike spreadsheets, ComplianceOS prevents unbalanced journal entries at the UI level. You cannot post until debits equal credits — no exceptions, no manual checks.</p>
            </div>
            <div className="order-1 lg:order-2 bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
              <div className="flex items-center justify-center gap-8 mb-4">
                <div><div className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold mb-1">Total Debit</div><div className="font-mono text-lg font-bold text-on-surface">₹ 25,000.00</div></div>
                <div><div className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold mb-1">Total Credit</div><div className="font-mono text-lg font-bold text-on-surface">₹ 25,000.00</div></div>
                <div><div className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold mb-1">Difference</div><div className="font-mono text-lg text-green-700 font-bold">✓ ₹ 0.00</div></div>
              </div>
              <div className="bg-green-50 text-green-700 text-center py-2 font-ui-xs text-[10px] uppercase font-bold tracking-widest">Voucher is balanced — Ready to Post</div>
            </div>
          </div>
        </section>

        {/* Key Feature Modules */}
        <section className="bg-section-muted py-space-64">
          <div className="max-w-[1200px] mx-auto px-8 text-left">
            <h2 className="font-display-xl text-display-xl text-on-surface mb-16 text-center">Three pillars of ledger-first accounting.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "account_tree", title: "Chart of Accounts", desc: "4-level hierarchical structure with Dr/Cr labels. Indian account codes pre-configured for Schedule III compliance." },
                { icon: "receipt_long", title: "Journal Entry Engine", desc: "Auto-generated entry numbers, fiscal year sequencing, and arrow-key navigation for high-speed data entry." },
                { icon: "analytics", title: "Financial Reports", desc: "Schedule III P&L and Balance Sheet. Typeset for print, not for a software screenshot." },
              ].map((m) => (
                <div key={m.title} className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm border-t-2 border-t-primary-container text-left">
                  <Icon name={m.icon} className="text-primary-container text-3xl mb-6 block" />
                  <h3 className="font-display-lg text-lg font-bold text-on-surface mb-4">{m.title}</h3>
                  <p className="font-ui-sm text-sm text-text-mid leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-space-96 px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-marketing-xl text-marketing-xl text-on-surface mb-6">Start with the accounting module.</h2>
            <p className="font-ui-md text-ui-md text-text-mid mb-10">No modules to configure. No onboarding calls. The ledger is ready.</p>
            <Link href="/signup" className="bg-primary-container text-white px-10 py-5 font-ui-sm text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all no-underline rounded-sm shadow-sm inline-flex items-center gap-2">
              Get started <span className="inline-block">→</span>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
