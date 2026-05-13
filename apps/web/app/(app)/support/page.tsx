"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  toast: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const faqData: FaqItem[] = [
  { q: "How do I close a fiscal year?", a: "Navigate to Settings > Fiscal Years, select the open FY, and click 'Close FY'. Ensure all journal entries are posted and GST reconciliation is complete before closure. Closed years are locked and cannot be modified." },
  { q: "How to reconcile GST returns?", a: "Go to GST > Reconciliation. Select the period and upload your GSTR-2B data. The system will auto-match purchase invoices. Manually resolve mismatches flagged in the reconciliation report before filing." },
  { q: "Setting up TDS for employees?", a: "Under Payroll > Process Payroll, configure statutory deductions. Ensure each employee has a valid PAN. TDS is calculated automatically based on applicable income tax slabs and Section 87A rebate if eligible." },
  { q: "Invoice numbering not sequential?", a: "Check Settings > Invoices for your prefix and starting number. The system auto-increments per FY. If numbers are skipped (voided invoices), they remain as gaps — this is compliant with Indian accounting standards." },
  { q: "How to add a new employee?", a: "Navigate to Employees > Add New Employee. Fill in the statutory register form including PAN, UAN, and bank details. Once created, you can assign a salary structure under the employee's profile." },
  { q: "Data retention policy?", a: "ComplianceOS retains all ledger data for 8 years as per IT Act, 2000. Archived fiscal years are read-only. You can export any period as CSV or PDF from the reports section at any time." },
];

const quickActions: QuickAction[] = [
  { label: "Contact Support", description: "Email or call our help desk", icon: "contact_support", toast: "Opening support ticket form." },
  { label: "Documentation", description: "User guides & API reference", icon: "menu_book", toast: "Opening knowledge base." },
  { label: "System Status", description: "All services operational", icon: "check_circle", toast: "All systems healthy." },
  { label: "Report a Bug", description: "Submit an issue to engineering", icon: "bug_report", toast: "Bug report form opened." },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function SupportPage() {
  const { activeFy } = useFiscalYear();
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredFaq = faqData.filter(
    (item) =>
      !search ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Help Center · FY {activeFy}</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Support Hub</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">Documentation, FAQs, and ways to get help.</p>
        </div>
      </header>

      {/* Search */}
      <div className="relative max-w-xl">
        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-light text-lg" />
        <input
          className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-md font-ui text-[13px] outline-none focus:border-primary"
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => showToast.success(action.toast)}
            className="bg-surface border border-border p-6 hover:shadow-md transition-shadow text-left cursor-pointer group"
          >
            <Icon name={action.icon} className="text-amber text-2xl mb-3" />
            <h3 className="font-ui text-[13px] font-bold text-dark mb-1">{action.label}</h3>
            <p className="font-ui text-[11px] text-mid">{action.description}</p>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <section>
        <h2 className="font-display text-xl font-semibold text-dark mb-4">Frequently Asked Questions</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-surface-muted border border-border rounded-md animate-pulse" />
            ))}
          </div>
        ) : filteredFaq.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="search_off" className="text-4xl text-light mx-auto mb-3" />
            <p className="font-ui text-sm text-mid">No FAQs match &ldquo;{search}&rdquo;.</p>
            <button
              onClick={() => setSearch("")}
              className="font-ui text-[11px] text-primary uppercase tracking-widest font-bold hover:underline mt-2 border-none bg-transparent cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="divide-y-[0.5px] divide-border-subtle border border-border bg-surface rounded-md overflow-hidden">
            {filteredFaq.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-surface-muted/50 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span className="font-ui text-[13px] font-bold text-dark pr-4">{item.q}</span>
                  <Icon
                    name={openFaq === i ? "expand_less" : "expand_more"}
                    className="text-light shrink-0"
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="font-ui text-[13px] text-mid leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="bg-surface border border-border p-8 rounded-md">
        <h2 className="font-display text-xl font-semibold text-dark mb-6">Get in Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <Icon name="mail" className="text-amber text-2xl mt-0.5" />
            <div>
              <p className="font-ui text-[13px] font-bold text-dark">Email</p>
              <a href="mailto:support@complianceos.test" className="font-ui text-[13px] text-primary hover:underline no-underline">support@complianceos.test</a>
              <p className="font-ui text-[11px] text-light mt-1">Response within 4 hours</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Icon name="phone" className="text-amber text-2xl mt-0.5" />
            <div>
              <p className="font-ui text-[13px] font-bold text-dark">Phone</p>
              <p className="font-ui text-[13px] text-dark">+91 22 6128 4000</p>
              <p className="font-ui text-[11px] text-light mt-1">Mon–Sat, 9 AM – 6 PM IST</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Icon name="chat" className="text-amber text-2xl mt-0.5" />
            <div>
              <p className="font-ui text-[13px] font-bold text-dark">Live Chat</p>
              <p className="font-ui text-[13px] text-success font-bold uppercase">Available</p>
              <p className="font-ui text-[11px] text-light mt-1">Average wait: 2 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="bg-surface border border-border p-8 rounded-md">
        <h2 className="font-display text-xl font-semibold text-dark mb-6">Knowledge Base</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "User Guide", icon: "menu_book", desc: "Getting started & workflows" },
            { label: "API Documentation", icon: "code", desc: "REST & webhook reference" },
            { label: "Release Notes", icon: "history", desc: "Changelog & migrations" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => showToast.success(`Opening ${item.label}...`)}
              className="flex items-center gap-4 p-4 border border-border rounded-md hover:bg-surface-muted/50 transition-colors text-left cursor-pointer bg-transparent"
            >
              <Icon name={item.icon} className="text-amber text-xl shrink-0" />
              <div className="flex-1">
                <p className="font-ui text-[13px] font-bold text-dark">{item.label}</p>
                <p className="font-ui text-[11px] text-mid">{item.desc}</p>
              </div>
              <Icon name="open_in_new" className="text-light text-sm shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
