"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useModules } from "@/hooks/use-modules";

interface ModuleGateProps {
  module: string;
  /** What to show when module is disabled. Default: redirect to /dashboard */
  fallback?: ReactNode;
  /** When true, redirect instead of showing fallback */
  redirect?: boolean;
  children: ReactNode;
}

export function ModuleGate({ module, fallback, redirect = true, children }: ModuleGateProps) {
  const { isEnabled, loading } = useModules();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && redirect && !isEnabled(module) && module !== "accounting") {
      router.push("/dashboard");
    }
  }, [loading, isEnabled, module, redirect, router]);

  if (loading) return null;
  if (isEnabled(module)) return <>{children}</>;
  if (redirect) return null;
  return <>{fallback || null}</>;
}
