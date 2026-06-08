import { describe, it, expect } from 'vitest';
import { TaxCalculator, calculate87ARebate, calculateSurchargeWithMarginalRelief, getSurchargeRate } from './tax-calculator';

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
      // Tax: 60,000, No rebate, No surcharge
      // Cess: 4% of 60,000 = 2,400
      // Total: 62,400
      expect(result.cess).toBe(2400);
      expect(result.totalTax).toBe(62400);
    });
  });
});

// ============================================================================
// Standalone function tests
// ============================================================================

describe('calculate87ARebate', () => {
  describe('Old regime (threshold=₹5L, max=₹12,500)', () => {
    it('gives full rebate at ₹4,90,000', () => {
      // Tax at 4.9L old: 2.5L-4.9L=2.4L@5%=12,000
      expect(calculate87ARebate(490000, 12000, 'old')).toBe(12000);
    });

    it('gives full rebate at exactly ₹5,00,000', () => {
      // Tax at 5L old: 2.5L-5L=2.5L@5%=12,500
      expect(calculate87ARebate(500000, 12500, 'old')).toBe(12500);
    });

    it('caps rebate at tax amount when tax < max', () => {
      // Tax at 3L old: 2.5L-3L=0.5L@5%=2,500
      expect(calculate87ARebate(300000, 2500, 'old')).toBe(2500);
    });

    it('applies marginal relief at ₹5,05,000', () => {
      // excess = 5,000, rebate = 12,500 - 5,000 = 7,500
      // tax at 5.05L: 2.5L-5L=12,500, 5L-5.05L=0.05L@5%=250, total=12,750
      // rebate capped at min(12750, 7500) = 7500
      expect(calculate87ARebate(505000, 12750, 'old')).toBe(7500);
    });

    it('applies marginal relief at ₹5,10,000', () => {
      // excess = 10,000, rebate = 12,500 - 10,000 = 2,500
      // tax at 5.1L: same as above + extra 5K@5%=250, total=13,000
      expect(calculate87ARebate(510000, 13000, 'old')).toBe(2500);
    });

    it('zero rebate at ₹5,12,501 (excess > maxRebate)', () => {
      // excess = 12,501, rebate = max(0, 12500-12501) = 0
      expect(calculate87ARebate(512501, 13125, 'old')).toBe(0);
    });
  });

  describe('New regime (threshold=₹7L, max=₹25,000)', () => {
    it('gives full rebate at ₹6,90,000', () => {
      // Tax: 3L-6L=3L@5%=15K, 6L-6.9L=0.9L@10%=9K, total=24,000
      expect(calculate87ARebate(690000, 24000, 'new')).toBe(24000);
    });

    it('gives full rebate at exactly ₹7,00,000', () => {
      // Tax: 3L-6L=15K, 6L-7L=1L@10%=10K, total=25,000
      expect(calculate87ARebate(700000, 25000, 'new')).toBe(25000);
    });

    it('applies marginal relief at ₹7,10,000', () => {
      // excess = 10,000, rebate = 25,000 - 10,000 = 15,000
      // tax: 3L-6L=15K, 6L-7.1L=1.1L@10%=11K, total=26,000
      expect(calculate87ARebate(710000, 26000, 'new')).toBe(15000);
    });

    it('applies marginal relief at ₹7,25,000', () => {
      // excess = 25,000, rebate = 25,000 - 25,000 = 0
      // tax: 3L-6L=15K, 6L-7.25L=1.25L@10%=12.5K, total=27,500
      expect(calculate87ARebate(725000, 27500, 'new')).toBe(0);
    });

    it('zero rebate at ₹8,00,000 (excess > maxRebate)', () => {
      // excess = 1L, rebate = max(0, 25000-100000) = 0
      expect(calculate87ARebate(800000, 30000, 'new')).toBe(0);
    });
  });
});

describe('getSurchargeRate', () => {
  it('0% at ₹50,00,000', () => {
    expect(getSurchargeRate(5000000)).toBe(0);
  });

  it('0% below ₹50,00,000', () => {
    expect(getSurchargeRate(4900000)).toBe(0);
  });

  it('10% at ₹50,00,001', () => {
    expect(getSurchargeRate(5000001)).toBe(0.10);
  });

  it('10% at ₹99,99,999', () => {
    expect(getSurchargeRate(9999999)).toBe(0.10);
  });

  it('15% at ₹1,00,00,000', () => {
    expect(getSurchargeRate(10000000)).toBe(0.15);
  });

  it('25% at ₹2,00,00,000', () => {
    expect(getSurchargeRate(20000000)).toBe(0.25);
  });

  it('37% at ₹5,00,00,000', () => {
    expect(getSurchargeRate(50000000)).toBe(0.37);
  });
});

describe('calculateSurchargeWithMarginalRelief', () => {
  it('zero surcharge below ₹50L', () => {
    expect(calculateSurchargeWithMarginalRelief(100000, 4000000)).toBe(0);
  });

  it('10% surcharge at ₹60L with no relief needed', () => {
    // Tax=1.5L, surcharge=15K, excess=10L, relief not triggered
    expect(calculateSurchargeWithMarginalRelief(150000, 6000000)).toBe(15000);
  });

  it('marginal relief triggers for income just above ₹50L', () => {
    // Tax at ₹51L ≈ 1,53,000, surcharge 10%=15,300
    // At ₹50L tax ≈ 1,50,000, total=1,50,000
    // excess=1L, totalAtCurrent-taxAtThreshold=1,68,300-1,50,000=18,300
    // 18,300 < 1,00,000 → no relief
    const surcharge = calculateSurchargeWithMarginalRelief(153000, 5100000);
    // Full 10% surcharge
    expect(surcharge).toBe(15300);
  });

  it('15% surcharge at ₹1.1Cr', () => {
    const surcharge = calculateSurchargeWithMarginalRelief(300000, 11000000);
    // Rate=0.15, surcharge=45,000
    expect(surcharge).toBe(45000);
  });

  it('25% surcharge at ₹2.1Cr', () => {
    const surcharge = calculateSurchargeWithMarginalRelief(600000, 21000000);
    // Rate=0.25, surcharge=1,50,000
    expect(surcharge).toBe(150000);
  });

  it('37% surcharge at ₹5.1Cr', () => {
    const surcharge = calculateSurchargeWithMarginalRelief(1500000, 51000000);
    // Rate=0.37, surcharge=5,55,000
    expect(surcharge).toBe(555000);
  });
});
