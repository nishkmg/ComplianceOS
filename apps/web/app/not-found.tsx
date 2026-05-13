"use client";

import Link from "next/link";
import { Icon } from '@/components/ui/icon';

export default function NotFoundPage() {
  return (
    <div className="bg-page-bg text-on-surface min-h-screen flex flex-col items-center justify-center font-ui antialiased p-6">
      <main className="w-full max-w-2xl mx-auto text-center flex flex-col items-center justify-center space-y-12">
        <div className="space-y-6">
          <Icon name="search_off" className="text-6xl text-text-light/50" />
          <h1 className="font-marketing-hero text-marketing-hero text-on-surface">404 — Page not found</h1>
          <p className="font-ui text-lg text-secondary max-w-lg mx-auto leading-relaxed">
            The ledger entry you are looking for might have been moved or archived. Please check the URL or return to your main dashboard.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-amber text-white font-ui text-sm font-bold uppercase tracking-widest border border-amber transition-all hover:bg-amber-hover no-underline shadow-sm">
            Return to Dashboard
          </Link>
          <Link href="/support" className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-secondary font-ui text-sm font-bold uppercase tracking-widest border border-transparent transition-all hover:text-on-surface no-underline">
            Contact Support
          </Link>
        </div>

        <div className="w-16 h-px bg-border-subtle mt-8"></div>
        
        <div className="text-text-light font-mono text-[11px] mt-4 uppercase tracking-widest">
          <p>Error Code: 404_NOT_FOUND</p>
          <p>Trace ID: <span className="tracking-wider text-on-surface">0x9f8b2a1c</span></p>
        </div>
      </main>
    </div>
  );
}
