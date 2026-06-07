'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface FiscalYear {
  id: string;
  name: string;
  year: string;
  status: 'open' | 'closed';
  daysRemaining: number;
}

interface FiscalYearContextValue {
  activeFy: string;
  setActiveFy: (fy: string) => void;
  fiscalYears: FiscalYear[];
  currentFy: FiscalYear;
}

const FALLBACK_YEARS: FiscalYear[] = [
  { id: 'fy1', name: 'FY 2026-27', year: '2026-27', status: 'open', daysRemaining: 320 },
  { id: 'fy2', name: 'FY 2025-26', year: '2025-26', status: 'open', daysRemaining: 67 },
  { id: 'fy3', name: 'FY 2024-25', year: '2024-25', status: 'closed', daysRemaining: 0 },
];

const FiscalYearContext = createContext<FiscalYearContextValue | null>(null);
const STORAGE_KEY = 'complianceos-active-fy';

export function FiscalYearProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>(FALLBACK_YEARS);
  const [activeFy, setActiveFy] = useState('2026-27');

  // Fetch real fiscal years from API
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const res = await fetch(`/api/fiscal-years?tenantId=${encodeURIComponent(tenantId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.fiscalYears?.length > 0) {
            setFiscalYears(data.fiscalYears);
          }
        }
      } catch {
        // Fall through to hardcoded fallback
      }
    })();
  }, [tenantId]);

  // Restore active FY from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && fiscalYears.some(fy => fy.year === stored)) {
        setActiveFy(stored);
      }
    } catch { /* ignore */ }
  }, [fiscalYears]);

  // Persist active FY
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, activeFy); } catch { /* ignore */ }
  }, [activeFy]);

  const currentFy = useMemo(
    () => fiscalYears.find(fy => fy.year === activeFy) ?? fiscalYears[0] ?? FALLBACK_YEARS[0],
    [fiscalYears, activeFy]
  );

  const handleSetFy = useCallback((fy: string) => setActiveFy(fy), []);

  return (
    <FiscalYearContext.Provider value={{ activeFy, setActiveFy: handleSetFy, fiscalYears, currentFy }}>
      {children}
    </FiscalYearContext.Provider>
  );
}

export function useFiscalYear(): FiscalYearContextValue {
  const ctx = useContext(FiscalYearContext);
  if (!ctx) throw new Error('useFiscalYear must be used within FiscalYearProvider');
  return ctx;
}
