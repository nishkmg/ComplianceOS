// @ts-nocheck
import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { itrReturns } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { TaxComputedPayloadSchema } = _shared;
import { TaxCalculator } from "../services/tax-calculator";

/**
 * Input schema for computeTax command
 */
export interface ComputeTaxInput {
  itrReturnId: string;
  taxRegime: "old" | "new";
  totalIncome: number;
  tdsTcsCredit: number;
  advanceTaxPaid: number;
  selfAssessmentTax?: number;
}

/**
 * Surcharge rate tiers based on total income
 */
const SURCHARGE_TIERS = [
  { limit: 5000000, rate: 0 },      // ≤ ₹50L: 0%
  { limit: 10000000, rate: 0.10 },  // > ₹50L - ₹1Cr: 10%
  { limit: 20000000, rate: 0.15 },  // > ₹1Cr - ₹2Cr: 15%
  { limit: 50000000, rate: 0.25 },  // > ₹2Cr - ₹5Cr: 25%
  { limit: Infinity, rate: 0.37 },  // > ₹5Cr: 37%
] as const;

const HEC_RATE = 0.04; // Health & Education Cess: 4%

/**
 * Rebate 87A limits by regime
 */
const REBATE_87A_LIMITS = {
  old: 500000,   // ₹5 lakhs for old regime
  new: 700000,   // ₹7 lakhs for new regime
} as const;

/**
 * Maximum rebate under 87A
 */
const MAX_REBATE_87A = {
  old: 12500,    // Max ₹12,500 for old regime
  new: 25000,    // Max ₹25,000 for new regime (FY 2023-24 onwards)
} as const;

/**
 * Compute tax liability under selected regime
 * 
 * Steps:
 * 1. Calculate tax as per regime slabs
 * 2. Apply rebate 87A if eligible
 * 3. Calculate surcharge (based on total income)
 * 4. Calculate 4% HEC
 * 5. Compute balance payable/refund
 */
export async function computeTax(
  db: Database,
  tenantId: string,
  actorId: string,
  input: ComputeTaxInput,
): Promise<{ itrReturnId: string; totalTaxPayable: number; balancePayable: number }> {
  // Validate ITR return exists
  const [itrReturn] = await db.select()
    .from(itrReturns)
    .where(eq(itrReturns.id, input.itrReturnId));

  if (!itrReturn) {
    throw new Error(`ITR return ${input.itrReturnId} not found`);
  }

  if (itrReturn.tenantId !== tenantId) {
    throw new Error("ITR return does not belong to this tenant");
  }

  if (itrReturn.status !== "computed") {
    throw new Error(
      `Cannot compute tax: ITR return status is '${itrReturn.status}', expected 'computed'. ` +
      "Please run computeIncome first."
    );
  }

  // ============================================================================
  // 1. CALCULATE TAX AS PER SELECTED REGIME
  // ============================================================================
  const taxCalculator = new TaxCalculator();
  
  let taxResult;
  if (input.taxRegime === "new") {
    // New regime (115BAC) - no deductions allowed
    taxResult = taxCalculator.calculateTaxNewRegime(input.totalIncome);
  } else {
    // Old regime - with deductions
    // Note: Deductions already applied in computeIncome, so we pass empty here
    // The totalIncome passed is already after deductions
    taxResult = taxCalculator.calculateTaxOldRegime(input.totalIncome, {});
  }

  const taxOnTotalIncome = taxResult.taxBeforeRebate;
  const rebate87A = taxResult.rebate87A;
  const taxAfterRebate = taxResult.taxAfterRebate;

  // ============================================================================
  // 2. CALCULATE SURCHARGE
  // ============================================================================
  const surchargeRate = getSurchargeRate(input.totalIncome);
  const surcharge = taxAfterRebate * surchargeRate;

  // ============================================================================
  // 3. CALCULATE HEALTH & EDUCATION CESS (4%)
  // ============================================================================
  const cess = (taxAfterRebate + surcharge) * HEC_RATE;

  // ============================================================================
  // 4. TOTAL TAX PAYABLE
  // ============================================================================
  const totalTaxPayable = taxAfterRebate + surcharge + cess;

  // ============================================================================
  // 5. COMPUTE BALANCE PAYABLE / REFUND
  // ============================================================================
  const selfAssessmentTax = input.selfAssessmentTax ?? 0;
  const totalTaxPaid = input.tdsTcsCredit + input.advanceTaxPaid + selfAssessmentTax;
  
  const balancePayable = totalTaxPayable - totalTaxPaid;
  const refundDue = balancePayable < 0 ? Math.abs(balancePayable) : 0;
  const finalBalancePayable = balancePayable > 0 ? balancePayable : 0;

  // ============================================================================
  // VALIDATE & APPEND EVENT
  // ============================================================================
  const payload = {
    itrReturnId: input.itrReturnId,
    taxRegime: input.taxRegime,
    taxOnTotalIncome: Math.round(taxOnTotalIncome),
    rebate87A: Math.round(rebate87A),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTaxPayable: Math.round(totalTaxPayable),
    tdsTcsCredit: input.tdsTcsCredit,
    advanceTaxPaid: input.advanceTaxPaid,
    balancePayable: Math.round(finalBalancePayable),
    computedAt: new Date(),
  };

  // Validate payload
  TaxComputedPayloadSchema.parse(payload);

  // Update ITR return with tax computation
  await db.update(itrReturns)
    .set({
      taxRegime: input.taxRegime,
      taxPayable: String(Math.round(totalTaxPayable)),
      surcharge: String(Math.round(surcharge)),
      cess: String(Math.round(cess)),
      rebate87a: String(Math.round(rebate87A)),
      advanceTaxPaid: String(input.advanceTaxPaid),
      selfAssessmentTax: String(selfAssessmentTax),
      tdsTcsCredit: String(input.tdsTcsCredit),
      totalTaxPaid: String(Math.round(totalTaxPaid)),
      balancePayable: String(Math.round(finalBalancePayable)),
      refundDue: String(Math.round(refundDue)),
      updatedAt: new Date(),
    })
    .where(eq(itrReturns.id, input.itrReturnId));

  // Append event
  await appendEvent(
    db,
    tenantId,
    "itr_return",
    input.itrReturnId,
    "tax_computed",
    payload as unknown as Record<string, unknown>,
    actorId
  );

  return {
    itrReturnId: input.itrReturnId,
    totalTaxPayable: Math.round(totalTaxPayable),
    balancePayable: Math.round(finalBalancePayable),
  };
}

/**
 * Get surcharge rate based on total income
 */
function getSurchargeRate(totalIncome: number): number {
  for (const tier of SURCHARGE_TIERS) {
    if (totalIncome < tier.limit) {
      return tier.rate;
    }
  }
  return SURCHARGE_TIERS[SURCHARGE_TIERS.length - 1].rate;
}
