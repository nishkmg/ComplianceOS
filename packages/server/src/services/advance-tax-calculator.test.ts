// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { AdvanceTaxCalculator } from './advance-tax-calculator';

describe('AdvanceTaxCalculator', () => {
  const calculator = new AdvanceTaxCalculator();

  describe('calculateAdvanceTax', () => {
    it('should calculate net advance tax payable after TDS credit', () => {
      const result = calculator.calculateAdvanceTax(100000, 40000);
      expect(result.netAdvanceTax).toBe(60000);
      expect(result.totalTaxLiability).toBe(100000);
      expect(result.tdsCredit).toBe(40000);
    });

    it('should return zero when TDS exceeds tax liability', () => {
      const result = calculator.calculateAdvanceTax(50000, 60000);
      expect(result.netAdvanceTax).toBe(0);
    });

    it('should handle zero TDS', () => {
      const result = calculator.calculateAdvanceTax(80000, 0);
      expect(result.netAdvanceTax).toBe(80000);
    });
  });

  describe('getInstallmentSchedule', () => {
    it('should split advance tax into 4 installments with correct percentages', () => {
      const schedule = calculator.getInstallmentSchedule(100000);
      
      expect(schedule).toHaveLength(4);
      expect(schedule[0]).toMatchObject({
        installment: 1,
        dueDate: '15 June',
        payablePercent: 15,
        amount: 15000,
        cumulativeAmount: 15000,
      });
      expect(schedule[1]).toMatchObject({
        installment: 2,
        dueDate: '15 September',
        payablePercent: 45,
        amount: 30000,
        cumulativeAmount: 45000,
      });
      expect(schedule[2]).toMatchObject({
        installment: 3,
        dueDate: '15 December',
        payablePercent: 75,
        amount: 30000,
        cumulativeAmount: 75000,
      });
      expect(schedule[3]).toMatchObject({
        installment: 4,
        dueDate: '15 March',
        payablePercent: 100,
        amount: 25000,
        cumulativeAmount: 100000,
      });
    });

    it('should calculate remaining amounts for each installment', () => {
      const schedule = calculator.getInstallmentSchedule(100000);
      
      expect(schedule[0].remainingAmount).toBe(85000);
      expect(schedule[1].remainingAmount).toBe(55000);
      expect(schedule[2].remainingAmount).toBe(25000);
      expect(schedule[3].remainingAmount).toBe(0);
    });

    it('should handle fractional amounts with rounding', () => {
      const schedule = calculator.getInstallmentSchedule(100001);
      
      expect(schedule[0].amount).toBe(15000);
      expect(schedule[1].amount).toBe(30000);
      expect(schedule[2].amount).toBe(30001);
      expect(schedule[3].amount).toBe(25000);
    });
  });

  describe('calculateInterest234B', () => {
    it('should calculate 1% per month interest on unpaid tax', () => {
      const interest = calculator.calculateInterest234C(50000, 3);
      expect(interest).toBe(1500);
    });

    it('should round up part of month as full month', () => {
      const interest = calculator.calculateInterest234B(50000, 3.5);
      expect(interest).toBe(2000); // 4 months @ 1% = 2000
    });

    it('should handle zero unpaid tax', () => {
      const interest = calculator.calculateInterest234B(0, 3);
      expect(interest).toBe(0);
    });

    it('should handle zero months delayed', () => {
      const interest = calculator.calculateInterest234B(50000, 0);
      expect(interest).toBe(0);
    });
  });

  describe('calculateInterest234C', () => {
    it('should calculate 1% per month interest on deferment', () => {
      const interest = calculator.calculateInterest234C(30000, 2);
      expect(interest).toBe(600);
    });

    it('should round up part of month as full month', () => {
      const interest = calculator.calculateInterest234C(30000, 2.3);
      expect(interest).toBe(900); // 3 months @ 1% = 900
    });

    it('should handle zero shortfall', () => {
      const interest = calculator.calculateInterest234C(0, 3);
      expect(interest).toBe(0);
    });
  });

  describe('checkMandatory', () => {
    it('should return true when tax liability after TDS >= ₹10,000', () => {
      const result = calculator.checkMandatory(800000, 15000);
      expect(result.isMandatory).toBe(true);
      expect(result.reason).toContain('₹10,000');
    });

    it('should return false when tax liability after TDS < ₹10,000', () => {
      const result = calculator.checkMandatory(500000, 5000);
      expect(result.isMandatory).toBe(false);
    });

    it('should return false for senior citizens (Section 207)', () => {
      const result = calculator.checkMandatory(800000, 15000, true, 67);
      expect(result.isMandatory).toBe(false);
      expect(result.reason).toContain('Senior citizen');
    });

    it('should return false for non-senior citizen below 60', () => {
      const result = calculator.checkMandatory(800000, 15000, false, 45);
      expect(result.isMandatory).toBe(true);
    });
  });

  describe('getInstallmentDueDates', () => {
    it('should return correct due dates for FY 2026-27', () => {
      const dates = calculator.getInstallmentDueDates('2026-27');
      
      expect(dates).toEqual({
        first: expect.stringContaining('2026-06-15'),
        second: expect.stringContaining('2026-09-15'),
        third: expect.stringContaining('2026-12-15'),
        fourth: expect.stringContaining('2027-03-15'),
      });
    });
  });

  describe('calculateShortfall', () => {
    it('should calculate shortfall for each installment', () => {
      const totalAdvanceTax = 100000;
      const schedule = calculator.getInstallmentSchedule(totalAdvanceTax);
      
      // Paid 10000 in first installment (should be 15000 cumulative)
      const shortfall1 = calculator.calculateShortfall(schedule[0], 10000, 0);
      expect(shortfall1).toBe(5000);
      
      // Paid 30000 in second installment (should be 45000 cumulative, had 10000 before)
      const shortfall2 = calculator.calculateShortfall(schedule[1], 30000, 10000);
      expect(shortfall2).toBe(5000);
    });
  });
});
