"use client";

import Link from "next/link";
import { Icon } from '@/components/ui/icon';

export default function AccessDeniedPage() {
  return (
    <div className="bg-page-bg text-on-surface min-h-screen flex flex-col antialiased">
      {/* Minimal Header */}
      <header className="w-full border-b-[0.5px] border-border bg-surface/80 backdrop-blur-md px-8 py-6 sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto flex items-center justify-start text-left">
          <span className="font-display text-lg font-bold tracking-tighter text-dark uppercase">ComplianceOS</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-md border-[0.5px] border-border flex items-center justify-center bg-surface mb-6 shadow-sm">
              <Icon name="lock" className="text-text-mid text-3xl" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-dark mb-4">Access Denied</h1>
            <p className="text-[13px] text-secondary font-ui max-w-sm mx-auto leading-relaxed">
              You do not have the required permissions to view this module. This action has been logged for security compliance.
            </p>
          </div>

          <div className="w-full border-[0.5px] border-border bg-surface p-8 relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <Icon name="admin_panel_settings" className="text-text-light text-xl" />
              <p className="font-ui text-[13px] text-on-surface uppercase tracking-widest font-bold">
                Contact your Organization Administrator to request access.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/dashboard" className="group inline-flex items-center justify-center bg-amber text-white px-10 py-4 font-ui text-[13px] font-bold uppercase tracking-widest shadow-sm hover:bg-amber-hover transition-all no-underline">
              Go to Dashboard
              <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform ml-2" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-border py-8">
        <div className="max-w-[1200px] mx-auto px-8 flex justify-center gap-8">
          <Link href="/terms" className="font-serif text-[10px] uppercase tracking-widest text-text-light hover:text-primary no-underline transition-colors">Terms of Service</Link>
          <Link href="/security" className="font-serif text-[10px] uppercase tracking-widest text-text-light hover:text-primary no-underline transition-colors">Security Architecture</Link>
          <Link href="/contact" className="font-serif text-[10px] uppercase tracking-widest text-text-light hover:text-primary no-underline transition-colors">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
