import { describe, it, expect } from 'vitest';
import { DeductionCalculator } from './deduction-calculator';

describe('DeductionCalculator', () => {
  const calculator = new DeductionCalculator();

  describe('calculate80C', () => {
    it('should calculate total 80C investments within limit', () => {
      const investments = {
        ppf: 100000,
        lic: 30000,
        elss: 50000,
        nsc: 20000,
        homeLoanPrincipal: 30000,
      };
      
      const result = calculator.calculate80C(investments);
      expect(result.totalInvestment).toBe(230000);
      expect(result.deductionAllowed).toBe(150000);
      expect(result.excessAmount).toBe(80000);
    });

    it('should cap deduction at ₹1,50,000', () => {
      const investments = {
        ppf: 200000,
        lic: 50000,
      };
      
      const result = calculator.calculate80C(investments);
      expect(result.deductionAllowed).toBe(150000);
      expect(result.excessAmount).toBe(100000);
    });

    it('should handle zero investments', () => {
      const investments = {};
      
      const result = calculator.calculate80C(investments);
      expect(result.totalInvestment).toBe(0);
      expect(result.deductionAllowed).toBe(0);
      expect(result.excessAmount).toBe(0);
    });

    it('should include all 80C eligible items', () => {
      const investments = {
        ppf: 50000,
        lic: 25000,
        elss: 30000,
        nsc: 25000,
        homeLoanPrincipal: 20000,
        tuitionFees: 30000,
        sukanyaSamriddhi: 50000,
        fiveYearTermDeposit: 20000,
      };
      
      const result = calculator.calculate80C(investments);
      expect(result.totalInvestment).toBe(250000);
      expect(result.deductionAllowed).toBe(150000);
    });
  });

  describe('calculate80D', () => {
    it('should calculate medical insurance premium for individual below 60', () => {
      const premiums = {
        self: 20000,
        spouse: 15000,
        children: 10000,
      };
      
      const result = calculator.calculate80D(premiums, false, false);
      // self field includes self + spouse + children
      expect(result.totalPremium).toBe(45000);
      expect(result.deductionAllowed).toBe(25000);
    });

    it('should allow ₹50,000 for senior citizen parent', () => {
      const premiums = {
        self: 25000,
        parents: 40000,
      };
      
      const result = calculator.calculate80D(premiums, false, true);
      // Self: 25K (within 25K limit), Parents (senior): 40K (within 50K limit)
      expect(result.deductionAllowed).toBe(65000);
      expect(result.breakdown.self).toBe(25000);
      expect(result.breakdown.parents).toBe(40000);
    });

    it('should allow ₹1,00,000 when both self and parents are senior citizens', () => {
      const premiums = {
        self: 40000,
        parents: 60000,
      };
      
      const result = calculator.calculate80D(premiums, true, true);
      // Self (senior): 40K (within 50K), Parents (senior): 60K (capped at 50K)
      expect(result.deductionAllowed).toBe(90000);
    });

    it('should include preventive health checkup up to ₹5,000', () => {
      const premiums = {
        self: 20000,
        preventiveHealthCheckup: 5000,
      };
      
      const result = calculator.calculate80D(premiums, false, false);
      expect(result.totalPremium).toBe(25000);
      expect(result.deductionAllowed).toBe(25000);
    });

    it('should cap preventive health checkup at ₹5,000 within overall limit', () => {
      const premiums = {
        self: 22000,
        preventiveHealthCheckup: 8000,
      };
      
      const result = calculator.calculate80D(premiums, false, false);
      // Premium 22K + checkup 5K (capped) = 27K, but overall limit 25K
      expect(result.deductionAllowed).toBe(25000);
    });

    it('should handle zero premiums', () => {
      const premiums = {};
      
      const result = calculator.calculate80D(premiums, false, false);
      expect(result.totalPremium).toBe(0);
      expect(result.deductionAllowed).toBe(0);
    });
  });

  describe('calculate80CCD1B', () => {
    it('should calculate additional NPS deduction up to ₹50,000', () => {
      const result = calculator.calculate80CCD1B(50000);
      expect(result.contribution).toBe(50000);
      expect(result.deductionAllowed).toBe(50000);
    });

    it('should cap additional NPS at ₹50,000', () => {
      const result = calculator.calculate80CCD1B(75000);
      expect(result.contribution).toBe(75000);
      expect(result.deductionAllowed).toBe(50000);
      expect(result.excessAmount).toBe(25000);
    });

    it('should handle zero contribution', () => {
      const result = calculator.calculate80CCD1B(0);
      expect(result.deductionAllowed).toBe(0);
    });
  });

  describe('calculate80E', () => {
    it('should allow full education loan interest with no upper limit', () => {
      const result = calculator.calculate80E(150000, 3);
      expect(result.interestPaid).toBe(150000);
      expect(result.deductionAllowed).toBe(150000);
      expect(result.remainingYears).toBe(5);
    });

    it('should return zero deduction after 8 years', () => {
      const result = calculator.calculate80E(100000, 9);
      expect(result.deductionAllowed).toBe(0);
      expect(result.isEligible).toBe(false);
    });

    it('should handle zero interest', () => {
      const result = calculator.calculate80E(0, 3);
      expect(result.deductionAllowed).toBe(0);
    });
  });

  describe('calculate80G', () => {
    it('should calculate 100% donation deduction', () => {
      const donations = [
        { name: 'PMNRF', amount: 50000, rate: 100 },
      ];
      
      const result = calculator.calculate80G(donations, 500000);
      expect(result.totalDonation).toBe(50000);
      expect(result.deductionAllowed).toBe(50000);
    });

    it('should calculate 50% donation deduction', () => {
      const donations = [
        { name: 'CM Relief Fund', amount: 40000, rate: 50 },
      ];
      
      const result = calculator.calculate80G(donations, 500000);
      expect(result.deductionAllowed).toBe(20000);
    });

    it('should apply 10% of adjusted gross total income limit for certain donations', () => {
      const donations = [
        { name: 'Temple', amount: 200000, rate: 50, subjectToLimit: true },
      ];
      
      const result = calculator.calculate80G(donations, 500000);
      // 10% of 5L = 50K, 50% of 2L = 1L, so capped at 50K
      expect(result.deductionAllowed).toBe(50000);
    });

    it('should handle mixed donations', () => {
      const donations = [
        { name: 'PMNRF', amount: 30000, rate: 100 },
        { name: 'CM Relief Fund', amount: 40000, rate: 50 },
      ];
      
      const result = calculator.calculate80G(donations, 1000000);
      expect(result.totalDonation).toBe(70000);
      expect(result.deductionAllowed).toBe(50000); // 30K + 20K
    });
  });

  describe('calculate80TTA', () => {
    it('should allow savings interest deduction up to ₹10,000 for individuals', () => {
      const result = calculator.calculate80TTA(8000, false);
      expect(result.deductionAllowed).toBe(8000);
    });

    it('should cap savings interest at ₹10,000', () => {
      const result = calculator.calculate80TTA(15000, false);
      expect(result.deductionAllowed).toBe(10000);
    });

    it('should not apply for senior citizens (use 80TTB instead)', () => {
      const result = calculator.calculate80TTA(15000, true);
      expect(result.deductionAllowed).toBe(0);
      expect(result.isEligible).toBe(false);
    });
  });

  describe('calculate80TTB', () => {
    it('should allow interest income deduction up to ₹50,000 for senior citizens', () => {
      const result = calculator.calculate80TTB(40000, true);
      expect(result.deductionAllowed).toBe(40000);
    });

    it('should cap at ₹50,000 for senior citizens', () => {
      const result = calculator.calculate80TTB(75000, true);
      expect(result.deductionAllowed).toBe(50000);
    });

    it('should not apply for non-senior citizens', () => {
      const result = calculator.calculate80TTB(50000, false);
      expect(result.deductionAllowed).toBe(0);
      expect(result.isEligible).toBe(false);
    });
  });

  describe('calculateTotalDeductions', () => {
    it('should sum all eligible deductions', () => {
      const deductions = {
        section80C: 150000,
        section80D: 25000,
        section80CCD1B: 50000,
        section80E: 30000,
        section80G: 20000,
        section80TTA: 10000,
      };
      
      const result = calculator.calculateTotalDeductions(deductions);
      expect(result.totalDeductions).toBe(285000);
    });

    it('should handle partial deductions', () => {
      const deductions = {
        section80C: 100000,
        section80D: 15000,
      };
      
      const result = calculator.calculateTotalDeductions(deductions);
      expect(result.totalDeductions).toBe(115000);
    });

    it('should handle empty deductions', () => {
      const deductions = {};
      
      const result = calculator.calculateTotalDeductions(deductions);
      expect(result.totalDeductions).toBe(0);
    });
  });

  describe('validateDeductions', () => {
    it('should return valid for legitimate deductions', () => {
      const deductions = {
        section80C: 150000,
        section80D: 25000,
        section80CCD1B: 50000,
      };
      
      const result = calculator.validateDeductions(deductions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should flag excess 80C deduction', () => {
      const deductions = {
        section80C: 200000,
      };
      
      const result = calculator.validateDeductions(deductions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('80C')
      );
    });

    it('should flag negative values', () => {
      const deductions = {
        section80C: -50000,
      };
      
      const result = calculator.validateDeductions(deductions);
      expect(result.isValid).toBe(false);
    });
  });
});
