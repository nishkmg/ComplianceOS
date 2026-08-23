"use client";

import { useState } from "react";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

function PlanBadge() {
  const utils = api.useUtils();
  const { data } = api.tenantConfig.get.useQuery();
  const plan = data?.plan ?? "free";
  const label = plan === "pro" ? "Pro" : plan === "business" ? "Business" : "Free";
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const startCheckout = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", period: "annual" }),
      });
      if (res.status === 501) {
        setNotice({ kind: "err", msg: "Online payments are not configured yet. Write to hello@arthvahi.in to upgrade." });
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setNotice({ kind: "err", msg: j.error ?? "Could not start checkout." });
        return;
      }
      const order = await res.json();
      // Load Razorpay checkout.js on demand.
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.head.appendChild(script);
      });
      await new Promise<void>((resolve) => {
        const rzp = new (window as any).Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Arthvahi",
          description: `Arthvahi ${order.plan} plan (${order.period})`,
          order_id: order.orderId,
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              const verifyRes = await fetch("/api/billing/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  plan: order.plan,
                  period: order.period,
                }),
              });
              if (!verifyRes.ok) throw new Error();
              setNotice({ kind: "ok", msg: "Upgraded — your plan is now active." });
              void utils.tenantConfig.get.invalidate();
            } catch {
              setNotice({ kind: "err", msg: "Payment succeeded but confirmation failed. Write to hello@arthvahi.in." });
            }
            resolve();
          },
          modal: { ondismiss: () => resolve() },
        });
        rzp.open();
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-sm border border-border-subtle bg-surface p-5">
      <div>
        <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold mb-1">Plan</p>
        <p className="font-ui text-ui-lg font-semibold text-dark">{label}</p>
        <p className="font-ui text-ui-sm text-mid mt-1">
          {plan === "free"
            ? "25 invoices per month · GSTR-1 + 3B · 1 user"
            : plan === "pro"
              ? "Unlimited invoicing · 5 users · GSTR-1, 2B and 3B"
              : "Everything in Pro · MCA-aligned audit trail · Priority support"}
        </p>
        {notice && (
          <p role={notice.kind === "ok" ? "status" : "alert"} className={`mt-2 font-ui text-ui-sm ${notice.kind === "ok" ? "text-success-deep" : "text-danger"}`}>
            {notice.msg}
          </p>
        )}
      </div>
      {plan === "free" && (
        <button
          onClick={startCheckout}
          disabled={busy}
          className="inline-flex h-9 items-center rounded-sm bg-amber px-4 text-sm font-medium text-white dark:text-amber-ink hover:bg-amber-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          Upgrade to Pro
        </button>
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
