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
    <div className="bg-page-bg text-on-surface min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <main className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mb-2">ComplianceOS</h1>
          <p className="font-ui-md text-ui-md text-text-mid">Establish your firm's foundational ledger.</p>
        </div>

        {/* Centered Card */}
        <div className="bg-white border-[0.5px] border-border-subtle border-t-[2px] border-t-primary-container p-8 shadow-sm">
          {/* Progress Hint */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b-[0.5px] border-border-subtle">
            <span className="font-mono-md text-mono-md text-text-mid tracking-widest uppercase">Step 1 of 7</span>
            <span className="font-ui-xs text-ui-xs text-amber-text">Entity Setup</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" method="POST">
            {/* Business Name Field */}
            <div className="text-left">
              <label className="block font-ui-sm text-ui-sm text-on-surface mb-2" htmlFor="business_name">Registered Business Name</label>
              <input 
                className="block w-full border-[0.5px] border-border-subtle bg-transparent px-3 py-2 font-mono text-[14px] text-on-surface placeholder:text-text-light focus:border-primary focus:ring-0 focus:outline-none transition-colors" 
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
              <label className="block font-ui-sm text-ui-sm text-on-surface mb-2" htmlFor="email">Primary Contact Email</label>
              <input 
                className="block w-full border-[0.5px] border-border-subtle bg-transparent px-3 py-2 font-mono text-[14px] text-on-surface placeholder:text-text-light focus:border-primary focus:ring-0 focus:outline-none transition-colors" 
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
              <label className="block font-ui-sm text-ui-sm text-on-surface mb-2" htmlFor="password">Secure Password</label>
              <div className="relative">
                <input 
                  className="block w-full border-[0.5px] border-border-subtle bg-transparent px-3 py-2 font-mono text-[14px] text-on-surface placeholder:text-text-light focus:border-primary focus:ring-0 focus:outline-none transition-colors" 
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
              <div className="mt-2 flex gap-1 h-1 w-full">
                <div className="w-1/3 bg-primary-container h-full"></div>
                <div className="w-1/3 bg-border-subtle h-full"></div>
                <div className="w-1/3 bg-border-subtle h-full"></div>
              </div>
              <p className="mt-1 font-ui-xs text-ui-xs text-text-light text-right">Weak</p>
            </div>

            {error && (
              <p className="text-red-600 text-[12px] text-center" role="alert">{error}</p>
            )}

            {/* Action Button */}
            <div className="pt-4">
              <button className="group w-full flex items-center justify-center gap-2 bg-primary-container border-[0.5px] border-primary-container px-6 py-3 font-ui-sm text-ui-sm text-white hover:bg-[#825500] hover:border-[#825500] transition-all duration-300 cursor-pointer" type="submit">
                Continue to Firm Details
                <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>

        {/* Meta Links */}
        <div className="mt-8 text-center">
          <p className="font-ui-sm text-ui-sm text-text-mid">
            Already maintaining a ledger? 
            <Link className="text-primary hover:text-[#825500] underline decoration-primary-container/30 decoration-2 underline-offset-4 transition-colors ml-1" href="/login">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
