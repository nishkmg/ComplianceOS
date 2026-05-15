"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ModuleConfig {
  module: string;
  enabled: string;
}

interface OnboardingData {
  gst_registration?: string | null;
  [key: string]: unknown;
}

interface CacheEntry {
  modules: ModuleConfig[];
  onboardingData: OnboardingData;
}

let cache: CacheEntry | null = null;
let cachePromise: Promise<CacheEntry> | null = null;

export function useModules() {
  const { data: session } = useSession();
  const tenantId =
    (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null ?? null;

  const [entry, setEntry] = useState<CacheEntry>(
    cache || { modules: [], onboardingData: {} }
  );
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (!tenantId) return;
    if (cache) {
      setEntry(cache);
      setLoading(false);
      return;
    }
    if (cachePromise) {
      cachePromise.then(setEntry).then(() => setLoading(false));
      return;
    }
    cachePromise = fetch(`/api/onboarding?tenantId=${encodeURIComponent(tenantId)}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve({ moduleActivation: [], onboardingData: {} })))
      .then((data) => {
        const entry: CacheEntry = {
          modules: data.moduleActivation || [],
          onboardingData: (data.onboardingData as OnboardingData) || {},
        };
        cache = entry;
        return entry;
      })
      .catch(() => {
        const fallback: CacheEntry = { modules: [], onboardingData: {} };
        cache = fallback;
        return fallback;
      });
    cachePromise.then(setEntry).then(() => setLoading(false));
  }, [tenantId]);

  function isEnabled(module: string): boolean {
    if (module === "accounting") return true;

    // GST disabled if user selected "Not Registered" in step 5
    if (module === "gst") {
      const gstReg = entry.onboardingData.gst_registration;
      if (gstReg === "none") return false;
    }

    const found = entry.modules.find((m) => m.module === module);
    if (!found) return false;
    return found.enabled === "true";
  }

  return { isEnabled, loading };
}
