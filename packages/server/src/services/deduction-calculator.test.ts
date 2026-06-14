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

  describe('calculate80CCG', () => {
    it('allows 50% of RGESS investment up to ₹25,000', () => {
      const result = calculator.calculate80CCG(50000, true);
      expect(result.deductionAllowed).toBe(25000);
      expect(result.isFirstTimeClaim).toBe(true);
    });

    it('caps RGESS deduction at ₹25,000', () => {
      const result = calculator.calculate80CCG(100000, true);
      expect(result.deductionAllowed).toBe(25000);
    });

    it('zero deduction for second-time claim', () => {
      const result = calculator.calculate80CCG(50000, false);
      expect(result.deductionAllowed).toBe(0);
      expect(result.isFirstTimeClaim).toBe(false);
    });

    it('handles zero investment', () => {
      const result = calculator.calculate80CCG(0, true);
      expect(result.deductionAllowed).toBe(0);
    });
  });

  describe('calculate80U', () => {
    it('allows ₹75,000 for 40% disability', () => {
      const result = calculator.calculate80U(40);
      expect(result.deductionAllowed).toBe(75000);
    });

    it('allows ₹1,25,000 for severe disability (80%+)', () => {
      const result = calculator.calculate80U(80);
      expect(result.deductionAllowed).toBe(125000);
    });

    it('allows ₹1,25,000 for 100% disability', () => {
      const result = calculator.calculate80U(100);
      expect(result.deductionAllowed).toBe(125000);
    });

    it('zero deduction below 40% disability', () => {
      const result = calculator.calculate80U(30);
      expect(result.deductionAllowed).toBe(0);
    });
  });

  describe('calculate80DD', () => {
    it('allows ₹75,000 for dependent with 40% disability', () => {
      const result = calculator.calculate80DD(40);
      expect(result.deductionAllowed).toBe(75000);
    });

    it('allows ₹1,25,000 for dependent with severe disability (80%+)', () => {
      const result = calculator.calculate80DD(80);
      expect(result.deductionAllowed).toBe(125000);
    });

    it('zero deduction below 40% disability', () => {
      const result = calculator.calculate80DD(20);
      expect(result.deductionAllowed).toBe(0);
    });
  });

  describe('calculateChapterVIADeductions', () => {
    it('aggregates all deductions with proper caps', () => {
      const result = calculator.calculateChapterVIADeductions({
        section80C: 200000,
        section80CCD1B: 60000,
        section80D: { self: 30000, parents: 40000 },
        section80E: 100000,
        section80CCG: 50000,
        section80U: 125000,
        section80DD: 0,
        isSelfSenior: false,
        isParentsSenior: true,
      });

      // 80C: capped at 1.5L
      expect(result.section80C).toBe(150000);
      // 80CCD1B: capped at 50K
      expect(result.section80CCD1B).toBe(50000);
      // 80D: self capped at 25K, parents capped at 50K (senior)
      expect(result.section80D.self).toBe(25000);
      expect(result.section80D.parents).toBe(40000);
      expect(result.section80D.total).toBe(65000);
      // 80E: full
      expect(result.section80E).toBe(100000);
      // 80CCG: capped at 25K
      expect(result.section80CCG).toBe(25000);
      // 80U: full
      expect(result.section80U).toBe(125000);
      // total
      expect(result.total).toBe(150000 + 50000 + 65000 + 100000 + 25000 + 125000 + 0);
    });

    it('caps combined 80D at ₹1L when both senior', () => {
      const result = calculator.calculateChapterVIADeductions({
        section80C: 0,
        section80CCD1B: 0,
        section80D: { self: 60000, parents: 60000 },
        section80E: 0,
        section80CCG: 0,
        section80U: 0,
        section80DD: 0,
        isSelfSenior: true,
        isParentsSenior: true,
      });
      expect(result.section80D.self).toBe(50000);
      expect(result.section80D.parents).toBe(50000);
      expect(result.section80D.total).toBe(100000);
    });

    it('handles minimal deductions', () => {
      const result = calculator.calculateChapterVIADeductions({
        section80C: 0,
        section80CCD1B: 0,
        section80D: { self: 0, parents: 0 },
        section80E: 0,
        section80CCG: 0,
        section80U: 0,
        section80DD: 0,
      });
      expect(result.total).toBe(0);
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

  // ========================================================================
  // Property-based tests
  // ========================================================================

  describe('Deduction Calculator Property Tests', () => {
    it('80C deduction never exceeds ₹1,50,000', () => {
      for (const amount of [0, 100000, 150000, 200000, 500000]) {
        const r = calculator.calculate80C({ ppf: amount });
        expect(r.deductionAllowed).toBeLessThanOrEqual(150000);
        expect(r.deductionAllowed).toBeGreaterThanOrEqual(0);
      }
    });

    it('80C deduction is min(totalInvestment, 1.5L)', () => {
      expect(calculator.calculate80C({ ppf: 50000 }).deductionAllowed).toBe(50000);
      expect(calculator.calculate80C({ ppf: 150000 }).deductionAllowed).toBe(150000);
      expect(calculator.calculate80C({ ppf: 200000 }).deductionAllowed).toBe(150000);
      expect(calculator.calculate80C({ ppf: 50000, lic: 60000 }).deductionAllowed).toBe(110000);
    });

    it('80D self limit: ₹25K regular, ₹50K senior', () => {
      for (const premium of [0, 10000, 25000, 50000, 100000]) {
        const regular = calculator.calculate80D({ self: premium }, false, false);
        expect(regular.breakdown.self).toBeLessThanOrEqual(25000);
        const senior = calculator.calculate80D({ self: premium }, true, false);
        expect(senior.breakdown.self).toBeLessThanOrEqual(50000);
      }
    });

    it('80CCD1B capped at ₹50,000', () => {
      for (const contrib of [0, 5000, 50000, 100000]) {
        const r = calculator.calculate80CCD1B(contrib);
        expect(r.deductionAllowed).toBe(Math.min(contrib, 50000));
      }
    });

    it('80E deduction is allowed for 7 years from loan start', () => {
      for (const year of [1, 3, 7]) {
        const r = calculator.calculate80E(100000, year);
        expect(r.isEligible).toBe(true);
        expect(r.deductionAllowed).toBe(100000);
      }
      const after = calculator.calculate80E(100000, 8);
      expect(after.isEligible).toBe(false);
      expect(after.deductionAllowed).toBe(0);
    });

    it('80TTA capped at ₹10K, 80TTB capped at ₹50K', () => {
      for (const interest of [0, 5000, 10000, 50000]) {
        expect(calculator.calculate80TTA(interest, false).deductionAllowed)
          .toBe(Math.min(interest, 10000));
        expect(calculator.calculate80TTB(interest, true).deductionAllowed)
          .toBe(Math.min(interest, 50000));
      }
    });

    it('80G deduction never exceeds total donation', () => {
      const donations = [
        { name: 'Fund A', amount: 50000, rate: 100 },
        { name: 'Fund B', amount: 30000, rate: 50, subjectToLimit: true },
      ];
      const r = calculator.calculate80G(donations, 1000000);
      expect(r.deductionAllowed).toBeLessThanOrEqual(r.totalDonation);
    });

    it('80U and 80DD: ≥80% disability = ₹1,25,000, ≥40% = ₹75,000, <40% = ₹0', () => {
      expect(calculator.calculate80U(100).deductionAllowed).toBe(125000);
      expect(calculator.calculate80DD(90).deductionAllowed).toBe(125000);
      expect(calculator.calculate80U(50).deductionAllowed).toBe(75000);
      expect(calculator.calculate80DD(40).deductionAllowed).toBe(75000);
      expect(calculator.calculate80U(30).deductionAllowed).toBe(0);
      expect(calculator.calculate80DD(20).deductionAllowed).toBe(0);
    });

    it('total deductions from various sections sum correctly', () => {
      const r = calculator.calculateTotalDeductions({
        section80C: 100000,
        section80D: 25000,
        section80CCD1B: 50000,
        section80E: 80000,
        section80G: 15000,
        section80TTA: 10000,
      });
      expect(r.totalDeductions).toBe(100000 + 25000 + 50000 + 80000 + 15000 + 10000);
    });

    it('every deduction yields non-negative allowed amount', () => {
      expect(calculator.calculate80CCD1B(-50).deductionAllowed).toBeGreaterThanOrEqual(0);
      expect(calculator.calculate80E(-1000, 1).deductionAllowed).toBeGreaterThanOrEqual(0);
      expect(calculator.calculate80TTA(-100, false).deductionAllowed).toBeGreaterThanOrEqual(0);
      expect(calculator.calculate80TTB(-100, true).deductionAllowed).toBeGreaterThanOrEqual(0);
    });
  });
});
