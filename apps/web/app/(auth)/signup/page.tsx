"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      router.push("/login");
    } else {
      setError("Registration failed");
    }
  }

  return (
    <div className="bg-surface-muted text-dark min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased selection:bg-amber selection:text-white">
      <main className="w-full max-w-md">
        {/* Brand Header */}
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-dark">ComplianceOS</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">Establish your firm's foundational ledger.</p>
        </header>

        {/* Centered Card */}
        <div className="bg-surface border border-border border-t-[3px] border-t-amber p-8 shadow-md rounded-xl">
          {/* Progress Hint */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b-[1px] border-border">
            <span className="font-mono text-mono-md text-secondary tracking-widest uppercase">Step 1 of 7</span>
            <span className="font-ui text-ui-xs text-amber font-medium">Entity Setup</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" method="POST">
            {/* Business Name Field */}
            <div className="text-left">
              <label className="block font-ui text-ui-sm text-dark mb-2 font-medium" htmlFor="business_name">Registered Business Name</label>
              <input 
                className="block w-full border border-border bg-surface rounded-md shadow-sm px-3 py-2 font-mono text-[14px] text-dark placeholder:text-light focus:border-amber focus:ring-1 focus:ring-amber focus:outline-none transition-colors" 
                id="business_name" 
                name="business_name" 
                placeholder="As per MCA/GST records" 
                required 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Field */}
            <div className="text-left">
              <label className="block font-ui text-ui-sm text-dark mb-2 font-medium" htmlFor="email">Primary Contact Email</label>
              <input 
                className="block w-full border border-border bg-surface rounded-md shadow-sm px-3 py-2 font-mono text-[14px] text-dark placeholder:text-light focus:border-amber focus:ring-1 focus:ring-amber focus:outline-none transition-colors" 
                id="email" 
                name="email" 
                placeholder="admin@yourfirm.in" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="text-left">
              <label className="block font-ui text-ui-sm text-dark mb-2 font-medium" htmlFor="password">Secure Password</label>
              <div className="relative">
                <input 
                  className="block w-full border border-border bg-surface rounded-md shadow-sm px-3 py-2 font-mono text-[14px] text-dark placeholder:text-light focus:border-amber focus:ring-1 focus:ring-amber focus:outline-none transition-colors" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Password Strength Indicator */}
              <div className="mt-2 flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
                <div className="w-1/3 bg-amber h-full"></div>
                <div className="w-1/3 bg-border h-full"></div>
                <div className="w-1/3 bg-border h-full"></div>
              </div>
              <p className="mt-1 font-ui text-ui-xs text-light text-right">Weak</p>
            </div>

            {error && (
              <p className="text-danger text-[12px] text-center" role="alert">{error}</p>
            )}

            {/* Action Button */}
            <div className="pt-4">
              <button className="group w-full flex items-center justify-center gap-2 bg-amber rounded-md border-none px-6 py-3 font-ui font-medium text-[16px] text-white hover:bg-amber-hover hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 cursor-pointer shadow-sm" type="submit">
                Continue to Firm Details
                <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>

        {/* Meta Links */}
        <div className="mt-8 text-center">
          <p className="font-ui text-ui-sm text-secondary">
            Already maintaining a ledger? 
            <Link className="text-amber hover:text-amber-hover underline decoration-amber/30 decoration-2 underline-offset-4 transition-colors ml-1 font-medium" href="/login">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
