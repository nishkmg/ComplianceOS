// @ts-nocheck
/**
 * Presumptive Scheme Service Tests
 * 
 * Tests for Sections 44AD, 44ADA, 44AE of Income Tax Act
 */

import { describe, it, expect } from 'vitest';
import {
  check44ADEligibility,
  check44ADAEligibility,
  check44AEEligibility,
  compute44ADIncome,
  compute44ADAINcome,
  compute44AEIncome,
  recommendScheme,
  getDeclarationText,
} from './presumptive-scheme-service';

describe('Section 44AD (Business)', () => {
  describe('check44ADEligibility', () => {
    it('eligible: turnover ≤ ₹2 crore, proprietorship', () => {
      const result = check44ADEligibility(1500000, 'trading', 'sole_proprietorship');
      expect(result.eligible).toBe(true);
      expect(result.reasons).toContain('Turnover within ₹2 crore limit');
    });

    it('eligible: turnover exactly ₹2 crore, partnership', () => {
      const result = check44ADEligibility(20000000, 'manufacturing', 'partnership');
      expect(result.eligible).toBe(true);
    });

    it('ineligible: turnover > ₹2 crore', () => {
      const result = check44ADEligibility(25000000, 'trading', 'sole_proprietorship');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Turnover exceeds ₹2 crore limit');
    });

    it('ineligible: LLP entity', () => {
      const result = check44ADEligibility(1000000, 'trading', 'llp');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Not available for LLPs');
    });

    it('ineligible: private limited company', () => {
      const result = check44ADEligibility(1000000, 'trading', 'private_limited');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Only for proprietorship and partnership firms');
    });

    it('ineligible: agency business', () => {
      const result = check44ADEligibility(1000000, 'agency', 'sole_proprietorship');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Agency business not eligible');
    });

    it('ineligible: commission/brokerage business', () => {
      const result = check44ADEligibility(1000000, 'commission', 'sole_proprietorship');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Commission/brokerage business not eligible');
    });

    it('ineligible: profession', () => {
      const result = check44ADEligibility(1000000, 'legal', 'sole_proprietorship');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Professions not eligible under 44AD');
    });
  });

  describe('compute44ADIncome', () => {
    it('8% rate: mixed receipts', () => {
      const result = compute44ADIncome(1000000, 400000);
      // 60% cash @ 8% + 40% digital @ 6% = 48000 + 24000 = 72000
      expect(result.presumptiveIncome).toBe(72000);
      expect(result.rate).toBeCloseTo(7.2);
    });

    it('6% rate: all digital receipts', () => {
      const result = compute44ADIncome(1000000, 1000000);
      expect(result.presumptiveIncome).toBe(60000); // 6% of 10L
      expect(result.rate).toBe(6);
    });

    it('digital receipts > turnover caps at turnover', () => {
      const result = compute44ADIncome(500000, 600000);
      expect(result.presumptiveIncome).toBe(30000); // 6% of 5L (capped)
      expect(result.rate).toBe(6);
    });

    it('zero turnover', () => {
      const result = compute44ADIncome(0, 0);
      expect(result.presumptiveIncome).toBe(0);
    });
  });
});

describe('Section 44ADA (Specified Profession)', () => {
  describe('check44ADAEligibility', () => {
    it('eligible: legal profession, receipts ≤ ₹50 lakh', () => {
      const result = check44ADAEligibility(3000000, 'legal');
      expect(result.eligible).toBe(true);
      expect(result.reasons).toContain('Gross receipts within ₹50 lakh limit');
    });

    it('eligible: medical profession', () => {
      const result = check44ADAEligibility(4000000, 'medical');
      expect(result.eligible).toBe(true);
    });

    it('eligible: engineering profession', () => {
      const result = check44ADAEligibility(2500000, 'engineering');
      expect(result.eligible).toBe(true);
    });

    it('eligible: architectural profession', () => {
      const result = check44ADAEligibility(3500000, 'architectural');
      expect(result.eligible).toBe(true);
    });

    it('eligible: accountancy profession', () => {
      const result = check44ADAEligibility(4500000, 'accountancy');
      expect(result.eligible).toBe(true);
    });

    it('eligible: technical consultancy', () => {
      const result = check44ADAEligibility(2000000, 'technical_consultancy');
      expect(result.eligible).toBe(true);
    });

    it('eligible: interior decoration', () => {
      const result = check44ADAEligibility(1500000, 'interior_decoration');
      expect(result.eligible).toBe(true);
    });

    it('ineligible: gross receipts > ₹50 lakh', () => {
      const result = check44ADAEligibility(5500000, 'legal');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Gross receipts exceed ₹50 lakh limit');
    });

    it('ineligible: non-specified profession (trading)', () => {
      const result = check44ADAEligibility(3000000, 'trading');
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Not a specified profession');
    });

    it('ineligible: manufacturing', () => {
      const result = check44ADAEligibility(3000000, 'manufacturing');
      expect(result.eligible).toBe(false);
    });
  });

  describe('compute44ADAINcome', () => {
    it('50% of gross receipts', () => {
      const result = compute44ADAINcome(2000000);
      expect(result.presumptiveIncome).toBe(1000000);
      expect(result.rate).toBe(50);
    });

    it('zero receipts', () => {
      const result = compute44ADAINcome(0);
      expect(result.presumptiveIncome).toBe(0);
    });

    it('exactly ₹50 lakh', () => {
      const result = compute44ADAINcome(5000000);
      expect(result.presumptiveIncome).toBe(2500000);
    });
  });
});

describe('Section 44AE (Transport Operators)', () => {
  describe('check44AEEligibility', () => {
    it('eligible: owns 5 goods carriages', () => {
      const result = check44AEEligibility(5, [
        { type: 'heavy_goods', count: 3 },
        { type: 'other', count: 2 },
      ]);
      expect(result.eligible).toBe(true);
    });

    it('eligible: owns exactly 10 goods carriages', () => {
      const result = check44AEEligibility(10, [
        { type: 'heavy_goods', count: 5 },
        { type: 'other', count: 5 },
      ]);
      expect(result.eligible).toBe(true);
    });

    it('ineligible: owns > 10 goods carriages', () => {
      const result = check44AEEligibility(12, [
        { type: 'heavy_goods', count: 6 },
        { type: 'other', count: 6 },
      ]);
      expect(result.eligible).toBe(false);
      expect(result.reasons).toContain('Owns more than 10 goods carriages');
    });

    it('ineligible: vehicle count mismatch', () => {
      const result = check44AEEligibility(5, [
        { type: 'heavy_goods', count: 10 },
      ]);
      expect(result.eligible).toBe(false);
      expect(result.reasons.join(' ')).toContain('Vehicle count mismatch');
    });
  });

  describe('compute44AEIncome', () => {
    it('heavy goods vehicle: ₹1000 per tonne per month', () => {
      const result = compute44AEIncome([
        { type: 'heavy_goods', tonnage: 10, months: 12 },
      ]);
      expect(result.presumptiveIncome).toBe(120000); // 1000 * 10 * 12
    });

    it('other vehicle: ₹7500 per month', () => {
      const result = compute44AEIncome([
        { type: 'other', months: 12 },
      ]);
      expect(result.presumptiveIncome).toBe(90000); // 7500 * 12
    });

    it('mixed fleet', () => {
      const result = compute44AEIncome([
        { type: 'heavy_goods', tonnage: 8, months: 6 },
        { type: 'other', months: 12 },
      ]);
      expect(result.presumptiveIncome).toBe(138000); // (1000*8*6) + (7500*12)
    });

    it('partial year ownership', () => {
      const result = compute44AEIncome([
        { type: 'other', months: 4 },
      ]);
      expect(result.presumptiveIncome).toBe(30000); // 7500 * 4
    });

    it('zero vehicles', () => {
      const result = compute44AEIncome([]);
      expect(result.presumptiveIncome).toBe(0);
    });
  });
});

describe('recommendScheme', () => {
  it('recommends 44AD for trading business', () => {
    const result = recommendScheme('trading', 1500000, undefined, 'sole_proprietorship');
    expect(result.recommendedScheme).toBe('44AD');
    expect(result.reason).toContain('Business income');
  });

  it('recommends 44ADA for legal profession', () => {
    const result = recommendScheme('legal', 3000000, 'legal', 'sole_proprietorship');
    expect(result.recommendedScheme).toBe('44ADA');
    expect(result.reason).toContain('Specified profession');
  });

  it('recommends 44AE for transport operator', () => {
    const result = recommendScheme('transport', 2000000, undefined, 'sole_proprietorship', 5);
    expect(result.recommendedScheme).toBe('44AE');
    expect(result.reason).toContain('Goods carriage operator');
  });

  it('no scheme for ineligible business', () => {
    const result = recommendScheme('manufacturing', 30000000, undefined, 'sole_proprietorship');
    expect(result.recommendedScheme).toBe(null);
    expect(result.reason).toContain('Not eligible');
  });

  it('44AD not available for LLP', () => {
    const result = recommendScheme('trading', 1500000, undefined, 'llp');
    expect(result.recommendedScheme).toBe(null);
    expect(result.reason).toContain('LLPs not eligible');
  });
});

describe('getDeclarationText', () => {
  it('returns ITR declaration for 44AD', () => {
    const text = getDeclarationText('44AD');
    expect(text).toContain('Section 44AD');
    expect(text).toContain('8%');
    expect(text).toContain('6%');
  });

  it('returns ITR declaration for 44ADA', () => {
    const text = getDeclarationText('44ADA');
    expect(text).toContain('Section 44ADA');
    expect(text).toContain('50%');
  });

  it('returns ITR declaration for 44AE', () => {
    const text = getDeclarationText('44AE');
    expect(text).toContain('Section 44AE');
    expect(text).toContain('per tonne per month');
  });

  it('throws for invalid scheme', () => {
    expect(() => getDeclarationText('invalid')).toThrow('Invalid scheme');
  });
});
