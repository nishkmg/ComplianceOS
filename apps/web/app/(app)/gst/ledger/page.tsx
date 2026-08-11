"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const sections = [
  { href: "/gst/ledger/cash", label: "Cash Ledger", desc: "View GST challan payments and cash balance", icon: "account_balance" },
  { href: "/gst/ledger/itc", label: "ITC Ledger", desc: "Input Tax Credit register and utilisation", icon: "assignment" },
  { href: "/gst/ledger/liability", label: "Liability Ledger", desc: "Output GST liability and set-off", icon: "receipt" },
];

export default function GstLedgerPage() {
  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">GST Ledgers</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map(s => (
          <Link key={s.href} href={s.href} className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
            <Icon name={s.icon} className="text-3xl text-amber mb-4" />
            <h3 className="font-ui text-lg font-bold text-dark mb-2">{s.label}</h3>
            <p className="font-ui text-ui-sm text-mid">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
