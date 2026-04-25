// @ts-nocheck
import { ReactNode } from "react";
// Direct import to avoid barrel export client component issue
import { SkipToMainContent } from "@/components/ui/skip-link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lightest">
      <SkipToMainContent />
      {children}
    </div>
  );
}
