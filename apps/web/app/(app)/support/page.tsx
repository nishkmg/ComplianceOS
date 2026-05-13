"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { Modal } from '@/components/ui/modal';
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
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockUser = {
  name: "Rahul Sharma",
  email: "rahul@complianceos.test",
  accountId: "COMP-2024-001",
};

const modules = [
  "Journal",
  "Chart of Accounts",
  "Invoices",
  "Payments",
  "GST",
  "ITR",
  "Payroll",
  "Inventory",
  "Reports",
  "Other",
];

const faqData: FaqItem[] = [
  { q: "How do I close a fiscal year?", a: "Navigate to Settings > Fiscal Years, select the open FY, and click 'Close FY'. Ensure all journal entries are posted and GST reconciliation is complete before closure. Closed years are locked and cannot be modified." },
  { q: "How to reconcile GST returns?", a: "Go to GST > Reconciliation. Select the period and upload your GSTR-2B data. The system will auto-match purchase invoices. Manually resolve mismatches flagged in the reconciliation report before filing." },
  { q: "Setting up TDS for employees?", a: "Under Payroll > Process Payroll, configure statutory deductions. Ensure each employee has a valid PAN. TDS is calculated automatically based on applicable income tax slabs and Section 87A rebate if eligible." },
  { q: "Invoice numbering not sequential?", a: "Check Settings > Invoices for your prefix and starting number. The system auto-increments per FY. If numbers are skipped (voided invoices), they remain as gaps — this is compliant with Indian accounting standards." },
  { q: "How to add a new employee?", a: "Navigate to Employees > Add New Employee. Fill in the statutory register form including PAN, UAN, and bank details. Once created, you can assign a salary structure under the employee's profile." },
  { q: "Data retention policy?", a: "ComplianceOS retains all ledger data for 8 years as per IT Act, 2000. Archived fiscal years are read-only. You can export any period as CSV or PDF from the reports section at any time." },
];

const quickActions: QuickAction[] = [
  { label: "Contact Support", description: "Submit a query to our team", icon: "contact_support" },
  { label: "Documentation", description: "User guides & API reference", icon: "menu_book" },
  { label: "System Status", description: "All services operational", icon: "check_circle" },
  { label: "Report a Bug", description: "Submit an issue to engineering", icon: "bug_report" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function SupportPage() {
  const { activeFy } = useFiscalYear();
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [contactOpen, setContactOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);

  // Form states
  const [contactMsg, setContactMsg] = useState("");
  const [bugModule, setBugModule] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [sending, setSending] = useState(false);

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

  const resetContactForm = () => { setContactMsg(""); setSending(false); };
  const resetBugForm = () => { setBugModule(""); setBugDesc(""); setSending(false); };

  const handleSendMessage = () => {
    if (!contactMsg.trim()) { showToast.error("Please enter a message."); return; }
    setSending(true);
    setTimeout(() => {
      showToast.success("Message sent. We'll respond within 4 hours.");
      setContactOpen(false);
      resetContactForm();
    }, 600);
  };

  const handleSubmitBug = () => {
    if (!bugModule) { showToast.error("Please select a module."); return; }
    if (!bugDesc.trim()) { showToast.error("Please describe the bug."); return; }
    setSending(true);
    setTimeout(() => {
      showToast.success("Bug report submitted. Thank you.");
      setBugOpen(false);
      resetBugForm();
    }, 600);
  };

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
        {quickActions.map((action) => {
          const handleClick = () => {
            switch (action.label) {
              case "Contact Support":
                setContactOpen(true);
                break;
              case "Documentation":
                window.open("https://docs.complianceos.test", "_blank");
                break;
              case "System Status":
                showToast.success("All systems operational · 99.9% uptime · Last incident: 12 days ago");
                break;
              case "Report a Bug":
                setBugOpen(true);
                break;
            }
          };
          return (
            <button
              key={action.label}
              onClick={handleClick}
              className="bg-surface border border-border p-6 hover:shadow-md transition-shadow text-left cursor-pointer group"
            >
              <Icon name={action.icon} className="text-amber text-2xl mb-3" />
              <h3 className="font-ui text-[13px] font-bold text-dark mb-1">{action.label}</h3>
              <p className="font-ui text-[11px] text-mid">{action.description}</p>
            </button>
          );
        })}
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

      {/* ── Contact Support Modal ───────────────────────────────────────── */}
      <Modal open={contactOpen} onClose={() => { setContactOpen(false); resetContactForm(); }} title="Contact Support">
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Name</label>
            <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark outline-none" value={mockUser.name} readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Email</label>
            <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark outline-none" value={mockUser.email} readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Account ID</label>
            <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-2.5 font-mono text-[13px] text-dark outline-none" value={mockUser.accountId} readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Message <span className="text-danger">*</span></label>
            <textarea
              className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark outline-none resize-none"
              rows={4}
              placeholder="Describe your query..."
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setContactOpen(false); resetContactForm(); }} className="btn-secondary">Cancel</button>
            <button onClick={handleSendMessage} disabled={sending} className="btn-primary disabled:opacity-50">
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Report a Bug Modal ──────────────────────────────────────────── */}
      <Modal open={bugOpen} onClose={() => { setBugOpen(false); resetBugForm(); }} title="Report a Bug">
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Name</label>
            <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark outline-none" value={mockUser.name} readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Email</label>
            <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark outline-none" value={mockUser.email} readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Account ID</label>
            <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-2.5 font-mono text-[13px] text-dark outline-none" value={mockUser.accountId} readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Module <span className="text-danger">*</span></label>
            <select
              className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark outline-none"
              value={bugModule}
              onChange={(e) => setBugModule(e.target.value)}
            >
              <option value="">Select module...</option>
              {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Describe the Bug <span className="text-danger">*</span></label>
            <textarea
              className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark outline-none resize-none"
              rows={4}
              placeholder="What went wrong? Steps to reproduce..."
              value={bugDesc}
              onChange={(e) => setBugDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setBugOpen(false); resetBugForm(); }} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmitBug} disabled={sending} className="btn-primary disabled:opacity-50">
              {sending ? "Submitting..." : "Submit Bug"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
