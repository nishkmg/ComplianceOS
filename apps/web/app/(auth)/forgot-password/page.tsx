"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-surface-muted min-h-screen flex items-center justify-center p-6">
        <main className="w-full max-w-[440px]">
          <div className="bg-surface border border-border rounded-xl px-8 py-12 shadow-md">
            <h1 className="font-display text-2xl font-semibold text-dark mb-4">Check your email</h1>
            <p className="text-[13px] text-secondary font-ui mb-6">
              If an account exists for {email}, you&apos;ll receive password reset instructions shortly.
            </p>
            <Link href="/login" className="text-amber hover:text-amber-hover underline font-ui text-[13px]">
              Back to login
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
          <h1 className="font-display text-2xl font-semibold text-dark mb-2">Reset password</h1>
          <p className="text-[13px] text-secondary font-ui mb-8">Enter your email and we&apos;ll send you instructions.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="font-ui text-ui-xs text-dark uppercase tracking-widest font-medium" htmlFor="email">Email</label>
              <input
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-[14px] outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-amber text-white font-ui font-medium text-[16px] rounded-md py-4 px-6 border-none cursor-pointer hover:bg-amber-hover transition-colors">
              Send reset link
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-amber hover:text-amber-hover underline font-ui text-[13px]">Back to login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
