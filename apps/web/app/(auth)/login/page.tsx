"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="bg-surface-muted min-h-screen flex items-center justify-center p-6 selection:bg-amber selection:text-white">
      <main className="w-full max-w-[440px]">
        {/* Surface Card */}
        <div className="bg-surface border border-border rounded-xl px-8 py-12 md:px-10 md:py-14 shadow-md relative overflow-hidden">
          {/* Top Border Accent */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-amber"></div>
          
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-dark">ComplianceOS</h1>
            <p className="text-[13px] text-secondary font-ui mt-1">Secure access to your fiscal ledger.</p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input Group */}
            <div className="space-y-2 text-left">
              <label className="block font-ui text-ui-xs text-dark uppercase tracking-widest font-medium" htmlFor="email">Email Address</label>
              <input 
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-[14px] text-dark placeholder:text-light focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber shadow-sm transition-colors" 
                id="email" 
                name="email" 
                placeholder="accountant@firm.in" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input Group */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-end">
                <label className="block font-ui text-ui-xs text-dark uppercase tracking-widest font-medium" htmlFor="password">Password</label>
                <Link className="font-ui text-ui-xs text-amber hover:text-amber-hover transition-colors focus:outline-none focus:underline underline-offset-4 no-underline" href="/forgot-password">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-[14px] text-dark placeholder:text-light focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber shadow-sm transition-colors pr-10" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Password Toggle */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary hover:text-dark border-none bg-transparent cursor-pointer"
                >
                  <Icon name={showPassword ? 'visibility' : 'visibility_off'} className="text-[20px]" />
                </button>
              </div>
            </div>

            {error && (
              <p className="text-danger text-[12px] text-center" role="alert">{error}</p>
            )}

            {/* Submit Button */}
            <button className="w-full mt-4 bg-amber text-white font-ui font-medium text-[16px] rounded-md py-4 px-6 flex justify-center items-center group transition-all duration-300 hover:bg-amber-hover hover:shadow-md hover:-translate-y-[1px] cursor-pointer border-none shadow-sm" type="submit">
              Access Account
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300 ease-in-out font-mono text-[18px]">→</span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t-[0.5px] border-border-subtle text-center">
            <p className="font-ui text-ui-sm text-secondary">
              New to ComplianceOS? 
              <Link className="text-amber font-medium hover:text-amber-hover hover:underline underline-offset-4 transition-all ml-1 no-underline" href="/signup">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Minimal meta footer */}
        <div className="text-center mt-8">
          <p className="font-ui text-ui-xs text-light uppercase tracking-widest font-medium">© 2024 ComplianceOS. Built for Indian Fiscal Realities.</p>
        </div>
      </main>
    </div>
  );
}
