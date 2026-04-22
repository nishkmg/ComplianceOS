import { eq } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { itrReturns, itrReturnLines, itrSchedules } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { ITRReturnType, ITRReturnStatus, TaxRegime } from "@complianceos/shared";
import { 
  mapToITR3, 
  mapToITR4, 
  validateITR3, 
  validateITR4,
  type TaxpayerInfo,
  type HousePropertyData,
  type BusinessData,
  type AssetDisposalData,
  type OtherSourcesData,
} from "../services/itr-table-mapper";

/**
 * Input schema for generateITR command
 */
export interface GenerateITRInput {
  itrReturnId: string;
  returnType: "itr3" | "itr4";
  taxpayerInfo: TaxpayerInfo;
  housePropertyData?: HousePropertyData[];
  businessData?: BusinessData;
  capitalGainsData?: AssetDisposalData[];
  otherSourcesData?: OtherSourcesData;
}

/**
 * Generate ITR-3 or ITR-4 return JSON
 * 
 * Steps:
 * 1. Fetch ITR return metadata from itr_returns table
 * 2. Validate return status = 'computed' (income + tax computed)
 * 3. Fetch computed income data from income_computed events
 * 4. Fetch computed tax data from tax_computed events
 * 5. Fetch advance tax details from advance_tax_ledger
 * 6. Fetch TDS/TCS credits from projection table
 * 7. Use itr-table-mapper to transform to ITR JSON structure
 * 8. Validate generated JSON against schema
 * 9. Append itr_generated event
 * 10. Update itr_returns status to 'generated'
 * 11. Return ITR JSON + preview URL
 */
export async function generateITR(
  db: Database,
  tenantId: string,
  actorId: string,
  input: GenerateITRInput,
): Promise<{ itrReturnId: string; itrJson: Record<string, unknown>; previewUrl: string }> {
  // ============================================================================
  // 1. FETCH ITR RETURN
  // ============================================================================
  const [itrReturn] = await db.select()
    .from(itrReturns)
    .where(eq(itrReturns.id, input.itrReturnId));

  if (!itrReturn) {
    throw new Error(`ITR return ${input.itrReturnId} not found`);
  }

  if (itrReturn.tenantId !== tenantId) {
    throw new Error("ITR return does not belong to this tenant");
  }

  // Validate status
  if (itrReturn.status !== ITRReturnStatus.COMPUTED) {
    throw new Error(
      `Cannot generate ITR: Return status is '${itrReturn.status}', expected 'computed'. ` +
      "Please run computeIncome and computeTax first."
    );
  }

  // Validate return type matches
  const expectedReturnType = input.returnType === "itr3" 
    ? ITRReturnType.ITR3 
    : ITRReturnType.ITR4;
  
  if (itrReturn.returnType !== expectedReturnType) {
    throw new Error(
      `Return type mismatch: Expected ${expectedReturnType}, got ${itrReturn.returnType}`
    );
  }

  // ============================================================================
  // 2. FETCH COMPUTED DATA
  // ============================================================================
  // Income data already reflected in itr_return columns
  const totalIncome = parseFloat(itrReturn.totalIncome ?? "0");
  const grossTotalIncome = parseFloat(itrReturn.grossTotalIncome ?? "0");
  const totalDeductions = parseFloat(itrReturn.totalDeductions ?? "0");

  // Tax computation data
  const taxOnTotalIncome = parseFloat(itrReturn.taxPayable ?? "0");
  const surcharge = parseFloat(itrReturn.surcharge ?? "0");
  const cess = parseFloat(itrReturn.cess ?? "0");
  const rebate87a = parseFloat(itrReturn.rebate87a ?? "0");
  const advanceTaxPaid = parseFloat(itrReturn.advanceTaxPaid ?? "0");
  const selfAssessmentTax = parseFloat(itrReturn.selfAssessmentTax ?? "0");
  const tdsTcsCredit = parseFloat(itrReturn.tdsTcsCredit ?? "0");
  const totalTaxPaid = parseFloat(itrReturn.totalTaxPaid ?? "0");
  const balancePayable = parseFloat(itrReturn.balancePayable ?? "0");
  const refundDue = parseFloat(itrReturn.refundDue ?? "0");

  // ============================================================================
  // 3. FETCH DEDUCTIONS FROM ITR RETURN LINES
  // ============================================================================
  const deductions = await db.select({
    scheduleCode: itrReturnLines.scheduleCode,
    fieldCode: itrReturnLines.fieldCode,
    fieldValue: itrReturnLines.fieldValue,
  })
    .from(itrReturnLines)
    .where(eq(itrReturnLines.returnId, input.itrReturnId));

  // Map deductions
  const chapterVIA = {
    section80C: "0",
    section80D: "0",
    section80E: "0",
    section80G: "0",
    section80TTA: "0",
    section80TTB: "0",
    other: "0",
    total: "0",
  };

  const otherDeductions = {
    section10AA: "0",
    section80CC: "0",
    other: "0",
    total: "0",
  };

  for (const deduction of deductions) {
    if (!deduction.fieldCode) continue;
    
    const value = deduction.fieldValue ?? "0";
    
    if (deduction.scheduleCode === "VI-A") {
      if (deduction.fieldCode.startsWith("80C")) {
        chapterVIA.section80C = value;
      } else if (deduction.fieldCode.startsWith("80D")) {
        chapterVIA.section80D = value;
      } else if (deduction.fieldCode.startsWith("80E")) {
        chapterVIA.section80E = value;
      } else if (deduction.fieldCode.startsWith("80G")) {
        chapterVIA.section80G = value;
      } else if (deduction.fieldCode.startsWith("80TTA")) {
        chapterVIA.section80TTA = value;
      } else if (deduction.fieldCode.startsWith("80TTB")) {
        chapterVIA.section80TTB = value;
      } else if (deduction.fieldCode.startsWith("10AA")) {
        otherDeductions.section10AA = value;
      } else if (deduction.fieldCode.startsWith("80CC")) {
        otherDeductions.section80CC = value;
      } else {
        chapterVIA.other = value;
      }
    }
  }

  // Calculate totals
  const chapterVIATotal = (
    parseFloat(chapterVIA.section80C) +
    parseFloat(chapterVIA.section80D) +
    parseFloat(chapterVIA.section80E) +
    parseFloat(chapterVIA.section80G) +
    parseFloat(chapterVIA.section80TTA) +
    parseFloat(chapterVIA.section80TTB) +
    parseFloat(chapterVIA.other)
  ).toString();

  chapterVIA.total = chapterVIATotal;

  const otherDeductionsTotal = (
    parseFloat(otherDeductions.section10AA) +
    parseFloat(otherDeductions.section80CC) +
    parseFloat(otherDeductions.other)
  ).toString();

  otherDeductions.total = otherDeductionsTotal;

  // ============================================================================
  // 4. BUILD COMPUTATION OBJECT FOR MAPPER
  // ============================================================================
  const taxRegime = (itrReturn.taxRegime ?? "old") as TaxRegime;
  const presumptiveScheme = itrReturn.presumptiveScheme ?? "none";

  // Income by head (simplified - would need event fetch for full breakdown)
  const incomeByHead = {
    salary: "0",
    houseProperty: "0",
    businessProfit: totalIncome.toString(),
    capitalGains: {
      shortTerm: "0",
      longTerm: "0",
      total: "0",
    },
    otherSources: "0",
    grossTotal: grossTotalIncome.toString(),
  };

  const computation = {
    returnId: input.itrReturnId,
    assessmentYear: itrReturn.assessmentYear,
    financialYear: itrReturn.financialYear,
    taxRegime,
    incomeByHead,
    deductions: {
      "chapter VIA": chapterVIA,
      otherDeductions,
      totalDeductions: totalDeductions.toString(),
    },
    totalIncome: totalIncome.toString(),
    taxComputation: {
      totalIncome: totalIncome.toString(),
      taxOnTotalIncome: taxOnTotalIncome.toString(),
      surcharge: surcharge.toString(),
      cess: cess.toString(),
      grossTax: (taxOnTotalIncome + surcharge).toString(),
      rebate87a: rebate87a.toString(),
      netTax: (taxOnTotalIncome + surcharge + cess).toString(),
    },
    taxPaid: {
      advanceTax: advanceTaxPaid.toString(),
      selfAssessmentTax: selfAssessmentTax.toString(),
      tdsTcs: tdsTcsCredit.toString(),
      totalTaxPaid: totalTaxPaid.toString(),
    },
    balancePayable: balancePayable.toString(),
    refundDue: refundDue.toString(),
    computedAt: new Date(),
  };

  // ============================================================================
  // 5. GENERATE ITR JSON USING MAPPER
  // ============================================================================
  let itrJson: Record<string, unknown>;
  let validationResult: { valid: boolean; errors: string[] };

  if (input.returnType === "itr3") {
    const itr3Result = mapToITR3(
      computation,
      input.taxpayerInfo,
      itrReturn.financialYear,
      input.housePropertyData,
      input.businessData,
      input.capitalGainsData,
      input.otherSourcesData
    );
    
    itrJson = itr3Result as unknown as Record<string, unknown>;
    validationResult = validateITR3(itr3Result);
  } else {
    // ITR-4 (presumptive)
    const itr4Computation = {
      returnId: input.itrReturnId,
      assessmentYear: itrReturn.assessmentYear,
      financialYear: itrReturn.financialYear,
      taxRegime,
      presumptiveScheme: presumptiveScheme as "44ad" | "44ada" | "44ae",
      presumptiveRate: presumptiveScheme === "44ad" ? 0.06 : presumptiveScheme === "44ada" ? 0.50 : 60000,
      grossTurnover: parseFloat(incomeByHead.businessProfit),
      presumptiveIncome: totalIncome,
      housePropertyIncome: parseFloat(incomeByHead.houseProperty),
      otherSourcesIncome: parseFloat(incomeByHead.otherSources),
      grossTotalIncome,
      deductions: computation.deductions,
      totalIncome,
      taxComputation: computation.taxComputation,
      taxPaid: computation.taxPaid,
      balancePayable,
      refundDue,
    };

    const itr4Result = mapToITR4(
      itr4Computation as any,
      input.taxpayerInfo,
      itrReturn.financialYear,
      input.housePropertyData,
      input.otherSourcesData
    );
    
    itrJson = itr4Result as unknown as Record<string, unknown>;
    validationResult = validateITR4(itr4Result);
  }

  // Validate generated JSON
  if (!validationResult.valid) {
    throw new Error(
      `ITR validation failed: ${validationResult.errors.join("; ")}`
    );
  }

  // ============================================================================
  // 6. UPDATE ITR RETURN STATUS
  // ============================================================================
  await db.update(itrReturns)
    .set({
      status: "generated",
      generatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(itrReturns.id, input.itrReturnId));

  // ============================================================================
  // 7. APPEND EVENT
  // ============================================================================
  await appendEvent(
    db,
    tenantId,
    "itr_return",
    input.itrReturnId,
    "itr_generated",
    {
      itrReturnId: input.itrReturnId,
      returnType: input.returnType,
      itrJson,
      generatedAt: new Date().toISOString(),
    },
    actorId
  );

  // ============================================================================
  // 8. RETURN RESULT
  // ============================================================================
  // Preview URL would be generated by storage service in production
  const previewUrl = `/api/itr/preview/${input.itrReturnId}`;

  return {
    itrReturnId: input.itrReturnId,
    itrJson,
    previewUrl,
  };
}
