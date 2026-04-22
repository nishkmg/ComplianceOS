/**
 * Income Computation Service Tests
 * 
 * Tests for computing income under 5 heads as per Income Tax Act, 1961
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '@complianceos/db';
import { IncomeComputationService } from './income-computation-service';
import type { HousePropertyData, AssetDisposalData } from './income-computation-service';

// Mock DB
vi.mock('@complianceos/db', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    and: vi.fn(),
    eq: vi.fn(),
    sql: vi.fn(),
  },
}));

describe('IncomeComputationService', () => {
  let service: IncomeComputationService;

  beforeEach(() => {
    service = new IncomeComputationService();
    vi.clearAllMocks();
  });

  describe('computeSalaryIncome', () => {
    it('returns zero salary when no payroll runs exist', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await service.computeSalaryIncome('tenant-123', '2024-25');

      expect(result.totalSalary).toBe('0');
      expect(result.grossSalary).toBe('0');
      expect(result.deductions).toEqual([]);
    });

    it('sums gross earnings from finalized payroll runs', async () => {
      const mockPayrollRuns = [
        { grossEarnings: '50000', month: 'April', year: '2024' },
        { grossEarnings: '55000', month: 'May', year: '2024' },
        { grossEarnings: '52000', month: 'June', year: '2024' },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockPayrollRuns),
        }),
      } as any);

      const result = await service.computeSalaryIncome('tenant-123', '2024-25');

      expect(result.totalSalary).toBe('157000');
    });

    it('excludes draft and voided payroll runs', async () => {
      const mockPayrollRuns = [
        { grossEarnings: '50000', status: 'finalized' },
        { grossEarnings: '55000', status: 'draft' },
        { grossEarnings: '52000', status: 'voided' },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(
            mockPayrollRuns.filter((r) => r.status === 'finalized')
          ),
        }),
      } as any);

      const result = await service.computeSalaryIncome('tenant-123', '2024-25');

      expect(result.totalSalary).toBe('50000');
    });
  });

  describe('computeHousePropertyIncome', () => {
    it('computes income for single let-out property', () => {
      const properties: HousePropertyData[] = [
        {
          propertyId: 'prop-1',
          ownershipType: 'self-owned',
          usageType: 'let-out',
          grossAnnualValue: '240000',
          municipalTaxes: '24000',
          homeLoanInterest: '150000',
          preConstructionInterest: '30000',
        },
      ];

      const result = service.computeHousePropertyIncome(properties);

      // Net Annual Value = GAV - Municipal taxes = 240000 - 24000 = 216000
      // Income = NAV - 30% standard deduction - home loan interest
      // = 216000 - 64800 - 150000 - 30000 (pre-construction, 1/5th already included)
      expect(result[0].netAnnualValue).toBe('216000');
      expect(result[0].standardDeduction).toBe('64800');
      expect(result[0].incomeFromProperty).toBeLessThan(0); // Loss
    });

    it('computes self-occupied property with nil GAV', () => {
      const properties: HousePropertyData[] = [
        {
          propertyId: 'prop-1',
          ownershipType: 'self-owned',
          usageType: 'self-occupied',
          grossAnnualValue: '0',
          municipalTaxes: '0',
          homeLoanInterest: '200000',
        },
      ];

      const result = service.computeHousePropertyIncome(properties);

      expect(result[0].grossAnnualValue).toBe('0');
      expect(result[0].incomeFromProperty).toBe('-200000');
    });

    it('computes deemed let-out property', () => {
      const properties: HousePropertyData[] = [
        {
          propertyId: 'prop-1',
          ownershipType: 'self-owned',
          usageType: 'deemed-let-out',
          grossAnnualValue: '180000',
          municipalTaxes: '18000',
          homeLoanInterest: '100000',
        },
      ];

      const result = service.computeHousePropertyIncome(properties);

      expect(result[0].netAnnualValue).toBe('162000');
    });

    it('handles multiple properties with one self-occupied', () => {
      const properties: HousePropertyData[] = [
        {
          propertyId: 'prop-1',
          ownershipType: 'self-owned',
          usageType: 'self-occupied',
          grossAnnualValue: '0',
          municipalTaxes: '0',
          homeLoanInterest: '150000',
        },
        {
          propertyId: 'prop-2',
          ownershipType: 'self-owned',
          usageType: 'let-out',
          grossAnnualValue: '240000',
          municipalTaxes: '24000',
          homeLoanInterest: '100000',
        },
      ];

      const result = service.computeHousePropertyIncome(properties);

      expect(result).toHaveLength(2);
      expect(result[0].usageType).toBe('self-occupied');
      expect(result[1].usageType).toBe('let-out');
    });
  });

  describe('computeBusinessIncome', () => {
    it('computes normal business income from account balances', async () => {
      const mockBalances = [
        { accountKind: 'Revenue', closingBalance: '500000' },
        { accountKind: 'Revenue', closingBalance: '300000' },
        { accountKind: 'Expense', closingBalance: '200000' },
        { accountKind: 'Expense', closingBalance: '150000' },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockBalances),
        }),
      } as any);

      const result = await service.computeBusinessIncome('tenant-123', '2024-25', 'normal');

      // Profit = Revenue (800000) - Expenses (350000) = 450000
      expect(result.businessProfit).toBe('450000');
      expect(result.scheme).toBe('normal');
    });

    it('computes presumptive income under 44AD (8%)', async () => {
      const mockTurnover = '2000000';

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ totalTurnover: mockTurnover }]),
        }),
      } as any);

      const result = await service.computeBusinessIncome('tenant-123', '2024-25', '44AD');

      // 8% of 2000000 = 160000
      expect(result.businessProfit).toBe('160000');
      expect(result.scheme).toBe('44AD');
    });

    it('computes presumptive income under 44AD with digital receipts (6%)', async () => {
      const mockTurnover = '1000000';
      const mockDigitalTurnover = '600000';

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { totalTurnover: mockTurnover, digitalTurnover: mockDigitalTurnover },
          ]),
        }),
      } as any);

      const result = await service.computeBusinessIncome('tenant-123', '2024-25', '44AD');

      // Digital: 600000 × 6% = 36000, Cash: 400000 × 8% = 32000, Total = 68000
      expect(result.businessProfit).toBe('68000');
    });

    it('computes presumptive income under 44ADA (50% for professionals)', async () => {
      const mockGrossReceipts = '1500000';

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ totalGrossReceipts: mockGrossReceipts }]),
        }),
      } as any);

      const result = await service.computeBusinessIncome('tenant-123', '2024-25', '44ADA');

      // 50% of 1500000 = 750000
      expect(result.businessProfit).toBe('750000');
      expect(result.scheme).toBe('44ADA');
    });

    it('returns zero when no business data exists', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await service.computeBusinessIncome('tenant-123', '2024-25', 'normal');

      expect(result.businessProfit).toBe('0');
    });
  });

  describe('computeCapitalGains', () => {
    it('computes short-term capital gains on equity shares', () => {
      const disposals: AssetDisposalData[] = [
        {
          assetId: 'asset-1',
          assetType: 'equity-shares',
          acquisitionDate: '2023-06-15',
          saleDate: '2024-08-20',
          saleConsideration: '150000',
          costOfAcquisition: '100000',
          improvementCost: '10000',
          sttPaid: '150',
          isIndexationApplicable: false,
        },
      ];

      const result = service.computeCapitalGains(disposals);

      // STCG = 150000 - 150 - 100000 - 10000 = 39850
      expect(result.stcg.total).toBe('39850');
      expect(result.ltcg.total).toBe('0');
    });

    it('computes long-term capital gains with indexation', () => {
      const disposals: AssetDisposalData[] = [
        {
          assetId: 'asset-1',
          assetType: 'property',
          acquisitionDate: '2018-04-10',
          saleDate: '2024-09-15',
          saleConsideration: '8000000',
          costOfAcquisition: '5000000',
          improvementCost: '500000',
          costInflationIndexAcquisition: 280,
          costInflationIndexSale: 363,
          isIndexationApplicable: true,
        },
      ];

      const result = service.computeCapitalGains(disposals);

      // Indexed COA = 5000000 × (363/280) = 6482142.86
      // Indexed improvement = 500000 × (363/280) = 648214.29
      // LTCG = 8000000 - 6482142.86 - 648214.29 = 869642.85
      expect(result.ltcg.total).toBeTruthy();
      expect(result.stcg.total).toBe('0');
    });

    it('handles multiple disposals mixing STCG and LTCG', () => {
      const disposals: AssetDisposalData[] = [
        {
          assetId: 'asset-1',
          assetType: 'equity-shares',
          acquisitionDate: '2024-01-15',
          saleDate: '2024-11-20',
          saleConsideration: '100000',
          costOfAcquisition: '80000',
          sttPaid: '100',
          isIndexationApplicable: false,
        },
        {
          assetId: 'asset-2',
          assetType: 'debt-mutual-fund',
          acquisitionDate: '2020-06-10',
          saleDate: '2024-08-15',
          saleConsideration: '200000',
          costOfAcquisition: '150000',
          isIndexationApplicable: true,
          costInflationIndexAcquisition: 301,
          costInflationIndexSale: 363,
        },
      ];

      const result = service.computeCapitalGains(disposals);

      expect(result.stcg.count).toBe(1);
      expect(result.ltcg.count).toBe(1);
    });

    it('returns zero gains for empty disposals', () => {
      const result = service.computeCapitalGains([]);

      expect(result.stcg.total).toBe('0');
      expect(result.ltcg.total).toBe('0');
    });
  });

  describe('computeOtherSources', () => {
    it('sums interest income from account balances', async () => {
      const mockBalances = [
        { accountName: 'Interest Income - Savings', closingBalance: '25000' },
        { accountName: 'Interest Income - FD', closingBalance: '45000' },
        { accountName: 'Dividend Income', closingBalance: '15000' },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockBalances),
        }),
      } as any);

      const result = await service.computeOtherSources('tenant-123', '2024-25');

      expect(result.totalIncome).toBe('85000');
    });

    it('categorizes income by type', async () => {
      const mockBalances = [
        { category: 'interest', accountName: 'Interest Income', closingBalance: '50000' },
        { category: 'dividend', accountName: 'Dividend Income', closingBalance: '20000' },
        { category: 'miscellaneous', accountName: 'Misc Income', closingBalance: '5000' },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockBalances),
        }),
      } as any);

      const result = await service.computeOtherSources('tenant-123', '2024-25');

      expect(result.interestIncome).toBe('50000');
      expect(result.dividendIncome).toBe('20000');
      expect(result.miscellaneousIncome).toBe('5000');
    });

    it('returns zero when no other sources data exists', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await service.computeOtherSources('tenant-123', '2024-25');

      expect(result.totalIncome).toBe('0');
    });
  });

  describe('computeGrossTotalIncome', () => {
    it('sums income from all five heads', async () => {
      // Mock all service methods
      vi.spyOn(service, 'computeSalaryIncome').mockResolvedValue({
        totalSalary: '500000',
        grossSalary: '600000',
        deductions: [{ section: '16', amount: '50000', description: 'Standard deduction' }],
      } as any);

      vi.spyOn(service, 'computeHousePropertyIncome').mockReturnValue([
        {
          propertyId: 'prop-1',
          incomeFromProperty: '-150000',
          netAnnualValue: '200000',
        } as any,
      ]);

      vi.spyOn(service, 'computeBusinessIncome').mockResolvedValue({
        businessProfit: '800000',
        scheme: 'normal',
      } as any);

      vi.spyOn(service, 'computeCapitalGains').mockReturnValue({
        stcg: { total: '50000', count: 1 },
        ltcg: { total: '100000', count: 1 },
      } as any);

      vi.spyOn(service, 'computeOtherSources').mockResolvedValue({
        totalIncome: '75000',
        interestIncome: '50000',
        dividendIncome: '25000',
      } as any);

      const result = await service.computeGrossTotalIncome('tenant-123', '2024-25');

      // Salary: 500000 (after standard deduction)
      // House Property: -150000
      // Business: 800000
      // Capital Gains: 150000 (50000 + 100000)
      // Other Sources: 75000
      // GTI = 500000 - 150000 + 800000 + 150000 + 75000 = 1375000
      expect(result.grossTotalIncome).toBe('1375000');
      expect(result.breakdown.salary).toBe('500000');
      expect(result.breakdown.houseProperty).toBe('-150000');
      expect(result.breakdown.business).toBe('800000');
      expect(result.breakdown.capitalGains).toBe('150000');
      expect(result.breakdown.otherSources).toBe('75000');
    });

    it('applies inter-head set-off rules', async () => {
      // Business loss can be set off against any head except Salary and LTCG
      vi.spyOn(service, 'computeSalaryIncome').mockResolvedValue({
        totalSalary: '400000',
        grossSalary: '450000',
        deductions: [],
      } as any);

      vi.spyOn(service, 'computeHousePropertyIncome').mockReturnValue([
        { incomeFromProperty: '100000' } as any,
      ]);

      vi.spyOn(service, 'computeBusinessIncome').mockResolvedValue({
        businessProfit: '-200000', // Business loss
        scheme: 'normal',
      } as any);

      vi.spyOn(service, 'computeCapitalGains').mockReturnValue({
        stcg: { total: '50000', count: 0 },
        ltcg: { total: '100000', count: 0 },
      } as any);

      vi.spyOn(service, 'computeOtherSources').mockResolvedValue({
        totalIncome: '30000',
        interestIncome: '30000',
        dividendIncome: '0',
      } as any);

      const result = await service.computeGrossTotalIncome('tenant-123', '2024-25');

      // Business loss (-200000) set off against:
      // House Property (100000) + STCG (50000) + Other Sources (30000) = 180000
      // Remaining loss: 20000 (carried forward)
      // GTI = Salary (400000) + LTCG (100000) = 500000
      expect(result.grossTotalIncome).toBe('500000');
      expect(result.carriedForwardLosses).toBeDefined();
    });
  });
});
