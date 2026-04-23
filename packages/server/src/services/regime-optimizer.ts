// @ts-nocheck
/**
 * Regime Optimizer Service
 * 
 * Compares Old vs New (115BAC) tax regimes and recommends
 * the optimal choice based on income and eligible deductions.
 */

import { TaxCalculator, type Deductions, type TaxCalculationResult } from './tax-calculator';

export interface RegimeComparison {
  newRegime: TaxCalculationResult & { marginalTaxRate: number };
  oldRegime: TaxCalculationResult & { marginalTaxRate: number };
  recommendedRegime: 'new' | 'old';
  taxSavings: number;
  analysis: string;
}

export interface RegimeRecommendation {
  regime: 'new' | 'old';
  reason: string;
  taxSavings: number;
  lockInWarning?: string;
  breakEvenDeductions: number;
  marginalAnalysis: {
    newRegimeRate: number;
    oldRegimeRate: number;
  };
}

export interface LockInImpact {
  currentRegime: 'new' | 'old';
  yearsInOldRegime: number;
  hasLockIn: boolean;
  remainingYears: number;
  canSwitch: boolean;
  switchDeadline?: string;
  warning: string;
}

export class RegimeOptimizer {
  private calculator: TaxCalculator;

  constructor() {
    this.calculator = new TaxCalculator();
  }

  /**
   * Compare both regimes and return detailed analysis
   */
  compareRegimes(
    totalIncome: number,
    eligibleDeductions: Deductions,
    isSeniorCitizen: boolean = false,
    age?: number
  ): RegimeComparison {
    const newRegimeResult = this.calculator.calculateTaxNewRegime(
      totalIncome,
      isSeniorCitizen,
      age
    );

    const oldRegimeResult = this.calculator.calculateTaxOldRegime(
      totalIncome,
      eligibleDeductions,
      isSeniorCitizen,
      age
    );

    const newRegimeMarginal = this.getMarginalTaxRate(totalIncome, 'new');
    const oldRegimeMarginal = this.getMarginalTaxRate(
      oldRegimeResult.taxableIncome,
      'old'
    );

    const taxDifference = newRegimeResult.totalTax - oldRegimeResult.totalTax;
    const recommendedRegime = taxDifference > 0 ? 'old' : 'new';
    const taxSavings = Math.abs(taxDifference);

    const analysis = this.generateAnalysis(
      totalIncome,
      newRegimeResult,
      oldRegimeResult,
      recommendedRegime,
      taxSavings
    );

    return {
      newRegime: { ...newRegimeResult, marginalTaxRate: newRegimeMarginal },
      oldRegime: { ...oldRegimeResult, marginalTaxRate: oldRegimeMarginal },
      recommendedRegime,
      taxSavings,
      analysis,
    };
  }

  /**
   * Get regime recommendation with reasoning
   */
  recommendRegime(
    totalIncome: number,
    eligibleDeductions: Deductions,
    isSeniorCitizen: boolean = false,
    age?: number
  ): RegimeRecommendation {
    const comparison = this.compareRegimes(
      totalIncome,
      eligibleDeductions,
      isSeniorCitizen,
      age
    );

    const reason = this.generateReason(
      comparison.recommendedRegime,
      totalIncome,
      comparison.newRegime,
      comparison.oldRegime,
      comparison.taxSavings
    );

    const lockInWarning =
      comparison.recommendedRegime === 'old'
        ? 'Warning: Opting for Old Regime locks you in for 5 years. Switching back to New Regime allowed only once after 5 years.'
        : undefined;

    const breakEvenDeductions = this.calculateBreakEvenDeductions(totalIncome);

    return {
      regime: comparison.recommendedRegime,
      reason,
      taxSavings: comparison.taxSavings,
      lockInWarning,
      breakEvenDeductions,
      marginalAnalysis: {
        newRegimeRate: comparison.newRegime.marginalTaxRate,
        oldRegimeRate: comparison.oldRegime.marginalTaxRate,
      },
    };
  }

  /**
   * Calculate impact of 5-year lock-in for Old Regime
   */
  calculateLockinImpact(
    regime: 'new' | 'old',
    yearsInOldRegime: number
  ): LockInImpact {
    const hasLockIn = regime === 'old';
    const remainingYears = hasLockIn ? Math.max(0, 5 - yearsInOldRegime) : 0;
    const canSwitch = regime === 'new' || yearsInOldRegime >= 5;

    let warning = '';
    if (regime === 'old' && yearsInOldRegime < 5) {
      warning = `You are locked into Old Regime for ${remainingYears} more year${remainingYears > 1 ? 's' : ''}. Cannot switch to New Regime until FY ${new Date().getFullYear() + remainingYears}-${(new Date().getFullYear() + remainingYears + 1).toString().slice(-2)}.`;
    } else if (regime === 'old' && yearsInOldRegime >= 5) {
      warning = 'You can now switch to New Regime. This decision is irreversible for future years.';
    } else {
      warning = 'You are in New Regime. Can switch to Old Regime anytime (with 5-year lock-in).';
    }

    return {
      currentRegime: regime,
      yearsInOldRegime,
      hasLockIn,
      remainingYears,
      canSwitch,
      switchDeadline: canSwitch && regime === 'old' ? `March 31, ${new Date().getFullYear() + 1}` : undefined,
      warning,
    };
  }

  /**
   * Get marginal tax rate for a given income and regime
   */
  private getMarginalTaxRate(income: number, regime: 'new' | 'old'): number {
    if (regime === 'new') {
      if (income <= 300000) return 0;
      if (income <= 600000) return 5;
      if (income <= 900000) return 10;
      if (income <= 1200000) return 15;
      if (income <= 1500000) return 20;
      return 30;
    } else {
      if (income <= 250000) return 0;
      if (income <= 500000) return 5;
      if (income <= 1000000) return 20;
      return 30;
    }
  }

  /**
   * Calculate break-even deductions where Old Regime becomes beneficial
   */
  private calculateBreakEvenDeductions(totalIncome: number): number {
    // Calculate new regime tax
    const newRegimeTax = this.calculator.calculateTaxNewRegime(totalIncome);
    
    // Binary search for break-even deductions
    let low = 0;
    let high = totalIncome;
    let breakEven = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const testDeductions: Deductions = {
        standardDeduction: Math.min(50000, mid),
        section80C: Math.min(150000, Math.max(0, mid - 50000)),
      };

      const oldRegimeTax = this.calculator.calculateTaxOldRegime(
        totalIncome,
        testDeductions
      );

      if (oldRegimeTax.totalTax <= newRegimeTax.totalTax) {
        breakEven = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return breakEven;
  }

  /**
   * Generate detailed analysis text
   */
  private generateAnalysis(
    totalIncome: number,
    newRegime: TaxCalculationResult,
    oldRegime: TaxCalculationResult,
    recommended: 'new' | 'old',
    taxSavings: number
  ): string {
    const parts: string[] = [];

    parts.push(`For income of ₹${this.formatNumber(totalIncome)}:`);
    parts.push('');
    parts.push(`• New Regime: ₹${this.formatNumber(newRegime.totalTax)} tax (${newRegime.effectiveTaxRate.toFixed(2)}% effective rate)`);
    parts.push(`• Old Regime: ₹${this.formatNumber(oldRegime.totalTax)} tax (${oldRegime.effectiveTaxRate.toFixed(2)}% effective rate)`);
    parts.push('');

    if (recommended === 'new') {
      parts.push(`✓ Recommended: New Regime saves ₹${this.formatNumber(taxSavings)}`);
      if (newRegime.rebate87A > 0) {
        parts.push(`  - Benefit: Rebate 87A of ₹${this.formatNumber(newRegime.rebate87A)} applied`);
      }
      parts.push('  - Note: New regime has simpler slabs with no deduction requirements');
    } else {
      parts.push(`✓ Recommended: Old Regime saves ₹${this.formatNumber(taxSavings)}`);
      if (oldRegime.deductionsApplied) {
        const totalDeductions = Object.values(oldRegime.deductionsApplied).reduce((a, b) => a + b, 0);
        parts.push(`  - Benefit: Deductions of ₹${this.formatNumber(totalDeductions)} reduce taxable income`);
      }
      parts.push('  - ⚠️ Warning: 5-year lock-in applies once you opt for Old Regime');
    }

    return parts.join('\n');
  }

  /**
   * Generate concise reason for recommendation
   */
  private generateReason(
    regime: 'new' | 'old',
    income: number,
    newRegime: TaxCalculationResult,
    oldRegime: TaxCalculationResult,
    savings: number
  ): string {
    if (regime === 'new') {
      if (income <= 700000 && newRegime.rebate87A > 0) {
        return `New Regime recommended: Income qualifies for rebate 87A (₹7L limit), resulting in zero tax liability.`;
      }
      if (income <= 500000) {
        return `New Regime recommended: Lower tax burden with simpler compliance. No deduction documentation needed.`;
      }
      return `New Regime recommended: Saves ₹${this.formatNumber(savings)} compared to Old Regime. Simpler tax structure with fewer exemptions.`;
    } else {
      const totalDeductions = oldRegime.deductionsApplied
        ? Object.values(oldRegime.deductionsApplied).reduce((a, b) => a + b, 0)
        : 0;
      return `Old Regime recommended: Your deductions (₹${this.formatNumber(totalDeductions)}) make this regime more beneficial, saving ₹${this.formatNumber(savings)}. Remember: 5-year lock-in applies.`;
    }
  }

  /**
   * Format number with Indian comma separation
   */
  private formatNumber(num: number): string {
    return num.toLocaleString('en-IN');
  }
}
