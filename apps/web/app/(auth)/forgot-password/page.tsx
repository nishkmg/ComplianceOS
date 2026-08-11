"use client";

import { useState } from "react";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { apiPost } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      showToast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await apiPost("/api/auth/request-reset", { email });
      setSent(true);
      if (res?.link) {
        navigator.clipboard?.writeText(res.link).catch(() => {});
      }
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-surface-muted min-h-screen flex items-center justify-center p-6">
        <main className="w-full max-w-[440px]">
          <div className="bg-surface border border-border rounded-xl px-8 py-12 shadow-md">
            <h1 className="font-display text-2xl font-semibold text-dark mb-4">Check your email</h1>
            <p className="text-ui-sm text-secondary font-ui mb-6">
              If an account exists for {email}, a reset link is on its way. The link was also copied to
              your clipboard as a fallback — paste it in a new tab if the email doesn't arrive.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-amber px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-amber-hover transition-colors"
            >
              Back to sign in →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface-muted min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-[440px]">
        <div className="bg-surface border border-border rounded-xl px-8 py-12 shadow-md">
          <h1 className="font-display text-2xl font-semibold text-dark mb-4">Forgot your password?</h1>
          <p className="text-ui-sm text-secondary font-ui mb-6">
            Enter the email you use for Arthvahi and we'll send you a reset link.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fp-email" className="mb-1.5 block text-ui-xs font-medium text-dark font-ui">
                Email address
              </label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-amber px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-hover transition-colors disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className="mt-6 text-center text-ui-sm font-ui">
            <Link href="/login" className="text-amber font-bold uppercase text-ui-2xs tracking-widest no-underline">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
