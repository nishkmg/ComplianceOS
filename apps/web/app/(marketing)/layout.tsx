"use client";

import "@/app/globals.css";
import { NavigationLoader } from "@/components/ui/navigation-loader";
import { SkipToMainContent } from "@/components/ui/skip-link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipToMainContent />
      <NavigationLoader fullScreen />
      {children}
    </>
  );
}
