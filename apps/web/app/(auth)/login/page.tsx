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
    <div className="bg-section-muted min-h-screen flex items-center justify-center p-6 selection:bg-primary-container selection:text-white">
      <main className="w-full max-w-[440px]">
        {/* Surface Card */}
        <div className="bg-white border-[0.5px] border-border-subtle rounded-lg px-8 py-12 md:px-10 md:py-14 shadow-sm relative overflow-hidden">
          {/* KPI Top Border Accent */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight mb-2">ComplianceOS</h1>
            <p className="font-ui-sm text-ui-sm text-on-surface-variant">Secure access to your fiscal ledger.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input Group */}
            <div className="space-y-2 text-left">
              <label className="block font-ui-xs text-ui-xs text-on-surface uppercase tracking-widest" htmlFor="email">Email Address</label>
              <input 
                className="w-full bg-white border-[0.5px] border-border-subtle rounded-sm px-4 py-3 font-mono text-[14px] text-on-surface placeholder:text-text-light focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" 
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
                <label className="block font-ui-xs text-ui-xs text-on-surface uppercase tracking-widest" htmlFor="password">Password</label>
                <Link className="font-ui-xs text-ui-xs text-amber-text hover:text-primary-container transition-colors focus:outline-none focus:underline underline-offset-4 no-underline" href="/forgot-password">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  className="w-full bg-white border-[0.5px] border-border-subtle rounded-sm px-4 py-3 font-mono text-[14px] text-on-surface placeholder:text-text-light focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors pr-10" 
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
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant hover:text-on-surface border-none bg-transparent cursor-pointer"
                >
                  <Icon name={showPassword ? 'visibility' : 'visibility_off'} className="text-[20px]" />
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-[12px] text-center" role="alert">{error}</p>
            )}

            {/* Submit Button */}
            <button className="w-full mt-4 bg-[#c8860a] text-white font-ui-md text-[16px] rounded-sm py-4 px-6 flex justify-center items-center group transition-colors duration-300 hover:bg-[#825500] cursor-pointer border-none" type="submit">
              Access Account
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300 ease-in-out font-mono text-[18px]">→</span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t-[0.5px] border-border-subtle text-center">
            <p className="font-ui-sm text-ui-sm text-on-surface-variant">
              New to ComplianceOS? 
              <Link className="text-amber-text font-medium hover:text-primary-container hover:underline underline-offset-4 transition-all ml-1 no-underline" href="/signup">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Minimal meta footer */}
        <div className="text-center mt-8">
          <p className="font-ui-xs text-ui-xs text-text-light uppercase tracking-widest">© 2024 ComplianceOS. Built for Indian Fiscal Realities.</p>
        </div>
      </main>
    </div>
  );
}
