"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ModuleConfig {
  module: string;
  enabled: string;
}

let cachedModules: ModuleConfig[] | null = null;
let cachePromise: Promise<ModuleConfig[]> | null = null;

export function useModules() {
  const { data: session } = useSession();
  const tenantId =
    (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null ?? null;

  const [modules, setModules] = useState<ModuleConfig[]>(cachedModules || []);
  const [loading, setLoading] = useState(!cachedModules);

  useEffect(() => {
    if (!tenantId) return;
    if (cachedModules) {
      setModules(cachedModules);
      setLoading(false);
      return;
    }
    if (cachePromise) {
      cachePromise.then(setModules).then(() => setLoading(false));
      return;
    }
    cachePromise = fetch(`/api/onboarding?tenantId=${encodeURIComponent(tenantId)}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve({ moduleActivation: [] })))
      .then((data) => {
        const list: ModuleConfig[] = data.moduleActivation || [];
        cachedModules = list;
        return list;
      })
      .catch(() => {
        cachedModules = [];
        return [];
      });
    cachePromise.then(setModules).then(() => setLoading(false));
  }, [tenantId]);

  function isEnabled(module: string): boolean {
    if (module === "accounting") return true;
    const found = modules.find((m) => m.module === module);
    if (!found) return false;
    return found.enabled === "true";
  }

  return { isEnabled, loading };
}
