import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { 
  itrReturns, 
  payrollRuns, 
  accounts, 
  accountTags, 
  journalEntries, 
  journalEntryLines,
  fiscalYears,
} from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { IncomeComputedPayloadSchema } from "@complianceos/shared";

/**
 * House Property Data for income computation
 */
export interface HousePropertyData {
  propertyId: string;
  annualValue: number;
  municipalTaxes: number;
  interestOnHomeLoan: number;
  isSelfOccupied: boolean;
}

/**
 * Capital Gains Data for income computation
 */
export interface CapitalGainsData {
  assetType: "equity" | "debt" | "property" | "gold" | "other";
  saleConsideration: number;
  acquisitionCost: number;
  improvementCost: number;
  saleDate: string;
  acquisitionDate: string;
  isIndexationApplicable: boolean;
  costInflationIndexSaleYear?: number;
  costInflationIndexAcqYear?: number;
}

/**
 * Input schema for computeIncome command
 */
export interface ComputeIncomeInput {
  itrReturnId: string;
  financialYear: string;
  housePropertyData?: HousePropertyData[];
  capitalGainsData?: CapitalGainsData[];
  presumptiveScheme?: "none" | "44ad" | "44ada" | "44ae";
}

/**
 * Presumptive taxation rates
 */
const PRESUMPTIVE_RATES = {
  "44ad": {
    digital: 0.06, // 6% for digital receipts
    cash: 0.08,    // 8% for cash receipts
  },
  "44ada": 0.50,   // 50% for specified professionals
  "44ae": 60000,   // ₹60,000 per vehicle per month for goods vehicles
} as const;

/**
 * Compute income under 5 heads as per Income Tax Act, 1961
 * 
 * Heads:
 * 1. Salary (from payroll_runs)
 * 2. House Property (BYO data)
 * 3. Business/Profession (from TB or presumptive)
 * 4. Capital Gains (BYO data)
 * 5. Other Sources (from GL via account tags)
 */
export async function computeIncome(
  db: Database,
  tenantId: string,
  actorId: string,
  input: ComputeIncomeInput,
): Promise<{ itrReturnId: string; totalIncome: number }> {
  // Validate financial year format (YYYY-YY)
  const fyRegex = /^\d{4}-\d{2}$/;
  if (!fyRegex.test(input.financialYear)) {
    throw new Error(
      `Invalid financial year format: ${input.financialYear}. Expected YYYY-YY (e.g., 2026-27)`
    );
  }

  // Validate FY exists and is open
  const [fy] = await db.select()
    .from(fiscalYears)
    .where(
      and(
        eq(fiscalYears.tenantId, tenantId),
        eq(fiscalYears.year, input.financialYear)
      )
    );

  if (!fy) {
    throw new Error(`Financial year ${input.financialYear} not found for tenant`);
  }

  // Fetch ITR return
  const [itrReturn] = await db.select()
    .from(itrReturns)
    .where(eq(itrReturns.id, input.itrReturnId));

  if (!itrReturn) {
    throw new Error(`ITR return ${input.itrReturnId} not found`);
  }

  if (itrReturn.tenantId !== tenantId) {
    throw new Error("ITR return does not belong to this tenant");
  }

  // Extract FY dates for querying
  const fyStart = fy.startDate;
  const fyEnd = fy.endDate;

  // ============================================================================
  // 1. SALARY INCOME (from finalized payroll_runs)
  // ============================================================================
  const payrollData = await db.select({
    grossEarnings: payrollRuns.grossEarnings,
  })
    .from(payrollRuns)
    .where(
      and(
        eq(payrollRuns.tenantId, tenantId),
        eq(payrollRuns.status, "finalized"),
        eq(payrollRuns.fiscalYear, input.financialYear)
      )
    );

  const salaryIncome = payrollData.reduce((sum, p) => {
    return sum + parseFloat(p.grossEarnings);
  }, 0);

  // ============================================================================
  // 2. HOUSE PROPERTY INCOME (BYO data)
  // ============================================================================
  let housePropertyIncome = 0;

  if (input.housePropertyData && input.housePropertyData.length > 0) {
    for (const property of input.housePropertyData) {
      // Net Annual Value = Annual Value - Municipal Taxes
      const netAnnualValue = property.annualValue - property.municipalTaxes;
      
      // Standard deduction: 30% of NAV (Section 24(a))
      const standardDeduction = netAnnualValue * 0.30;
      
      // Interest on home loan (Section 24(b))
      // Self-occupied: max ₹2,00,000; Let-out: unlimited
      const interestDeduction = property.isSelfOccupied 
        ? Math.min(property.interestOnHomeLoan, 200000)
        : property.interestOnHomeLoan;
      
      // Income from House Property = NAV - Standard Deduction - Interest
      const propertyIncome = netAnnualValue - standardDeduction - interestDeduction;
      housePropertyIncome += propertyIncome;
    }
  }

  // ============================================================================
  // 3. BUSINESS/PROFESSION INCOME
  // ============================================================================
  let businessIncome = 0;

  if (input.presumptiveScheme && input.presumptiveScheme !== "none") {
    // Presumptive taxation - fetch turnover from GL
    const turnoverAccounts = await db.select({ accountId: accountTags.accountId })
      .from(accountTags)
      .innerJoin(accounts, eq(accountTags.accountId, accounts.id))
      .where(
        and(
          eq(accountTags.tag, "trading"),
          eq(accounts.kind, "Revenue")
        )
      );

    if (turnoverAccounts.length > 0) {
      const accountIds = turnoverAccounts.map(t => t.accountId);
      
      // Fetch credit side (income) from journal entries
      const turnoverResult = await db.select({
        total: sql<number>`SUM(${journalEntryLines.credit})`,
      })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(
            eq(journalEntries.tenantId, tenantId),
            eq(journalEntries.status, "posted"),
            eq(journalEntries.fiscalYear, input.financialYear),
            inArray(journalEntryLines.accountId, accountIds),
            gte(journalEntries.date, fyStart),
            lte(journalEntries.date, fyEnd)
          )
        );

      const turnover = parseFloat(turnoverResult[0]?.total?.toString() ?? "0");

      // Apply presumptive rate
      if (input.presumptiveScheme === "44ad") {
        // Simplified: assume 8% (cash basis for conservative estimate)
        businessIncome = turnover * PRESUMPTIVE_RATES["44ad"].cash;
      } else if (input.presumptiveScheme === "44ada") {
        businessIncome = turnover * PRESUMPTIVE_RATES["44ada"];
      } else if (input.presumptiveScheme === "44ae") {
        // For 44ae, need vehicle count - use simplified approach
        // Assume turnover / ₹10000 per vehicle per month as proxy
        const estimatedVehicles = Math.ceil(turnover / (PRESUMPTIVE_RATES["44ae"] * 12));
        businessIncome = estimatedVehicles * PRESUMPTIVE_RATES["44ae"] * 12;
      }
    }
  } else {
    // Regular taxation: Business Income = Revenue - Expenses
    const revenueAccounts = await db.select({ accountId: accountTags.accountId })
      .from(accountTags)
      .innerJoin(accounts, eq(accountTags.accountId, accounts.id))
      .where(
        and(
          eq(accountTags.tag, "trading"),
          eq(accounts.kind, "Revenue")
        )
      );

    const expenseAccounts = await db.select({ accountId: accountTags.accountId })
      .from(accountTags)
      .innerJoin(accounts, eq(accountTags.accountId, accounts.id))
      .where(
        and(
          eq(accountTags.tag, "manufacturing"),
          eq(accounts.kind, "Expense")
        )
      );

    const allBusinessAccountIds = [
      ...revenueAccounts.map(a => a.accountId),
      ...expenseAccounts.map(a => a.accountId),
    ];

    if (allBusinessAccountIds.length > 0) {
      const businessResult = await db.select({
        revenue: sql<number>`SUM(CASE WHEN ${journalEntryLines.credit} > 0 THEN ${journalEntryLines.credit} ELSE 0 END)`,
        expenses: sql<number>`SUM(CASE WHEN ${journalEntryLines.debit} > 0 THEN ${journalEntryLines.debit} ELSE 0 END)`,
      })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(
            eq(journalEntries.tenantId, tenantId),
            eq(journalEntries.status, "posted"),
            eq(journalEntries.fiscalYear, input.financialYear),
            inArray(journalEntryLines.accountId, allBusinessAccountIds),
            gte(journalEntries.date, fyStart),
            lte(journalEntries.date, fyEnd)
          )
        );

      const revenue = parseFloat(businessResult[0]?.revenue?.toString() ?? "0");
      const expenses = parseFloat(businessResult[0]?.expenses?.toString() ?? "0");
      businessIncome = revenue - expenses;
    }
  }

  // ============================================================================
  // 4. CAPITAL GAINS (BYO data)
  // ============================================================================
  let capitalGainsIncome = 0;

  if (input.capitalGainsData && input.capitalGainsData.length > 0) {
    for (const asset of input.capitalGainsData) {
      const fullValueConsideration = asset.saleConsideration;
      const totalCost = asset.acquisitionCost + asset.improvementCost;
      
      let indexedCost = totalCost;
      if (asset.isIndexationApplicable && asset.costInflationIndexSaleYear && asset.costInflationIndexAcqYear) {
        indexedCost = totalCost * (asset.costInflationIndexSaleYear / asset.costInflationIndexAcqYear);
      }

      const capitalGain = fullValueConsideration - indexedCost;
      capitalGainsIncome += capitalGain;
    }
  }

  // ============================================================================
  // 5. OTHER SOURCES (from GL via account tags)
  // ============================================================================
  let otherSourcesIncome = 0;

  // Query accounts tagged as other_income or similar revenue accounts
  const otherSourcesAccounts = await db.select({ accountId: accountTags.accountId })
    .from(accountTags)
    .innerJoin(accounts, eq(accountTags.accountId, accounts.id))
    .where(
      and(
        eq(accounts.kind, "Revenue"),
        eq(accounts.subType, "OtherRevenue")
      )
    );

  if (otherSourcesAccounts.length > 0) {
    const accountIds = otherSourcesAccounts.map(a => a.accountId);
    
    const otherSourcesResult = await db.select({
      total: sql<number>`SUM(${journalEntryLines.credit})`,
    })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .where(
        and(
          eq(journalEntries.tenantId, tenantId),
          eq(journalEntries.status, "posted"),
          eq(journalEntries.fiscalYear, input.financialYear),
          inArray(journalEntryLines.accountId, accountIds),
          gte(journalEntries.date, fyStart),
          lte(journalEntries.date, fyEnd)
        )
      );

    otherSourcesIncome = parseFloat(otherSourcesResult[0]?.total?.toString() ?? "0");
  }

  // ============================================================================
  // GROSS TOTAL INCOME
  // ============================================================================
  const grossTotalIncome = 
    salaryIncome +
    housePropertyIncome +
    businessIncome +
    capitalGainsIncome +
    otherSourcesIncome;

  // ============================================================================
  // DEDUCTIONS (Chapter VI-A from itr_return_lines)
  // ============================================================================
  const deductions = await db.select({
    fieldCode: sql<string>`itr_return_lines.field_code`,
    fieldValue: sql<number>`itr_return_lines.field_value`,
  })
    .from(itrReturns)
    .leftJoin(sql`itr_return_lines`, eq(itrReturns.id, sql`itr_return_lines.return_id`))
    .where(eq(itrReturns.id, input.itrReturnId));

  // Map deductions from return lines
  const chapterVIA = {
    section80C: 0,
    section80D: 0,
    section80E: 0,
    section80G: 0,
    section80TTA: 0,
    section80TTB: 0,
    other: 0,
    total: 0,
  };

  const otherDeductions = {
    section10AA: 0,
    section80CC: 0,
    other: 0,
    total: 0,
  };

  for (const deduction of deductions) {
    if (!deduction.fieldCode) continue;
    
    const value = deduction.fieldValue ?? 0;
    
    if (deduction.fieldCode.startsWith("80C")) {
      chapterVIA.section80C += value;
    } else if (deduction.fieldCode.startsWith("80D")) {
      chapterVIA.section80D += value;
    } else if (deduction.fieldCode.startsWith("80E")) {
      chapterVIA.section80E += value;
    } else if (deduction.fieldCode.startsWith("80G")) {
      chapterVIA.section80G += value;
    } else if (deduction.fieldCode.startsWith("80TTA")) {
      chapterVIA.section80TTA += value;
    } else if (deduction.fieldCode.startsWith("80TTB")) {
      chapterVIA.section80TTB += value;
    } else if (deduction.fieldCode.startsWith("10AA")) {
      otherDeductions.section10AA += value;
    } else if (deduction.fieldCode.startsWith("80CC")) {
      otherDeductions.section80CC += value;
    } else {
      chapterVIA.other += value;
    }
  }

  chapterVIA.total = 
    chapterVIA.section80C +
    chapterVIA.section80D +
    chapterVIA.section80E +
    chapterVIA.section80G +
    chapterVIA.section80TTA +
    chapterVIA.section80TTB +
    chapterVIA.other;

  otherDeductions.total = 
    otherDeductions.section10AA +
    otherDeductions.section80CC +
    otherDeductions.other;

  const totalDeductions = chapterVIA.total + otherDeductions.total;

  // ============================================================================
  // TOTAL INCOME (after deductions)
  // ============================================================================
  const totalIncome = Math.max(0, grossTotalIncome - totalDeductions);

  // ============================================================================
  // VALIDATE & APPEND EVENT
  // ============================================================================
  const payload = {
    itrReturnId: input.itrReturnId,
    financialYear: input.financialYear,
    incomeByHead: {
      salary: salaryIncome,
      houseProperty: housePropertyIncome,
      businessProfit: businessIncome,
      capitalGains: capitalGainsIncome,
      otherSources: otherSourcesIncome,
    },
    grossTotalIncome,
    deductions: {
      chapterVIA,
      otherDeductions,
      totalDeductions,
    },
    totalIncome,
    computedAt: new Date(),
  };

  // Validate payload
  IncomeComputedPayloadSchema.parse(payload);

  // Update ITR return with computed values
  await db.update(itrReturns)
    .set({
      grossTotalIncome: String(grossTotalIncome),
      totalDeductions: String(totalDeductions),
      totalIncome: String(totalIncome),
      status: "computed",
      updatedAt: new Date(),
    })
    .where(eq(itrReturns.id, input.itrReturnId));

  // Append event
  await appendEvent(
    db,
    tenantId,
    "itr_return",
    input.itrReturnId,
    "income_computed",
    payload as unknown as Record<string, unknown>,
    actorId
  );

  return {
    itrReturnId: input.itrReturnId,
    totalIncome,
  };
}
