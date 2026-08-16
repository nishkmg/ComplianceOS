"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

function PlanBadge() {
  const { data } = api.tenantConfig.get.useQuery();
  const plan = data?.plan ?? "free";
  const label = plan === "pro" ? "Pro" : plan === "business" ? "Business" : "Free";
  return (
    <div className="flex items-center justify-between rounded-sm border border-border-subtle bg-surface p-5">
      <div>
        <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold mb-1">Plan</p>
        <p className="font-ui text-ui-lg font-semibold text-dark">{label}</p>
        <p className="font-ui text-ui-sm text-mid mt-1">
          {plan === "free" ? "25 invoices per month · GSTR-1 + 3B" : plan === "pro" ? "Unlimited invoicing · 5 users · GSTR automations" : "Everything in Pro · TDS/TCS · API · MCA audit trail"}
        </p>
      </div>
      {plan === "free" && (
        <Link href="/pricing" className="inline-flex h-9 items-center rounded-sm bg-amber px-4 text-sm font-medium text-white dark:text-amber-ink hover:bg-amber-hover no-underline">
          Upgrade
        </Link>
      )}
    </div>
  );
}

const cards = [
  {
    href: "/settings/company",
    icon: "account_balance" as const,
    title: "Company Profile",
    desc: "GSTIN, state, PAN, bank details — the identity used on invoices, returns and challans.",
  },
  {
    href: "/settings/users",
    icon: "group" as const,
    title: "Team & Users",
    desc: "Invite teammates, assign roles (owner, accountant, manager, employee), remove access.",
  },
  {
    href: "/settings/fiscal-years",
    icon: "calendar_month" as const,
    title: "Fiscal Years",
    desc: "Open and close accounting periods. Closed periods are locked for statutory integrity.",
  },
  {
    href: "/settings/invoices",
    icon: "receipt_long" as const,
    title: "Invoice Preferences",
    desc: "Numbering, GST treatment and invoice defaults for your sales documents.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-10 text-left">
      <header className="mb-8">
        <PageHeader
          eyebrow="Settings"
          title="Workspace Settings"
          description="Company identity, access control and ledger configuration for your organization."
        />
      </header>

      <div className="mb-8">
        <PlanBadge />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-surface border border-border rounded-md overflow-hidden shadow-sm relative hover:border-amber/40 transition-colors no-underline"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
            <div className="p-6 flex gap-4 items-start">
              <div className="h-11 w-11 shrink-0 rounded-md bg-amber-soft border border-amber/30 flex items-center justify-center text-amber">
                <Icon name={card.icon} size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-ui text-base font-bold text-dark group-hover:text-amber transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1 font-ui text-ui-sm text-mid leading-relaxed">{card.desc}</p>
                <span className="mt-3 inline-block text-amber font-bold uppercase text-ui-2xs tracking-widest">
                  Open <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
