// @ts-nocheck
/**
 * Tax Calculator Service
 * 
 * Calculates income tax under both Old and New Regime (115BAC)
 * with support for rebate 87A, surcharge, and health & education cess.
 */

export interface TaxCalculationResult {
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRate: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
  exemptionLimit: number;
  deductionsApplied?: {
    section80C: number;
    section80D: number;
    section80CCD1B: number;
    section80E: number;
    section80G: number;
    hra: number;
    lta: number;
    standardDeduction: number;
    homeLoanInterest: number;
  };
}

export interface Deductions {
  section80C?: number;      // Max ₹1,50,000 (PPF, LIC, ELSS, etc.)
  section80D?: number;      // Medical insurance (₹25K-₹1L)
  section80CCD1B?: number;  // NPS (max ₹50,000)
  section80E?: number;      // Education loan interest (no upper limit)
  section80G?: number;      // Donations (50% or 100% based on fund)
  hra?: number;             // HRA (Section 10)
  lta?: number;             // LTA (Section 10)
  standardDeduction?: number; // ₹50,000 (salary only)
  homeLoanInterest?: number; // ₹2,00,000 (self-occupied)
}

// New Regime (115BAC) Tax Slabs
const NEW_REGIME_SLABS = [
  { limit: 300000, rate: 0 },
  { limit: 600000, rate: 0.05 },
  { limit: 900000, rate: 0.10 },
  { limit: 1200000, rate: 0.15 },
  { limit: 1500000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
] as const;

// Old Regime Tax Slabs
const OLD_REGIME_SLABS = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 },
] as const;

// Surcharge rates based on total income
const SURCHARGE_RATES = [
  { limit: 5000000, rate: 0 },
  { limit: 10000000, rate: 0.10 },
  { limit: 20000000, rate: 0.15 },
  { limit: 50000000, rate: 0.25 },
  { limit: Infinity, rate: 0.37 },
] as const;

const HEC_RATE = 0.04; // Health & Education Cess: 4%

export class TaxCalculator {
  /**
   * Calculate tax under New Regime (Section 115BAC)
   * Default regime, no deductions allowed except employer NPS
   */
  calculateTaxNewRegime(
    totalIncome: number,
    isSeniorCitizen: boolean = false,
    age?: number
  ): TaxCalculationResult {
    // New regime has same exemption for all ages: ₹3,00,000
    const exemptionLimit = 300000;
    const taxableIncome = Math.max(0, totalIncome - exemptionLimit);

    // Calculate slab-wise tax on gross income (not taxable income)
    let taxBeforeRebate = 0;
    let previousLimit = 0;

    for (const slab of NEW_REGIME_SLABS) {
      if (totalIncome <= previousLimit) break;
      
      const taxableInSlab = Math.min(totalIncome, slab.limit) - previousLimit;
      if (taxableInSlab > 0) {
        taxBeforeRebate += taxableInSlab * slab.rate;
      }
      previousLimit = slab.limit;
    }

    // Apply Rebate 87A (full rebate if income ≤ ₹7,00,000)
    let rebate87A = 0;
    if (totalIncome <= 700000) {
      rebate87A = taxBeforeRebate; // Full rebate
    }

    const taxAfterRebate = taxBeforeRebate - rebate87A;

    // Calculate surcharge (on tax after rebate)
    const surchargeRate = this.getSurchargeRate(totalIncome);
    const surcharge = taxAfterRebate * surchargeRate;

    // Calculate cess (on tax + surcharge)
    const cess = (taxAfterRebate + surcharge) * HEC_RATE;

    // Total tax
    const totalTax = taxAfterRebate + surcharge + cess;

    return {
      taxableIncome,
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebate87A: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      surcharge: Math.round(surcharge),
      surchargeRate,
      cess: Math.round(cess),
      totalTax: Math.round(totalTax),
      effectiveTaxRate: totalIncome > 0 ? totalTax / totalIncome : 0,
      exemptionLimit,
    };
  }

  /**
   * Calculate tax under Old Regime
   * Allows deductions under various sections
   */
  calculateTaxOldRegime(
    totalIncome: number,
    deductions: Deductions,
    isSeniorCitizen: boolean = false,
    age?: number
  ): TaxCalculationResult {
    // Determine exemption limit based on age
    let exemptionLimit = 250000; // Default
    if (isSeniorCitizen) {
      if (age && age >= 80) {
        exemptionLimit = 500000; // Super senior
      } else if (age && age >= 60) {
        exemptionLimit = 300000; // Senior citizen
      }
    }

    // Calculate total deductions
    const deductionsApplied = this.calculateDeductions(deductions);
    const totalDeductions =
      deductionsApplied.section80C +
      deductionsApplied.section80D +
      deductionsApplied.section80CCD1B +
      deductionsApplied.section80E +
      deductionsApplied.section80G +
      deductionsApplied.hra +
      deductionsApplied.lta +
      deductionsApplied.standardDeduction +
      deductionsApplied.homeLoanInterest;

    const taxableIncome = Math.max(0, totalIncome - totalDeductions);

    // Calculate slab-wise tax on gross income
    let taxBeforeRebate = 0;
    let previousLimit = 0;

    // Adjust slabs for senior citizens
    const slabs = isSeniorCitizen && age && age >= 80
      ? [{ limit: 500000, rate: 0 }, ...OLD_REGIME_SLABS.slice(1)] // Super senior
      : isSeniorCitizen && age && age >= 60
        ? [{ limit: 300000, rate: 0 }, ...OLD_REGIME_SLABS.slice(1)] // Senior
        : OLD_REGIME_SLABS;

    for (const slab of slabs) {
      if (taxableIncome <= previousLimit) break;
      
      const taxableInSlab = Math.min(taxableIncome, slab.limit) - previousLimit;
      if (taxableInSlab > 0) {
        taxBeforeRebate += taxableInSlab * slab.rate;
      }
      previousLimit = slab.limit;
    }

    // Apply Rebate 87A (full rebate if total income ≤ ₹5,00,000)
    let rebate87A = 0;
    if (totalIncome <= 500000) {
      rebate87A = Math.min(taxBeforeRebate, 12500); // Max rebate ₹12,500
    }

    const taxAfterRebate = taxBeforeRebate - rebate87A;

    // Calculate surcharge (on tax after rebate)
    const surchargeRate = this.getSurchargeRate(totalIncome);
    const surcharge = taxAfterRebate * surchargeRate;

    // Calculate cess (on tax + surcharge)
    const cess = (taxAfterRebate + surcharge) * HEC_RATE;

    // Total tax
    const totalTax = taxAfterRebate + surcharge + cess;

    return {
      taxableIncome,
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebate87A: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      surcharge: Math.round(surcharge),
      surchargeRate,
      cess: Math.round(cess),
      totalTax: Math.round(totalTax),
      effectiveTaxRate: totalIncome > 0 ? totalTax / totalIncome : 0,
      exemptionLimit,
      deductionsApplied,
    };
  }

  /**
   * Calculate applicable deductions with caps
   */
  private calculateDeductions(deductions: Deductions): Required<Deductions> {
    const result: Required<Deductions> = {
      section80C: Math.min(Math.max(0, deductions.section80C || 0), 150000),
      section80D: Math.max(0, deductions.section80D || 0), // Cap varies by age/family
      section80CCD1B: Math.min(Math.max(0, deductions.section80CCD1B || 0), 50000),
      section80E: Math.max(0, deductions.section80E || 0), // No upper limit
      section80G: Math.max(0, deductions.section80G || 0), // 50% or 100% based on fund
      hra: Math.max(0, deductions.hra || 0), // Actual HRA received
      lta: Math.max(0, deductions.lta || 0), // Actual LTA received
      standardDeduction: Math.min(Math.max(0, deductions.standardDeduction || 0), 50000),
      homeLoanInterest: Math.min(Math.max(0, deductions.homeLoanInterest || 0), 200000),
    };

    return result;
  }

  /**
   * Get surcharge rate based on total income
   */
  private getSurchargeRate(totalIncome: number): number {
    for (const tier of SURCHARGE_RATES) {
      if (totalIncome < tier.limit) {
        return tier.rate;
      }
    }
    return SURCHARGE_RATES[SURCHARGE_RATES.length - 1].rate;
  }
}
