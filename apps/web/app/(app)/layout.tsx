"use client";

import { ReactNode } from "react";
import { Toaster } from 'sonner';
import { TRPCProvider } from "@/components/trpc-provider";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { CommandPalette } from "@/components/command-palette";
import { SessionProvider } from "next-auth/react";
import { SkipToMainContent } from "@/components/ui/skip-link";
import { NavigationLoader } from "@/components/ui/navigation-loader";
import { AppSidebar } from "@/components/app/sidebar";
import { AppTopBar } from "@/components/app/topbar";
import { MobileNav } from "@/components/app/mobile-nav";
import { FiscalYearProvider } from "@/hooks/use-fiscal-year";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <FiscalYearProvider>
          <AppShell>{children}</AppShell>
        </FiscalYearProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const { commandPaletteOpen, closeCommandPalette, openCommandPalette } =
    useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-lightest">
      {/* A11y skip link */}
      <SkipToMainContent />

      {/* Global command palette (⌘K) */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={closeCommandPalette} />

      {/* Fixed top bar — spans full viewport width, z-50 */}
      <AppTopBar onSearchFocus={openCommandPalette} />

      {/* Fixed left sidebar — desktop only (lg+), z-40, cleared by topbar h-14 inside */}
      <AppSidebar />

      {/*
        Main content area
        - Desktop: offset right of sidebar (ml-64) and below topbar (pt-14)
        - Mobile:  no left margin, below topbar (pt-14), above mobile nav (pb-16)
      */}
        <main
          id="main-content"
          className="lg:ml-64 pt-14 pb-16 lg:pb-0 min-h-screen p-6 relative"
          tabIndex={-1}
        >
          <NavigationLoader />
          {children}
        </main>

      {/* Fixed bottom nav — mobile only (hidden on lg+) */}
      <MobileNav />

      {/* Toast notifications (app-only) */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
