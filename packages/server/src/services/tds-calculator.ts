// @ts-nocheck
import type { TDSCalculationResult } from "../../../shared/src/index";

interface TaxSlab {
  upTo: number | null;
  rate: number;
}

interface TDSConfig {
  regime: "old" | "new";
  slabs: {
    new: TaxSlab[];
    old: TaxSlab[];
  };
  standardDeduction?: number;
  rebateLimit?: number;
}

const DEFAULT_TDS_CONFIG: TDSConfig = {
  regime: "new",
  slabs: {
    new: [
      { upTo: 300000, rate: 0 },
      { upTo: 700000, rate: 0.05 },
      { upTo: 1000000, rate: 0.1 },
      { upTo: 1200000, rate: 0.15 },
      { upTo: 1500000, rate: 0.2 },
      { upTo: null, rate: 0.3 },
    ],
    old: [
      { upTo: 250000, rate: 0 },
      { upTo: 500000, rate: 0.05 },
      { upTo: 1000000, rate: 0.2 },
      { upTo: null, rate: 0.3 },
    ],
  },
  standardDeduction: 50000,
  rebateLimit: 25000,
};

function calculateTaxOnIncome(income: number, slabs: TaxSlab[]): number {
  let tax = 0;
  let previousLimit = 0;

  for (const slab of slabs) {
    const upperLimit = slab.upTo ?? income;
    
    if (income <= previousLimit) break;
    
    const taxableInSlab = Math.min(income, upperLimit) - previousLimit;
    if (taxableInSlab > 0) {
      tax += taxableInSlab * slab.rate;
    }
    
    if (slab.upTo === null) break;
    previousLimit = upperLimit;
  }

  return tax;
}

export function calculateTDS(
  projectedAnnualIncome: number,
  deductions: Record<string, number>,
  financialYear: string,
  config: TDSConfig = DEFAULT_TDS_CONFIG,
): TDSCalculationResult {
  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
  
  let taxableIncome = projectedAnnualIncome;
  
  if (config.regime === "new" && config.standardDeduction) {
    taxableIncome -= config.standardDeduction;
  }
  
  taxableIncome -= totalDeductions;
  taxableIncome = Math.max(0, taxableIncome);

  const slabs = config.slabs[config.regime];
  const annualTDS = calculateTaxOnIncome(taxableIncome, slabs);

  const currentMonth = new Date().getMonth() + 1;
  const fyStartMonth = 4;
  const fyYear = parseInt(financialYear.split("-")[0]);
  const isCurrentFY = financialYear === `${fyYear}-${String(fyYear + 1).slice(-2)}`;
  
  let remainingMonths: number;
  if (isCurrentFY) {
    remainingMonths = 12 - currentMonth + 1;
  } else {
    remainingMonths = 12;
  }
  remainingMonths = Math.max(1, remainingMonths);

  const monthlyTDS = annualTDS / remainingMonths;

  return {
    projectedAnnualIncome,
    taxableIncome,
    annualTDS,
    monthlyTDS,
    remainingMonths,
    regime: config.regime,
    deductions,
  };
}

export function calculateTDSWithConfig(
  projectedAnnualIncome: number,
  deductions: Record<string, number>,
  financialYear: string,
  regime: "old" | "new" = "new",
): TDSCalculationResult {
  return calculateTDS(projectedAnnualIncome, deductions, financialYear, {
    ...DEFAULT_TDS_CONFIG,
    regime,
  });
}
