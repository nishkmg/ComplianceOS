"use client";

import "@/app/globals.css";
import { NavigationLoader } from "@/components/ui/navigation-loader";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <NavigationLoader fullScreen />
      {children}
    </>
  );
}
