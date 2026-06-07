import { describe, it, expect } from 'vitest';
import { TaxCalculator } from './tax-calculator';

describe('TaxCalculator', () => {
  const calculator = new TaxCalculator();

  describe('New Regime (115BAC)', () => {
    it('should calculate zero tax for income up to ₹3,00,000', () => {
      const result = calculator.calculateTaxNewRegime(250000, false);
      expect(result.taxBeforeRebate).toBe(0);
      expect(result.taxAfterRebate).toBe(0);
      expect(result.surcharge).toBe(0);
      expect(result.cess).toBe(0);
      expect(result.totalTax).toBe(0);
    });

    it('should apply 5% rate for income between ₹3,00,001-₹6,00,000', () => {
      const result = calculator.calculateTaxNewRegime(500000, false);
      // 3L-5L = 2L @ 5% = 10,000
      expect(result.taxBeforeRebate).toBe(10000);
    });

    it('should apply rebate 87A for income up to ₹7,00,000', () => {
      const result = calculator.calculateTaxNewRegime(700000, false);
      // Tax: 3L-6L @ 5% = 15,000, 6L-7L @ 10% = 10,000 = 25,000
      // Rebate 87A applies (income ≤ 7L)
      expect(result.taxAfterRebate).toBe(0);
      expect(result.rebate87A).toBe(25000);
    });

    it('should not apply rebate 87A for income above ₹7,00,000', () => {
      const result = calculator.calculateTaxNewRegime(750000, false);
      expect(result.rebate87A).toBe(0);
      expect(result.taxAfterRebate).toBeGreaterThan(0);
    });

    it('should calculate tax for ₹12,00,000 income', () => {
      const result = calculator.calculateTaxNewRegime(1200000, false);
      // 3L-6L: 3L @ 5% = 15,000
      // 6L-9L: 3L @ 10% = 30,000
      // 9L-12L: 3L @ 15% = 45,000
      // Total: 90,000
      expect(result.taxBeforeRebate).toBe(90000);
    });

    it('should calculate tax for ₹15,00,000 income', () => {
      const result = calculator.calculateTaxNewRegime(1500000, false);
      // 3L-6L: 3L @ 5% = 15,000
      // 6L-9L: 3L @ 10% = 30,000
      // 9L-12L: 3L @ 15% = 45,000
      // 12L-15L: 3L @ 20% = 60,000
      // Total: 150,000
      expect(result.taxBeforeRebate).toBe(150000);
    });

    it('should calculate tax for ₹20,00,000 income', () => {
      const result = calculator.calculateTaxNewRegime(2000000, false);
      // 3L-6L: 3L @ 5% = 15,000
      // 6L-9L: 3L @ 10% = 30,000
      // 9L-12L: 3L @ 15% = 45,000
      // 12L-15L: 3L @ 20% = 60,000
      // 15L-20L: 5L @ 30% = 150,000
      // Total: 300,000
      expect(result.taxBeforeRebate).toBe(300000);
    });

    it('should apply surcharge for income above ₹50,00,000', () => {
      const result = calculator.calculateTaxNewRegime(6000000, false);
      // Tax before rebate: 3L-6L=15K, 6L-9L=30K, 9L-12L=45K, 12L-15L=60K, 15L-60L=13.5L
      // Total: 15,00,000
      // Surcharge 10% (50L-1Cr): 1,50,000
      expect(result.surcharge).toBe(150000);
    });

    it('should apply 15% surcharge for income ₹1-2 Cr', () => {
      const result = calculator.calculateTaxNewRegime(15000000, false);
      // Tax: 3L-6L=15K, 6L-9L=30K, 9L-12L=45K, 12L-15L=60K, 15L-1.5Cr=40.5L
      // Total: 42,00,000
      // Surcharge 15%: 6,30,000
      expect(result.surchargeRate).toBe(0.15);
    });

    it('should apply 25% surcharge for income ₹2-5 Cr', () => {
      const result = calculator.calculateTaxNewRegime(30000000, false);
      expect(result.surchargeRate).toBe(0.25);
    });

    it('should apply 37% surcharge for income above ₹5 Cr', () => {
      const result = calculator.calculateTaxNewRegime(60000000, false);
      expect(result.surchargeRate).toBe(0.37);
    });

    it('should apply 4% health and education cess', () => {
      const result = calculator.calculateTaxNewRegime(1000000, false);
      // Tax: 0-3L=0, 3L-6L=15K, 6L-9L=30K, 9L-10L=10K = 55,000
      // No rebate (income > 7L)
      // No surcharge (income < 50L)
      // Cess 4%: 2,400
      // Total: 62,400
      expect(result.cess).toBe(2400);
      expect(result.totalTax).toBe(62400);
    });
  });

  describe('Old Regime', () => {
    it('should calculate zero tax for income up to ₹2,50,000', () => {
      const deductions = {};
      const result = calculator.calculateTaxOldRegime(250000, deductions, false);
      expect(result.taxBeforeRebate).toBe(0);
    });

    it('should apply 5% rate for income between ₹2,50,001-₹5,00,000', () => {
      const deductions = {};
      const result = calculator.calculateTaxOldRegime(400000, deductions, false);
      // 2.5L-4L = 1.5L @ 5% = 7,500
      expect(result.taxBeforeRebate).toBe(7500);
    });

    it('should apply 20% rate for income between ₹5,00,001-₹10,00,000', () => {
      const deductions = {};
      const result = calculator.calculateTaxOldRegime(700000, deductions, false);
      // 2.5L-5L: 2.5L @ 5% = 12,500
      // 5L-7L: 2L @ 20% = 40,000
      // Total: 52,500
      expect(result.taxBeforeRebate).toBe(52500);
    });

    it('should apply 30% rate for income above ₹10,00,000', () => {
      const deductions = {};
      const result = calculator.calculateTaxOldRegime(1500000, deductions, false);
      // 2.5L-5L: 2.5L @ 5% = 12,500
      // 5L-10L: 5L @ 20% = 1,00,000
      // 10L-15L: 5L @ 30% = 1,50,000
      // Total: 262,500
      expect(result.taxBeforeRebate).toBe(262500);
    });

    it('should apply rebate 87A for income up to ₹5,00,000', () => {
      const deductions = {};
      const result = calculator.calculateTaxOldRegime(500000, deductions, false);
      // Tax: 2.5L-5L = 2.5L @ 5% = 12,500
      // Rebate 87A applies (income ≤ 5L)
      expect(result.taxAfterRebate).toBe(0);
      expect(result.rebate87A).toBe(12500);
    });

    it('should apply standard deduction for salary income', () => {
      const deductions = { standardDeduction: 50000 };
      const result = calculator.calculateTaxOldRegime(550000, deductions, false);
      // Taxable income: 5.5L - 50K = 5L
      // Tax: 2.5L-5L = 2.5L @ 5% = 12,500
      expect(result.taxableIncome).toBe(500000);
      expect(result.taxBeforeRebate).toBe(12500);
    });

    it('should apply 80C deduction up to ₹1,50,000', () => {
      const deductions = { section80C: 150000 };
      const result = calculator.calculateTaxOldRegime(700000, deductions, false);
      // Taxable: 7L - 1.5L = 5.5L
      // Tax: 0-2.5L=0, 2.5L-5L=12,500, 5L-5.5L=10,000 = 22,500
      expect(result.taxableIncome).toBe(550000);
      expect(result.taxBeforeRebate).toBe(22500);
    });

    it('should cap 80C deduction at ₹1,50,000', () => {
      const deductions = { section80C: 200000 };
      const result = calculator.calculateTaxOldRegime(700000, deductions, false);
      expect(result.deductionsApplied?.section80C).toBe(150000);
    });

    it('should apply 80D medical insurance deduction', () => {
      const deductions = { section80D: 25000 };
      const result = calculator.calculateTaxOldRegime(400000, deductions, false);
      // Taxable: 4L - 25K = 3.75L
      // Tax: 2.5L-3.75L = 1.25L @ 5% = 6,250
      expect(result.taxableIncome).toBe(375000);
      expect(result.taxBeforeRebate).toBe(6250);
    });

    it('should apply 80CCD(1B) NPS deduction up to ₹50,000', () => {
      const deductions = { section80CCD1B: 50000 };
      const result = calculator.calculateTaxOldRegime(400000, deductions, false);
      // Taxable: 4L - 50K = 3.5L
      // Tax: 2.5L-3.5L = 1L @ 5% = 5,000
      expect(result.taxableIncome).toBe(350000);
    });

    it('should apply HRA deduction', () => {
      const deductions = { hra: 60000 };
      const result = calculator.calculateTaxOldRegime(600000, deductions, false);
      // Taxable: 6L - 60K = 5.4L
      expect(result.taxableIncome).toBe(540000);
    });

    it('should apply home loan interest deduction up to ₹2,00,000', () => {
      const deductions = { homeLoanInterest: 200000 };
      const result = calculator.calculateTaxOldRegime(800000, deductions, false);
      // Taxable: 8L - 2L = 6L
      expect(result.taxableIncome).toBe(600000);
    });

    it('should apply all deductions combined', () => {
      const deductions = {
        section80C: 150000,
        section80D: 25000,
        section80CCD1B: 50000,
        standardDeduction: 50000,
      };
      const result = calculator.calculateTaxOldRegime(1000000, deductions, false);
      // Total deductions: 2.75L
      // Taxable: 10L - 2.75L = 7.25L
      // Tax: 2.5L-5L = 12,500, 5L-7.25L = 45,000 = 57,500
      expect(result.taxableIncome).toBe(725000);
      expect(result.taxBeforeRebate).toBe(57500);
      expect(result.deductionsApplied).toBeDefined();
    });
  });

  describe('Senior Citizen Benefits (Old Regime)', () => {
    it('should apply ₹3,00,000 exemption for senior citizens (60-79)', () => {
      const deductions = {};
      const result = calculator.calculateTaxOldRegime(300000, deductions, true, 65);
      expect(result.taxBeforeRebate).toBe(0);
      expect(result.exemptionLimit).toBe(300000);
    });

    it('should apply ₹5,00,000 exemption for super seniors (80+)', () => {
      const deductions = {};
      const result = calculator.calculateTaxOldRegime(500000, deductions, true, 82);
      expect(result.taxBeforeRebate).toBe(0);
      expect(result.exemptionLimit).toBe(500000);
    });

    it('should not apply senior citizen benefit in new regime', () => {
      const result = calculator.calculateTaxNewRegime(300000, true, 65);
      expect(result.exemptionLimit).toBe(300000); // Same as regular
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const result = calculator.calculateTaxNewRegime(0, false);
      expect(result.totalTax).toBe(0);
    });

    it('should handle negative deductions gracefully', () => {
      const deductions = { section80C: -50000 };
      const result = calculator.calculateTaxOldRegime(500000, deductions, false);
      expect(result.taxableIncome).toBe(500000); // No reduction
    });

    it('should calculate cess on tax after rebate and surcharge', () => {
      const result = calculator.calculateTaxNewRegime(1000000, false);
      // Tax: 55,000, No rebate, No surcharge
      // Cess: 4% of 60,000 = 2,400
      // Total: 62,400
      expect(result.cess).toBe(2400);
      expect(result.totalTax).toBe(62400);
    });
  });
});
