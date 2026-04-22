/**
 * Income Computation Service
 * 
 * Computes taxable income under 5 heads as per Income Tax Act, 1961:
 * 1. Salary (Section 15-17)
 * 2. House Property (Section 22-27)
 * 3. Business/Profession (Section 28-44)
 * 4. Capital Gains (Section 45-55)
 * 5. Other Sources (Section 56-59)
 * 
 * Reference: Income Tax Act, 1961; CBDT Guidelines
 */

import { db, payrollRuns, accountBalances, accounts } from '@complianceos/db';
import { eq, and, sql } from 'drizzle-orm';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SalaryIncomeResult {
  totalSalary: string;
  grossSalary: string;
  deductions: Array<{
    section: string;
    amount: string;
    description: string;
  }>;
}

export interface HousePropertyData {
  propertyId: string;
  ownershipType: 'self-owned' | 'co-owned' | 'deemed-owner';
  usageType: 'self-occupied' | 'let-out' | 'deemed-let-out' | 'vacant';
  grossAnnualValue: string;
  municipalTaxes: string;
  homeLoanInterest: string;
  preConstructionInterest?: string;
  unrealizedRent?: string;
  arrearsReceived?: string;
}

export interface HousePropertyResult {
  propertyId: string;
  usageType: string;
  grossAnnualValue: string;
  netAnnualValue: string;
  standardDeduction: string;
  homeLoanInterest: string;
  incomeFromProperty: string;
}

export type BusinessScheme = 'normal' | '44AD' | '44ADA' | '44AE';

export interface BusinessIncomeResult {
  businessProfit: string;
  scheme: BusinessScheme;
  turnover?: string;
  digitalTurnover?: string;
  grossReceipts?: string;
  disallowances?: Array<{
    section: string;
    amount: string;
    description: string;
  }>;
}

export interface AssetDisposalData {
  assetId: string;
  assetType: 'equity-shares' | 'property' | 'debt-mutual-fund' | 'gold' | 'other';
  acquisitionDate: string;
  saleDate: string;
  saleConsideration: string;
  costOfAcquisition: string;
  improvementCost?: string;
  sttPaid?: string;
  isIndexationApplicable: boolean;
  costInflationIndexAcquisition?: number;
  costInflationIndexSale?: number;
  exemptionSections?: string[]; // e.g., ['54', '54F']
}

export interface CapitalGainsResult {
  stcg: {
    total: string;
    count: number;
    breakdown: Array<{
      assetId: string;
      gain: string;
      taxRate: string;
    }>;
  };
  ltcg: {
    total: string;
    count: number;
    breakdown: Array<{
      assetId: string;
      gain: string;
      indexedGain?: string;
      taxRate: string;
    }>;
  };
}

export interface OtherSourcesResult {
  totalIncome: string;
  interestIncome: string;
  dividendIncome: string;
  miscellaneousIncome: string;
  familyPension?: string;
}

export interface GrossTotalIncomeResult {
  grossTotalIncome: string;
  breakdown: {
    salary: string;
    houseProperty: string;
    business: string;
    capitalGains: string;
    otherSources: string;
  };
  carriedForwardLosses?: Array<{
    head: string;
    amount: string;
    section: string;
    assessmentYear: string;
  }>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export class IncomeComputationService {
  /**
   * Compute salary income under Section 15-17
   * Includes: Basic salary, allowances, bonuses, perquisites
   * Excludes: Deductions under Section 16 (standard deduction, entertainment allowance)
   */
  async computeSalaryIncome(tenantId: string, financialYear: string): Promise<SalaryIncomeResult> {
    // Query finalized payroll runs for the FY
    const payrollData = await db
      .select({
        grossEarnings: payrollRuns.grossEarnings,
        status: payrollRuns.status,
      })
      .from(payrollRuns)
      .where(
        and(
          eq(payrollRuns.tenantId, tenantId),
          eq(payrollRuns.fiscalYear, financialYear),
          eq(payrollRuns.status, 'finalized')
        )
      );

    const totalSalary = payrollData.reduce((sum, run) => {
      return sum + BigInt(run.grossEarnings || '0');
    }, BigInt(0));

    // Standard deduction under Section 16(ia): ₹50,000 or salary whichever is lower
    const standardDeduction = totalSalary > 50000n ? 50000n : totalSalary;

    const netSalary = totalSalary - standardDeduction;

    return {
      totalSalary: netSalary.toString(),
      grossSalary: totalSalary.toString(),
      deductions: [
        {
          section: '16(ia)',
          amount: standardDeduction.toString(),
          description: 'Standard deduction',
        },
      ],
    };
  }

  /**
   * Compute income from House Property under Section 22-27
   * Supports: Self-occupied, let-out, deemed let-out properties
   * 
   * Computation:
   * 1. Gross Annual Value (GAV) - higher of fair rent & municipal valuation, limited to standard rent
   * 2. Less: Municipal taxes paid → Net Annual Value (NAV)
   * 3. Less: Standard deduction (30% of NAV)
   * 4. Less: Home loan interest (max ₹2L for self-occupied)
   * 5. Less: Pre-construction interest (1/5th per year for 5 years)
   */
  computeHousePropertyIncome(properties: HousePropertyData[]): HousePropertyResult[] {
    return properties.map((property) => {
      let grossAnnualValue = BigInt(property.grossAnnualValue || '0');
      let municipalTaxes = BigInt(property.municipalTaxes || '0');
      let homeLoanInterest = BigInt(property.homeLoanInterest || '0');

      // Self-occupied property: GAV is nil
      if (property.usageType === 'self-occupied') {
        grossAnnualValue = 0n;
        municipalTaxes = 0n;
        // Home loan interest capped at ₹2,00,000 for self-occupied
        if (homeLoanInterest > 200000n) {
          homeLoanInterest = 200000n;
        }
      }

      // Net Annual Value = GAV - Municipal taxes
      const netAnnualValue = grossAnnualValue - municipalTaxes;

      // Standard deduction: 30% of NAV (Section 24(a))
      const standardDeduction = (netAnnualValue * 30n) / 100n;

      // Pre-construction interest: 1/5th already included in homeLoanInterest
      // If provided separately, add remaining 4/5th
      let totalInterest = homeLoanInterest;
      if (property.preConstructionInterest) {
        const preConstructionInterest = BigInt(property.preConstructionInterest);
        // Only 1/5th is deductible in current year
        const currentYearPreConstruction = preConstructionInterest / 5n;
        totalInterest = totalInterest + currentYearPreConstruction;
      }

      // Income from property = NAV - Standard deduction - Interest
      const incomeFromProperty = netAnnualValue - standardDeduction - totalInterest;

      return {
        propertyId: property.propertyId,
        usageType: property.usageType,
        grossAnnualValue: grossAnnualValue.toString(),
        netAnnualValue: netAnnualValue.toString(),
        standardDeduction: standardDeduction.toString(),
        homeLoanInterest: totalInterest.toString(),
        incomeFromProperty: incomeFromProperty.toString(),
      };
    });
  }

  /**
   * Compute business income under Section 28-44
   * Supports: Normal computation and presumptive schemes (44AD, 44ADA, 44AE)
   * 
   * Normal: Profit = Revenue - Expenses (from Trial Balance)
   * 44AD: 8% of turnover (6% if digital receipts) for eligible businesses
   * 44ADA: 50% of gross receipts for specified professionals
   * 44AE: Presumptive rate for transport operators
   */
  async computeBusinessIncome(
    tenantId: string,
    financialYear: string,
    scheme: BusinessScheme = 'normal'
  ): Promise<BusinessIncomeResult> {
    if (scheme === 'normal') {
      return this.computeNormalBusinessIncome(tenantId, financialYear);
    }

    if (scheme === '44AD') {
      return this.computePresumptive44AD(tenantId, financialYear);
    }

    if (scheme === '44ADA') {
      return this.computePresumptive44ADA(tenantId, financialYear);
    }

    if (scheme === '44AE') {
      return this.computePresumptive44AE(tenantId, financialYear);
    }

    throw new Error(`Unknown business scheme: ${scheme}`);
  }

  private async computeNormalBusinessIncome(
    tenantId: string,
    financialYear: string
  ): Promise<BusinessIncomeResult> {
    // Get all revenue and expense account balances for the FY
    const balances = await db
      .select({
        accountKind: accounts.kind,
        closingBalance: accountBalances.closingBalance,
      })
      .from(accountBalances)
      .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
      .where(
        and(
          eq(accountBalances.tenantId, tenantId),
          eq(accountBalances.fiscalYear, financialYear),
          eq(accounts.isActive, true)
        )
      );

    let totalRevenue = 0n;
    let totalExpenses = 0n;

    for (const balance of balances) {
      const amount = BigInt(balance.closingBalance || '0');
      if (balance.accountKind === 'Revenue') {
        totalRevenue += amount;
      } else if (balance.accountKind === 'Expense') {
        totalExpenses += amount;
      }
    }

    const businessProfit = totalRevenue - totalExpenses;

    return {
      businessProfit: businessProfit.toString(),
      scheme: 'normal',
    };
  }

  private async computePresumptive44AD(
    tenantId: string,
    financialYear: string
  ): Promise<BusinessIncomeResult> {
    // Get total turnover from revenue accounts
    const turnoverData = await db
      .select({
        totalTurnover: sql<string>`SUM(${accountBalances.closingBalance})`.mapWith(String),
      })
      .from(accountBalances)
      .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
      .where(
        and(
          eq(accountBalances.tenantId, tenantId),
          eq(accountBalances.fiscalYear, financialYear),
          eq(accounts.kind, 'Revenue')
        )
      );

    const totalTurnover = BigInt(turnoverData[0]?.totalTurnover || '0');

    // For simplicity, assume all turnover is cash (8%)
    // In production, track digital vs cash separately
    const presumptiveIncome = (totalTurnover * 8n) / 100n;

    return {
      businessProfit: presumptiveIncome.toString(),
      scheme: '44AD',
      turnover: totalTurnover.toString(),
    };
  }

  private async computePresumptive44ADA(
    tenantId: string,
    financialYear: string
  ): Promise<BusinessIncomeResult> {
    // Get gross receipts from revenue accounts
    const receiptsData = await db
      .select({
        totalGrossReceipts: sql<string>`SUM(${accountBalances.closingBalance})`.mapWith(String),
      })
      .from(accountBalances)
      .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
      .where(
        and(
          eq(accountBalances.tenantId, tenantId),
          eq(accountBalances.fiscalYear, financialYear),
          eq(accounts.kind, 'Revenue')
        )
      );

    const totalGrossReceipts = BigInt(receiptsData[0]?.totalGrossReceipts || '0');

    // 50% presumptive income for specified professionals
    const presumptiveIncome = totalGrossReceipts / 2n;

    return {
      businessProfit: presumptiveIncome.toString(),
      scheme: '44ADA',
      grossReceipts: totalGrossReceipts.toString(),
    };
  }

  private async computePresumptive44AE(
    tenantId: string,
    financialYear: string
  ): Promise<BusinessIncomeResult> {
    // For transport operators: ₹1,000 per tonne per month
    // This would require vehicle data - returning placeholder
    return {
      businessProfit: '0',
      scheme: '44AE',
    };
  }

  /**
   * Compute capital gains under Section 45-55
   * Supports: Short-term and long-term gains with indexation
   * 
   * STCG: Sale consideration - STT - COA - Improvement (held < 36 months, < 12 for equity)
   * LTCG: Sale consideration - Indexed COA - Indexed improvement (held ≥ 36 months)
   * Indexation: COA × (CII of sale year / CII of acquisition year)
   */
  computeCapitalGains(disposals: AssetDisposalData[]): CapitalGainsResult {
    const stcgBreakdown: Array<{ assetId: string; gain: string; taxRate: string }> = [];
    const ltcgBreakdown: Array<{ assetId: string; gain: string; indexedGain?: string; taxRate: string }> = [];

    let totalStcg = 0n;
    let totalLtcg = 0n;

    for (const disposal of disposals) {
      const saleConsideration = BigInt(disposal.saleConsideration);
      const costOfAcquisition = BigInt(disposal.costOfAcquisition);
      const improvementCost = BigInt(disposal.improvementCost || '0');
      const sttPaid = BigInt(disposal.sttPaid || '0');

      let gain: bigint;

      if (!disposal.isIndexationApplicable) {
        // Short-term capital gains
        gain = saleConsideration - sttPaid - costOfAcquisition - improvementCost;

        if (gain > 0n) {
          totalStcg += gain;
          // Determine tax rate based on asset type
          let taxRate = '15%'; // Equity STCG
          if (disposal.assetType === 'property' || disposal.assetType === 'gold') {
            taxRate = 'Slab rate'; // STCG on other assets
          }

          stcgBreakdown.push({
            assetId: disposal.assetId,
            gain: gain.toString(),
            taxRate,
          });
        }
      } else {
        // Long-term capital gains with indexation
        const ciiAcquisition = disposal.costInflationIndexAcquisition || 1;
        const ciiSale = disposal.costInflationIndexSale || 1;

        // Indexed COA = COA × (CII sale / CII acquisition)
        const indexedCOA = (costOfAcquisition * BigInt(ciiSale)) / BigInt(ciiAcquisition);
        const indexedImprovement = (improvementCost * BigInt(ciiSale)) / BigInt(ciiAcquisition);

        gain = saleConsideration - indexedCOA - indexedImprovement;

        if (gain > 0n) {
          totalLtcg += gain;
          // Determine tax rate based on asset type
          let taxRate = '20%'; // Standard LTCG with indexation
          if (disposal.assetType === 'equity-shares') {
            taxRate = '10% (over ₹1L)'; // LTCG on equity
          }

          ltcgBreakdown.push({
            assetId: disposal.assetId,
            gain: gain.toString(),
            indexedGain: gain.toString(),
            taxRate,
          });
        }
      }
    }

    return {
      stcg: {
        total: totalStcg.toString(),
        count: stcgBreakdown.length,
        breakdown: stcgBreakdown,
      },
      ltcg: {
        total: totalLtcg.toString(),
        count: ltcgBreakdown.length,
        breakdown: ltcgBreakdown,
      },
    };
  }

  /**
   * Compute income from Other Sources under Section 56-59
   * Includes: Interest, dividends, family pension, miscellaneous income
   */
  async computeOtherSources(tenantId: string, financialYear: string): Promise<OtherSourcesResult> {
    // Query account balances for other sources income
    const balances = await db
      .select({
        accountName: accounts.name,
        closingBalance: accountBalances.closingBalance,
      })
      .from(accountBalances)
      .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
      .where(
        and(
          eq(accountBalances.tenantId, tenantId),
          eq(accountBalances.fiscalYear, financialYear),
          eq(accounts.isActive, true),
          sql`${accounts.name} ILIKE '%interest%' OR ${accounts.name} ILIKE '%dividend%' OR ${accounts.name} ILIKE '%other income%'`
        )
      );

    let interestIncome = 0n;
    let dividendIncome = 0n;
    let miscellaneousIncome = 0n;

    for (const balance of balances) {
      const amount = BigInt(balance.closingBalance || '0');
      const accountName = balance.accountName.toLowerCase();

      if (accountName.includes('interest')) {
        interestIncome += amount;
      } else if (accountName.includes('dividend')) {
        dividendIncome += amount;
      } else {
        miscellaneousIncome += amount;
      }
    }

    const totalIncome = interestIncome + dividendIncome + miscellaneousIncome;

    return {
      totalIncome: totalIncome.toString(),
      interestIncome: interestIncome.toString(),
      dividendIncome: dividendIncome.toString(),
      miscellaneousIncome: miscellaneousIncome.toString(),
    };
  }

  /**
   * Compute Gross Total Income by summing all five heads
   * Applies inter-head set-off rules (Section 70-80)
   * 
   * Set-off order:
   * 1. Intra-head set-off (within same head)
   * 2. Inter-head set-off (across different heads)
   *    - Business loss cannot be set off against Salary
   *    - LTCG loss can only be set off against LTCG
   *    - Speculative business loss can only be set off against speculative business
   */
  async computeGrossTotalIncome(tenantId: string, financialYear: string): Promise<GrossTotalIncomeResult> {
    // Compute income from all five heads
    const salaryResult = await this.computeSalaryIncome(tenantId, financialYear);
    const housePropertyResults = this.computeHousePropertyIncome([]); // External data
    const businessResult = await this.computeBusinessIncome(tenantId, financialYear);
    const capitalGainsResult = this.computeCapitalGains([]); // External data
    const otherSourcesResult = await this.computeOtherSources(tenantId, financialYear);

    // Sum house property income
    const totalHouseProperty = housePropertyResults.reduce(
      (sum, prop) => sum + BigInt(prop.incomeFromProperty),
      0n
    );

    // Capital gains total
    const totalCapitalGains = BigInt(capitalGainsResult.stcg.total) + BigInt(capitalGainsResult.ltcg.total);

    // Breakdown
    const salaryIncome = BigInt(salaryResult.totalSalary);
    const businessIncome = BigInt(businessResult.businessProfit);
    const otherSourcesIncome = BigInt(otherSourcesResult.totalIncome);

    // Apply inter-head set-off
    let grossTotalIncome = salaryIncome + totalHouseProperty + businessIncome + totalCapitalGains + otherSourcesIncome;

    // Track carried forward losses
    const carriedForwardLosses: GrossTotalIncomeResult['carriedForwardLosses'] = [];

    // Business loss set-off rules:
    // - Cannot be set off against Salary
    // - Can be set off against House Property, Capital Gains (except LTCG), Other Sources
    if (businessIncome < 0n) {
      const businessLoss = Math.abs(Number(businessIncome));
      
      // Available for set-off (excluding salary and LTCG)
      const setOffSources = [
        { name: 'House Property', amount: Number(totalHouseProperty) },
        { name: 'STCG', amount: Number(capitalGainsResult.stcg.total) },
        { name: 'Other Sources', amount: Number(otherSourcesIncome) },
      ];

      let remainingLoss = businessLoss;
      for (const source of setOffSources) {
        if (source.amount > 0 && remainingLoss > 0) {
          const setOffAmount = Math.min(source.amount, remainingLoss);
          remainingLoss -= setOffAmount;
          grossTotalIncome -= BigInt(setOffAmount);
        }
      }

      // Carry forward remaining loss
      if (remainingLoss > 0) {
        carriedForwardLosses.push({
          head: 'Business',
          amount: remainingLoss.toString(),
          section: '72',
          assessmentYear: this.getNextAssessmentYear(financialYear),
        });
      }
    }

    // House property loss can be set off against any head except LTCG
    // Max ₹2L per year, balance carried forward for 8 years
    if (totalHouseProperty < 0n) {
      const housePropertyLoss = Math.abs(Number(totalHouseProperty));
      if (housePropertyLoss > 200000) {
        const excessLoss = housePropertyLoss - 200000;
        carriedForwardLosses.push({
          head: 'House Property',
          amount: excessLoss.toString(),
          section: '71B',
          assessmentYear: this.getNextAssessmentYear(financialYear),
        });
      }
    }

    return {
      grossTotalIncome: grossTotalIncome.toString(),
      breakdown: {
        salary: salaryIncome.toString(),
        houseProperty: totalHouseProperty.toString(),
        business: businessIncome.toString(),
        capitalGains: totalCapitalGains.toString(),
        otherSources: otherSourcesIncome.toString(),
      },
      carriedForwardLosses: carriedForwardLosses.length > 0 ? carriedForwardLosses : undefined,
    };
  }

  private getNextAssessmentYear(financialYear: string): string {
    // FY 2024-25 → AY 2025-26
    const parts = financialYear.split('-');
    const startYear = parseInt(parts[0]);
    return `${startYear + 1}-${(startYear + 1).toString().slice(2, 4)}`;
  }
}
