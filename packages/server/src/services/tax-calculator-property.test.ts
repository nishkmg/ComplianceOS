import { describe, it, expect } from 'vitest';
import { TaxCalculator, calculate87ARebate, getSurchargeRate, calculateSurchargeWithMarginalRelief } from './tax-calculator';

const calc = new TaxCalculator();

describe('Tax Calculator Property Tests', () => {
  describe('Old Regime Slab Boundaries', () => {
    it('income at 0 yields 0 tax', () => {
      const r = calc.calculateTaxOldRegime(0, {});
      expect(r.taxBeforeRebate).toBe(0);
      expect(r.surcharge).toBe(0);
      expect(r.cess).toBe(0);
      expect(r.totalTax).toBe(0);
    });

    it('income at ₹2,50,000 yields 0 tax', () => {
      const r = calc.calculateTaxOldRegime(250000, {});
      expect(r.taxBeforeRebate).toBe(0);
    });

    it('income at ₹2,60,000 enters 5% slab', () => {
      // 2.5L-2.6L: 10K @ 5% = 500
      const r = calc.calculateTaxOldRegime(260000, {});
      expect(r.taxBeforeRebate).toBe(500);
    });

    it('income at ₹5,00,000 yields 0 tax (87A rebate)', () => {
      const r = calc.calculateTaxOldRegime(500000, {});
      expect(r.taxAfterRebate).toBe(0);
      expect(r.rebate87A).toBe(12500);
    });

    it('income at ₹5,00,001 triggers positive tax (rebate phase-out)', () => {
      // tax: 12500.05, rebate: min(12500.05, max(0,12500-1)) = 12499
      // taxAfterRebate ≈ 1.05
      const r = calc.calculateTaxOldRegime(500001, {});
      expect(r.taxAfterRebate).toBeGreaterThan(0);
      expect(r.rebate87A).toBeLessThan(12500);
    });

    it('income at ₹10,00,000 enters 20% slab', () => {
      // 2.5L-5L: 12,500, 5L-10L: 5L@20% = 1L, total: 1,12,500
      const r = calc.calculateTaxOldRegime(1000000, {});
      expect(r.taxBeforeRebate).toBe(112500);
    });

    it('income at ₹10,10,000 enters 30% slab', () => {
      // 2.5L-5L: 12,500, 5L-10L: 1,00,000, 10L-10.1L: 10K@30% = 3,000
      // total = 1,15,500
      const r = calc.calculateTaxOldRegime(1010000, {});
      expect(r.taxBeforeRebate).toBe(115500);
    });
  });

  describe('New Regime Slab Boundaries (§115BAC)', () => {
    it('income at 0 yields 0 tax', () => {
      const r = calc.calculateTaxNewRegime(0);
      expect(r.totalTax).toBe(0);
    });

    it('income at ₹3,00,000 yields 0 tax', () => {
      const r = calc.calculateTaxNewRegime(300000);
      expect(r.taxBeforeRebate).toBe(0);
    });

    it('income at ₹7,00,000 yields 0 tax (87A rebate)', () => {
      const r = calc.calculateTaxNewRegime(700000);
      expect(r.taxAfterRebate).toBe(0);
      expect(r.rebate87A).toBe(25000);
    });

    it('income at ₹7,00,001 triggers marginal relief', () => {
      const r = calc.calculateTaxNewRegime(700001);
      // tax ≈ 25000, rebate with marginal relief = 24999, taxAfterRebate ≈ 1
      expect(r.taxAfterRebate).toBeGreaterThan(0);
      expect(r.rebate87A).toBeLessThan(25000);
    });

    it('income at ₹16,00,000 enters 30% slab', () => {
      // 3L-6L: 15K, 6L-9L: 30K, 9L-12L: 45K, 12L-15L: 60K = 1.5L
      // 15L-16L: 1L@30% = 30K
      // total = 1.8L
      const r = calc.calculateTaxNewRegime(1600000);
      expect(r.taxBeforeRebate).toBe(180000);
    });
  });

  describe('87A Rebate Properties', () => {
    it('old regime: income ≤ 5L → tax = 0', () => {
      for (const income of [300000, 400000, 500000]) {
        const r = calc.calculateTaxOldRegime(income, {});
        expect(r.taxAfterRebate).toBe(0);
      }
    });

    it('old regime: marginal relief tapers rebate above 5L', () => {
      // At 5L+100, rebate reduces by ~100
      const at5L = calculate87ARebate(500000, 12500, 'old');
      const at5100 = calculate87ARebate(500100, 12600, 'old');
      // rebate drops by roughly the excess
      const drop = at5L - at5100;
      expect(drop).toBeGreaterThanOrEqual(95);
    });

    it('new regime: income ≤ 7L → tax = 0', () => {
      for (const income of [300000, 500000, 700000]) {
        const r = calc.calculateTaxNewRegime(income);
        expect(r.taxAfterRebate).toBe(0);
      }
    });

    it('new regime: marginal relief tapers rebate above 7L', () => {
      const at7L = calculate87ARebate(700000, 25000, 'new');
      const at7200 = calculate87ARebate(700200, 25200, 'new');
      // rebate drops by roughly the excess
      const drop = at7L - at7200;
      expect(drop).toBeGreaterThanOrEqual(195);
    });

    it('rebate never exceeds tax amount', () => {
      for (const income of [300000, 500000, 700000]) {
        const r = calc.calculateTaxNewRegime(income);
        expect(r.rebate87A).toBeLessThanOrEqual(r.taxBeforeRebate);
      }
    });
  });

  describe('Surcharge Boundary Properties', () => {
    it('income at ₹49,00,000 → 0% surcharge', () => {
      const r = calc.calculateTaxNewRegime(4900000);
      expect(r.surchargeRate).toBe(0);
      expect(r.surcharge).toBe(0);
    });

    it('income at ₹50,00,001 → 10% surcharge with marginal relief', () => {
      const r = calc.calculateTaxNewRegime(5000001);
      expect(r.surchargeRate).toBe(0.10);
      // surcharge with relief should be <= plain 10%
      const plainSurcharge = Math.round(r.taxAfterRebate * 0.10);
      expect(r.surcharge).toBeGreaterThan(0);
      expect(r.surcharge).toBeLessThanOrEqual(plainSurcharge);
    });

    it('income at ₹1,00,00,001 → 15% surcharge', () => {
      const r = calc.calculateTaxNewRegime(10000001);
      expect(r.surchargeRate).toBe(0.15);
    });

    it('income at ₹2,00,00,001 → 25% surcharge', () => {
      const r = calc.calculateTaxNewRegime(20000001);
      expect(r.surchargeRate).toBe(0.25);
    });

    it('income at ₹5,00,00,001 → 37% surcharge', () => {
      const r = calc.calculateTaxNewRegime(50000001);
      expect(r.surchargeRate).toBe(0.37);
    });

    it('surcharge rate is monotonic non-decreasing with income', () => {
      const incomes = [1000000, 3000000, 4900000, 5000001, 6000000, 10000001, 20000001, 50000001];
      for (let i = 1; i < incomes.length; i++) {
        const prev = getSurchargeRate(incomes[i - 1]);
        const curr = getSurchargeRate(incomes[i]);
        expect(curr).toBeGreaterThanOrEqual(prev);
      }
    });
  });

  describe('Cess Property', () => {
    it('cess always 4% of (tax + surcharge - rebate)', () => {
      // Cess computed on (taxAfterRebate + surcharge)
      for (const income of [500000, 1000000, 5000001, 10000001, 20000001, 50000001]) {
        const r = calc.calculateTaxNewRegime(income);
        const expectedCess = Math.round((r.taxAfterRebate + r.surcharge) * 0.04);
        expect(r.cess).toBe(expectedCess);
      }
    });
  });

  describe('Monotonicity Properties', () => {
    it('total tax is monotonic non-decreasing with income', () => {
      const incomes = [0, 250000, 500000, 1000000, 2500000, 5000000, 10000000, 20000000];
      for (let i = 1; i < incomes.length; i++) {
        const prev = calc.calculateTaxNewRegime(incomes[i - 1]);
        const curr = calc.calculateTaxNewRegime(incomes[i]);
        expect(curr.totalTax).toBeGreaterThanOrEqual(prev.totalTax);
      }
    });

    it('effective tax rate is monotonic non-decreasing with income', () => {
      const incomes = [300000, 500000, 700000, 1000000, 1500000, 3000000, 6000000, 10000000];
      for (let i = 1; i < incomes.length; i++) {
        const prev = calc.calculateTaxNewRegime(incomes[i - 1]);
        const curr = calc.calculateTaxNewRegime(incomes[i]);
        expect(curr.effectiveTaxRate).toBeGreaterThanOrEqual(prev.effectiveTaxRate - 0.001);
      }
    });
  });

  describe('Surcharge Marginal Relief Property', () => {
    it('marginal relief reduces surcharge when crossing threshold', () => {
      // Calculate surcharge without relief vs with relief
      // Without relief: surchargeRate * taxAfterRebate
      // With relief (as computed by calculator): should be <= without relief
      for (const income of [5100000, 11000000, 21000000, 51000000]) {
        const r = calc.calculateTaxNewRegime(income);
        const plainSurcharge = Math.round(r.taxAfterRebate * r.surchargeRate);
        expect(r.surcharge).toBeLessThanOrEqual(plainSurcharge);
      }
    });

    it('surcharge with marginal relief is non-negative', () => {
      for (const income of [5100000, 5100001, 10000001, 20000001, 50000001]) {
        const r = calc.calculateTaxNewRegime(income);
        expect(r.surcharge).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Old vs New Regime Slab Consistency', () => {
    it('new regime tax without deductions equals old regime with no deductions near 7.5L', () => {
      const incomes = [500000, 750000, 1000000, 1500000, 2000000];
      for (const income of incomes) {
        const newR = calc.calculateTaxNewRegime(income);
        const oldR = calc.calculateTaxOldRegime(income, {});
        // New regime should be same or lower for no-deduction case at lower incomes
        if (income <= 1500000) {
          expect(newR.totalTax).toBeLessThanOrEqual(oldR.totalTax + 100);
        }
      }
    });
  });
});
