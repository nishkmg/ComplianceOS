'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

const FISCAL_YEARS: FiscalYear[] = [
  { id: 'fy1', name: 'FY 2026-27', year: '2026-27', status: 'open',   daysRemaining: 245 },
  { id: 'fy2', name: 'FY 2025-26', year: '2025-26', status: 'open',   daysRemaining: 67  },
  { id: 'fy3', name: 'FY 2024-25', year: '2024-25', status: 'closed', daysRemaining: 0   },
];

const FiscalYearContext = createContext<FiscalYearContextValue | null>(null);

const STORAGE_KEY = 'complianceos-active-fy';

export function FiscalYearProvider({ children }: { children: ReactNode }) {
  const [activeFy, setActiveFy] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) ?? '2026-27';
    }
    return '2026-27';
  });
  const currentFy: FiscalYear = FISCAL_YEARS.find(fy => fy.year === activeFy) ?? FISCAL_YEARS[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeFy);
  }, [activeFy]);

  const handleSetFy = useCallback((fy: string) => setActiveFy(fy), []);

  return (
    <FiscalYearContext.Provider value={{ activeFy, setActiveFy: handleSetFy, fiscalYears: FISCAL_YEARS, currentFy }}>
      {children}
    </FiscalYearContext.Provider>
  );
}

export function useFiscalYear(): FiscalYearContextValue {
  const ctx = useContext(FiscalYearContext);
  if (!ctx) throw new Error('useFiscalYear must be used within FiscalYearProvider');
  return ctx;
}
