import { describe, it, expect, vi } from 'vitest';
import {
  utilizeITC,
  getCashLedgerBalance,
  getITCLedgerBalance,
  getLiabilityBalance,
  recordITCAddition,
  recordITCReversal,
  recordGSTPayment,
  recordITCUtilization,
  recordGSTLiability,
  recordTaxPayment,
} from '../services/gst-ledger-service';
import type { ITCBalance, Liability, TaxType } from '../services/gst-ledger-service';
import { GSTTaxType } from '@complianceos/shared';

// Mock the database
vi.mock('@complianceos/db', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    db: {
      query: {
        gstCashLedger: {
          findMany: vi.fn().mockResolvedValue([]),
        },
        gstItcLedger: {
          findMany: vi.fn().mockResolvedValue([]),
        },
        gstLiabilityLedger: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
        }),
      }),
    },
  };
});

describe('GST Ledger Service', () => {
  describe('utilizeITC - Section 49 Order', () => {
    it('should utilize IGST ITC for IGST liability first', () => {
      const liability: Liability = { igst: 1000, cgst: 0, sgst: 0, cess: 0 };
      const itcBalances: ITCBalance = { igst: 1500, cgst: 0, sgst: 0, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      expect(result.success).toBe(true);
      expect(result.utilized.igst).toBe(1000);
      expect(result.remaining.igst).toBe(500);
      expect(result.shortfall.igst).toBe(0);
    });

    it('should use CGST ITC for remaining IGST liability after IGST ITC exhausted', () => {
      const liability: Liability = { igst: 1000, cgst: 0, sgst: 0, cess: 0 };
      const itcBalances: ITCBalance = { igst: 400, cgst: 800, sgst: 0, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      // utilized tracks ITC type used, not liability paid
      // 400 IGST ITC used + 600 CGST ITC used = 1000 IGST liability paid
      expect(result.success).toBe(true);
      expect(result.utilized.igst).toBe(400); // IGST ITC used
      expect(result.utilized.cgst).toBe(600); // CGST ITC used
      expect(result.remaining.igst).toBe(0);
      expect(result.remaining.cgst).toBe(200);
      expect(result.shortfall.igst).toBe(0);
      expect(result.liabilityPaid.igst).toBe(1000); // Total IGST liability paid
    });

    it('should use SGST ITC for remaining IGST liability after IGST+CGST exhausted', () => {
      const liability: Liability = { igst: 1000, cgst: 0, sgst: 0, cess: 0 };
      const itcBalances: ITCBalance = { igst: 300, cgst: 400, sgst: 500, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      // 300 IGST ITC + 400 CGST ITC + 300 SGST ITC = 1000 IGST liability paid
      expect(result.success).toBe(true);
      expect(result.utilized.igst).toBe(300); // IGST ITC used
      expect(result.utilized.cgst).toBe(400); // CGST ITC used
      expect(result.utilized.sgst).toBe(300); // SGST ITC used
      expect(result.remaining.sgst).toBe(200);
      expect(result.shortfall.igst).toBe(0);
      expect(result.liabilityPaid.igst).toBe(1000);
    });

    it('should record shortfall when ITC insufficient for IGST liability', () => {
      const liability: Liability = { igst: 1000, cgst: 0, sgst: 0, cess: 0 };
      const itcBalances: ITCBalance = { igst: 200, cgst: 300, sgst: 400, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      expect(result.success).toBe(false);
      expect(result.utilized.igst).toBe(200);
      expect(result.utilized.cgst).toBe(300);
      expect(result.utilized.sgst).toBe(400);
      expect(result.shortfall.igst).toBe(100); // 1000 - 900
      expect(result.remaining.igst).toBe(0);
      expect(result.remaining.cgst).toBe(0);
      expect(result.remaining.sgst).toBe(0);
    });

    it('should use CGST ITC ONLY for CGST liability (cannot use SGST)', () => {
      const liability: Liability = { igst: 0, cgst: 1000, sgst: 0, cess: 0 };
      const itcBalances: ITCBalance = { igst: 0, cgst: 600, sgst: 800, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      expect(result.success).toBe(false);
      expect(result.utilized.cgst).toBe(600);
      expect(result.remaining.cgst).toBe(0);
      expect(result.remaining.sgst).toBe(800); // SGST cannot be used for CGST
      expect(result.shortfall.cgst).toBe(400);
    });

    it('should use SGST ITC ONLY for SGST liability (cannot use CGST)', () => {
      const liability: Liability = { igst: 0, cgst: 0, sgst: 1000, cess: 0 };
      const itcBalances: ITCBalance = { igst: 0, cgst: 800, sgst: 600, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      expect(result.success).toBe(false);
      expect(result.utilized.sgst).toBe(600);
      expect(result.remaining.cgst).toBe(800); // CGST cannot be used for SGST
      expect(result.remaining.sgst).toBe(0);
      expect(result.shortfall.sgst).toBe(400);
    });

    it('should handle complex scenario with all three liabilities', () => {
      const liability: Liability = { igst: 1500, cgst: 800, sgst: 600, cess: 0 };
      const itcBalances: ITCBalance = { igst: 1000, cgst: 500, sgst: 400, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      // IGST liability: 1500
      // - Use IGST ITC: 1000 → remaining IGST liability: 500
      // - Use CGST ITC: 500 → remaining IGST liability: 0, CGST ITC remaining: 0
      expect(result.utilized.igst).toBe(1000);
      expect(result.utilized.cgst).toBe(500);
      expect(result.utilized.sgst).toBe(400); // SGST ITC used for SGST liability

      // CGST liability: 800, no CGST ITC left
      expect(result.shortfall.cgst).toBe(800);
      expect(result.remaining.cgst).toBe(0);

      // SGST liability: 600
      // - Use SGST ITC: 400 → remaining SGST liability: 200
      expect(result.shortfall.sgst).toBe(200);
      expect(result.remaining.sgst).toBe(0);
      expect(result.utilized.sgst).toBe(400);

      expect(result.success).toBe(false);
    });

    it('should fully pay all liabilities with sufficient ITC', () => {
      const liability: Liability = { igst: 500, cgst: 300, sgst: 200, cess: 0 };
      const itcBalances: ITCBalance = { igst: 1000, cgst: 500, sgst: 400, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      expect(result.success).toBe(true);
      expect(result.utilized.igst).toBe(500);
      expect(result.utilized.cgst).toBe(300);
      expect(result.utilized.sgst).toBe(200);
      expect(result.remaining.igst).toBe(500);
      expect(result.remaining.cgst).toBe(200);
      expect(result.remaining.sgst).toBe(200);
      expect(result.shortfall.igst).toBe(0);
      expect(result.shortfall.cgst).toBe(0);
      expect(result.shortfall.sgst).toBe(0);
    });

    it('should handle zero liability', () => {
      const liability: Liability = { igst: 0, cgst: 0, sgst: 0, cess: 0 };
      const itcBalances: ITCBalance = { igst: 1000, cgst: 500, sgst: 400, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      expect(result.success).toBe(true);
      expect(result.utilized.igst).toBe(0);
      expect(result.utilized.cgst).toBe(0);
      expect(result.utilized.sgst).toBe(0);
      expect(result.remaining.igst).toBe(1000);
      expect(result.remaining.cgst).toBe(500);
      expect(result.remaining.sgst).toBe(400);
    });

    it('should handle zero ITC balances', () => {
      const liability: Liability = { igst: 500, cgst: 300, sgst: 200, cess: 0 };
      const itcBalances: ITCBalance = { igst: 0, cgst: 0, sgst: 0, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      expect(result.success).toBe(false);
      expect(result.utilized.igst).toBe(0);
      expect(result.utilized.cgst).toBe(0);
      expect(result.utilized.sgst).toBe(0);
      expect(result.shortfall.igst).toBe(500);
      expect(result.shortfall.cgst).toBe(300);
      expect(result.shortfall.sgst).toBe(200);
    });

    it('should prioritize IGST ITC correctly in multi-liability scenario', () => {
      const liability: Liability = { igst: 100, cgst: 500, sgst: 300, cess: 0 };
      const itcBalances: ITCBalance = { igst: 200, cgst: 100, sgst: 100, cess: 0 };

      const result = utilizeITC(liability, itcBalances);

      // IGST liability: 100
      // - Use IGST ITC: 100 → remaining IGST ITC: 100
      expect(result.utilized.igst).toBe(100);
      expect(result.remaining.igst).toBe(100);

      // CGST liability: 500
      // - Use remaining IGST ITC: 0 (IGST ITC only for IGST liability)
      // - Use CGST ITC: 100 → remaining CGST liability: 400
      expect(result.utilized.cgst).toBe(100);
      expect(result.shortfall.cgst).toBe(400);

      // SGST liability: 300
      // - Use SGST ITC: 100 → remaining SGST liability: 200
      expect(result.utilized.sgst).toBe(100);
      expect(result.shortfall.sgst).toBe(200);

      expect(result.success).toBe(false);
    });
  });

  describe('recordITCAddition', () => {
    it('should record ITC addition successfully', async () => {
      const result = await recordITCAddition(
        'tenant-1',
        GSTTaxType.IGST,
        1000,
        4,
        2026,
        'inv-123',
        'fy-2026-27',
        'user-1'
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-id');
    });

    it('should handle different tax types', async () => {
      const cgstResult = await recordITCAddition(
        'tenant-1',
        GSTTaxType.CGST,
        500,
        4,
        2026,
        'inv-124',
        'fy-2026-27',
        'user-1'
      );
      expect(cgstResult.success).toBe(true);

      const sgstResult = await recordITCAddition(
        'tenant-1',
        GSTTaxType.SGST,
        500,
        4,
        2026,
        'inv-125',
        'fy-2026-27',
        'user-1'
      );
      expect(sgstResult.success).toBe(true);
    });
  });

  describe('recordITCReversal', () => {
    it('should record ITC reversal successfully', async () => {
      const result = await recordITCReversal(
        'tenant-1',
        GSTTaxType.IGST,
        200,
        5,
        2026,
        'Non-payment within 180 days',
        'fy-2026-27',
        'user-1'
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-id');
    });

    it('should handle different reversal reasons', async () => {
      const reasons = [
        'Exempt supplies',
        'Blocked credits under Section 17(5)',
        'Invoice not matching in GSTR-2A',
      ];

      for (const reason of reasons) {
        const result = await recordITCReversal(
          'tenant-1',
          GSTTaxType.CGST,
          100,
          5,
          2026,
          reason,
          'fy-2026-27',
          'user-1'
        );
        expect(result.success).toBe(true);
      }
    });
  });

  describe('recordGSTPayment', () => {
    it('should record GST payment successfully', async () => {
      const result = await recordGSTPayment(
        'tenant-1',
        GSTTaxType.IGST,
        1500,
        'challan-123',
        'NEFT',
        'fy-2026-27',
        'user-1',
        4,
        2026
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-id');
    });

    it('should handle different payment modes', async () => {
      const modes = ['NEFT', 'RTGS', 'UPI', 'Credit Card', 'Debit Card'];

      for (const mode of modes) {
        const result = await recordGSTPayment(
          'tenant-1',
          GSTTaxType.CGST,
          500,
          `challan-${mode}`,
          mode,
          'fy-2026-27',
          'user-1',
          4,
          2026
        );
        expect(result.success).toBe(true);
      }
    });
  });

  describe('recordITCUtilization', () => {
    it('should record ITC utilization successfully', async () => {
      const result = await recordITCUtilization(
        'tenant-1',
        GSTTaxType.IGST,
        1000,
        4,
        2026,
        'fy-2026-27',
        'user-1',
        'challan-123'
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-id');
    });
  });

  describe('recordGSTLiability', () => {
    it('should record GST liability successfully', async () => {
      const result = await recordGSTLiability(
        'tenant-1',
        GSTTaxType.IGST,
        'output',
        2000,
        4,
        2026,
        'fy-2026-27',
        'user-1',
        'inv-456',
        'INV-2026-001'
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-id');
    });
  });

  describe('recordTaxPayment', () => {
    it('should record tax payment successfully', async () => {
      const result = await recordTaxPayment(
        'tenant-1',
        GSTTaxType.CGST,
        1500,
        4,
        2026,
        'fy-2026-27',
        'user-1',
        'challan-789',
        'payment'
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-id');
    });
  });

  describe('getCashLedgerBalance', () => {
    it('should return cash ledger balance structure', async () => {
      const result = await getCashLedgerBalance('tenant-1');

      expect(result).toHaveProperty('balance');
      expect(result.balance).toHaveProperty('igst');
      expect(result.balance).toHaveProperty('cgst');
      expect(result.balance).toHaveProperty('sgst');
      expect(result.balance).toHaveProperty('cess');
      expect(result).toHaveProperty('transactions');
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    it('should filter by period when provided', async () => {
      const result = await getCashLedgerBalance('tenant-1', 4, 2026);

      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('transactions');
    });
  });

  describe('getITCLedgerBalance', () => {
    it('should return ITC ledger balance structure', async () => {
      const result = await getITCLedgerBalance('tenant-1', GSTTaxType.IGST);

      expect(result).toHaveProperty('opening');
      expect(result).toHaveProperty('additions');
      expect(result).toHaveProperty('reversals');
      expect(result).toHaveProperty('utilized');
      expect(result).toHaveProperty('closing');
      expect(result).toHaveProperty('transactions');
    });

    it('should calculate closing balance correctly', async () => {
      const result = await getITCLedgerBalance('tenant-1', GSTTaxType.CGST, 4, 2026);

      expect(typeof result.opening).toBe('number');
      expect(typeof result.additions).toBe('number');
      expect(typeof result.reversals).toBe('number');
      expect(typeof result.utilized).toBe('number');
      expect(typeof result.closing).toBe('number');
    });
  });

  describe('getLiabilityBalance', () => {
    it('should return liability balance structure', async () => {
      const result = await getLiabilityBalance('tenant-1', GSTTaxType.IGST);

      expect(result).toHaveProperty('opening');
      expect(result).toHaveProperty('taxPayable');
      expect(result).toHaveProperty('taxPaid');
      expect(result).toHaveProperty('closing');
    });

    it('should calculate closing balance correctly', async () => {
      const result = await getLiabilityBalance('tenant-1', GSTTaxType.SGST, 4, 2026);

      expect(typeof result.opening).toBe('number');
      expect(typeof result.taxPayable).toBe('number');
      expect(typeof result.taxPaid).toBe('number');
      expect(typeof result.closing).toBe('number');
    });
  });
});

describe('ITC Utilization Edge Cases', () => {
  it('should handle large numbers accurately', () => {
    const liability: Liability = { igst: 10000000, cgst: 5000000, sgst: 5000000, cess: 0 };
    const itcBalances: ITCBalance = { igst: 8000000, cgst: 3000000, sgst: 3000000, cess: 0 };

    const result = utilizeITC(liability, itcBalances);

    // IGST: 10M liability
    // - Use 8M IGST ITC → remaining IGST: 2M
    // - Use 2M CGST ITC → remaining IGST: 0, remaining CGST ITC: 1M
    // CGST: 5M liability
    // - Use 1M remaining CGST ITC → remaining CGST: 4M
    expect(result.utilized.igst).toBe(8000000); // IGST ITC used
    expect(result.utilized.cgst).toBe(3000000); // CGST ITC used (2M for IGST + 1M for CGST)
    expect(result.remaining.cgst).toBe(0);
    expect(result.shortfall.cgst).toBe(4000000);
    
    // SGST: 5M liability, use 3M SGST ITC
    expect(result.utilized.sgst).toBe(3000000);
    expect(result.remaining.sgst).toBe(0);
    expect(result.shortfall.sgst).toBe(2000000);
  });

  it('should handle decimal amounts', () => {
    const liability: Liability = { igst: 1000.5, cgst: 500.25, sgst: 250.75, cess: 0 };
    const itcBalances: ITCBalance = { igst: 600.5, cgst: 300.25, sgst: 200.75, cess: 0 };

    const result = utilizeITC(liability, itcBalances);

    // IGST: 1000.5
    // - Use 600.5 IGST ITC → remaining: 400
    // - Use 300.25 CGST ITC → remaining: 99.75
    // - Use 99.75 SGST ITC → remaining IGST: 0, remaining SGST ITC: 101
    // CGST: 500.25 liability, no CGST ITC left → shortfall 500.25
    // SGST: 250.75 liability, use 101 SGST ITC → shortfall 149.75
    expect(result.utilized.igst).toBe(600.5);
    expect(result.utilized.cgst).toBe(300.25);
    expect(result.utilized.sgst).toBe(200.75); // 99.75 for IGST + 101 for SGST
    expect(result.remaining.sgst).toBe(0);
    expect(result.shortfall.cgst).toBe(500.25);
    expect(result.shortfall.sgst).toBe(149.75);
  });

  it('should handle CGST ITC being used for IGST before CGST liability', () => {
    // This is a critical test - CGST ITC should be used for IGST first
    // even if it leaves CGST liability unpaid
    const liability: Liability = { igst: 500, cgst: 500, sgst: 0, cess: 0 };
    const itcBalances: ITCBalance = { igst: 200, cgst: 400, sgst: 0, cess: 0 };

    const result = utilizeITC(liability, itcBalances);

    // IGST: 500
    // - Use 200 IGST ITC → remaining: 300
    // - Use 300 CGST ITC → remaining IGST: 0, remaining CGST ITC: 100
    // CGST: 500 liability
    // - Use 100 remaining CGST ITC → shortfall 400
    expect(result.utilized.igst).toBe(200);
    expect(result.utilized.cgst).toBe(400); // 300 for IGST + 100 for CGST
    expect(result.remaining.cgst).toBe(0);
    expect(result.shortfall.cgst).toBe(400);
    
    expect(result.success).toBe(false);
  });

  it('should not allow negative balances', () => {
    const liability: Liability = { igst: 0, cgst: 0, sgst: 0, cess: 0 };
    const itcBalances: ITCBalance = { igst: 0, cgst: 0, sgst: 0, cess: 0 };

    const result = utilizeITC(liability, itcBalances);

    expect(result.utilized.igst).toBeGreaterThanOrEqual(0);
    expect(result.utilized.cgst).toBeGreaterThanOrEqual(0);
    expect(result.utilized.sgst).toBeGreaterThanOrEqual(0);
    expect(result.remaining.igst).toBeGreaterThanOrEqual(0);
    expect(result.remaining.cgst).toBeGreaterThanOrEqual(0);
    expect(result.remaining.sgst).toBeGreaterThanOrEqual(0);
    expect(result.shortfall.igst).toBeGreaterThanOrEqual(0);
    expect(result.shortfall.cgst).toBeGreaterThanOrEqual(0);
    expect(result.shortfall.sgst).toBeGreaterThanOrEqual(0);
  });

  it('should preserve SGST ITC when CGST liability exists', () => {
    // SGST cannot be used for CGST liability
    const liability: Liability = { igst: 0, cgst: 1000, sgst: 0, cess: 0 };
    const itcBalances: ITCBalance = { igst: 0, cgst: 200, sgst: 1000, cess: 0 };

    const result = utilizeITC(liability, itcBalances);

    expect(result.utilized.cgst).toBe(200);
    expect(result.shortfall.cgst).toBe(800);
    expect(result.remaining.sgst).toBe(1000); // SGST preserved, cannot be used for CGST
    expect(result.success).toBe(false);
  });
});
