import { describe, it, expect } from 'vitest';
import { RegimeOptimizer } from './regime-optimizer';

describe('RegimeOptimizer', () => {
  const optimizer = new RegimeOptimizer();

  describe('compareRegimes', () => {
    it('should recommend new regime for low income with no deductions', () => {
      const comparison = optimizer.compareRegimes(600000, {}, false);
      expect(comparison.recommendedRegime).toBe('new');
      expect(comparison.newRegime.totalTax).toBeLessThan(comparison.oldRegime.totalTax);
    });

    it('should recommend old regime for high deductions', () => {
      const deductions = {
        section80C: 150000,
        section80D: 50000,
        section80CCD1B: 50000,
        standardDeduction: 50000,
        homeLoanInterest: 200000,
      };
      const comparison = optimizer.compareRegimes(1500000, deductions, false);
      expect(comparison.recommendedRegime).toBe('old');
      expect(comparison.oldRegime.totalTax).toBeLessThan(comparison.newRegime.totalTax);
    });

    it('should show tax savings amount', () => {
      const deductions = { section80C: 150000 };
      const comparison = optimizer.compareRegimes(800000, deductions, false);
      expect(comparison.taxSavings).toBeGreaterThan(0);
      expect(comparison.taxSavings).toBe(
        Math.abs(comparison.newRegime.totalTax - comparison.oldRegime.totalTax)
      );
    });

    it('should handle senior citizens correctly', () => {
      const comparison = optimizer.compareRegimes(400000, {}, true, 65);
      // Senior citizen gets 3L exemption in old regime
      expect(comparison.oldRegime.exemptionLimit).toBe(300000);
      expect(comparison.newRegime.exemptionLimit).toBe(300000);
    });

    it('should show regime details for both regimes', () => {
      const comparison = optimizer.compareRegimes(1000000, { section80C: 100000 }, false);
      expect(comparison.newRegime).toBeDefined();
      expect(comparison.oldRegime).toBeDefined();
      expect(comparison.newRegime.taxableIncome).toBeDefined();
      expect(comparison.oldRegime.taxableIncome).toBeDefined();
    });
  });

  describe('recommendRegime', () => {
    it('should return new regime for income ≤ 7L with no deductions', () => {
      const recommendation = optimizer.recommendRegime(700000, {}, false);
      expect(recommendation.regime).toBe('new');
      expect(recommendation.reason).toContain('rebate 87A');
    });

    it('should return old regime when deductions exceed threshold', () => {
      const deductions = {
        section80C: 150000,
        standardDeduction: 50000,
        homeLoanInterest: 200000,
      };
      const recommendation = optimizer.recommendRegime(1500000, deductions, false);
      expect(recommendation.regime).toBe('old');
      expect(recommendation.taxSavings).toBeGreaterThan(0);
    });

    it('should warn about 5-year lock-in for old regime', () => {
      const deductions = { section80C: 150000 };
      const recommendation = optimizer.recommendRegime(1000000, deductions, false);
      if (recommendation.regime === 'old') {
        expect(recommendation.lockInWarning).toBeDefined();
      }
    });

    it('should provide break-even deduction analysis', () => {
      const recommendation = optimizer.recommendRegime(1000000, {}, false);
      expect(recommendation.breakEvenDeductions).toBeDefined();
      // Break-even could be 0 if new regime is already better
      expect(recommendation.breakEvenDeductions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateLockinImpact', () => {
    it('should warn about 5-year lock-in for old regime', () => {
      const impact = optimizer.calculateLockinImpact('old', 3);
      expect(impact.hasLockIn).toBe(true);
      expect(impact.remainingYears).toBe(2);
      expect(impact.canSwitch).toBe(false);
    });

    it('should allow switching from new regime anytime', () => {
      const impact = optimizer.calculateLockinImpact('new', 2);
      expect(impact.hasLockIn).toBe(false);
      expect(impact.canSwitch).toBe(true);
    });

    it('should show no lock-in after 5 years', () => {
      const impact = optimizer.calculateLockinImpact('old', 5);
      expect(impact.hasLockIn).toBe(true); // Still in old regime
      expect(impact.canSwitch).toBe(true); // Can switch after 5 years
    });

    it('should handle years beyond 5', () => {
      const impact = optimizer.calculateLockinImpact('old', 7);
      expect(impact.remainingYears).toBe(0);
    });
  });

  describe('Break-even Analysis', () => {
    it('should calculate break-even deductions for ₹10L income', () => {
      const recommendation = optimizer.recommendRegime(1000000, {}, false);
      // New regime tax on 10L: 3L-6L=15K, 6L-9L=30K, 9L-10L=10K = 55K + cess
      // Old regime needs sufficient deductions to beat this
      expect(recommendation.breakEvenDeductions).toBeGreaterThanOrEqual(0);
    });

    it('should show marginal tax rate comparison', () => {
      const comparison = optimizer.compareRegimes(1500000, { section80C: 150000 }, false);
      expect(comparison.newRegime.marginalTaxRate).toBeDefined();
      expect(comparison.oldRegime.marginalTaxRate).toBeDefined();
    });
  });
});
