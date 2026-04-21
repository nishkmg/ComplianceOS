import { eq, and, sql } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { gstReturns, gstReturnLines } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { GenerateGSTR3BInputSchema, GSTReturnStatus } from "@complianceos/shared";

export async function generateGSTR3B(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    periodMonth: number;
    periodYear: number;
  },
): Promise<{ 
  returnId: string; 
  taxPayable: Record<string, string>; 
  itcUtilized: Record<string, string>; 
  cashRequired: Record<string, string>;
}> {
  const validated = GenerateGSTR3BInputSchema.parse(input);

  // Check if return already exists and filed
  const existingReturn = await db.select().from(gstReturns).where(
    and(
      eq(gstReturns.tenantId, tenantId),
      eq(gstReturns.returnType, "gstr3b"),
      eq(gstReturns.taxPeriodMonth, String(validated.periodMonth)),
      eq(gstReturns.taxPeriodYear, String(validated.periodYear)),
    ),
  ).limit(1);

  if (existingReturn.length > 0 && existingReturn[0].status === "filed") {
    throw new Error(`GSTR-3B for ${validated.periodMonth}/${validated.periodYear} already filed`);
  }

  // Load GSTR1 data (outward supplies)
  const gstr1Return = await db.select().from(gstReturns).where(
    and(
      eq(gstReturns.tenantId, tenantId),
      eq(gstReturns.returnType, "gstr1"),
      eq(gstReturns.taxPeriodMonth, String(validated.periodMonth)),
      eq(gstReturns.taxPeriodYear, String(validated.periodYear)),
      eq(gstReturns.status, "generated"),
    ),
  ).limit(1);

  if (gstr1Return.length === 0) {
    throw new Error(`GSTR-1 for ${validated.periodMonth}/${validated.periodYear} not generated. Generate GSTR-1 first.`);
  }

  // Load GSTR1 lines
  const gstr1Lines = await db.select().from(gstReturnLines).where(
    eq(gstReturnLines.gstReturnId, gstr1Return[0].id),
  );

  // Calculate outward supply tax liability (Table 3.1 of GSTR-3B)
  let outwardIGST = 0;
  let outwardCGST = 0;
  let outwardSGST = 0;
  let outwardCess = 0;
  let outwardTaxableValue = 0;

  for (const line of gstr1Lines) {
    outwardIGST += Number(line.igstAmount);
    outwardCGST += Number(line.cgstAmount);
    outwardSGST += Number(line.sgstAmount);
    outwardCess += Number(line.cessAmount);
    outwardTaxableValue += Number(line.taxableValue);
  }

  // Load GSTR2B data (eligible ITC)
  const gstr2bReturn = await db.select().from(gstReturns).where(
    and(
      eq(gstReturns.tenantId, tenantId),
      eq(gstReturns.returnType, "gstr2b"),
      eq(gstReturns.taxPeriodMonth, String(validated.periodMonth)),
      eq(gstReturns.taxPeriodYear, String(validated.periodYear)),
      eq(gstReturns.status, "generated"),
    ),
  ).limit(1);

  if (gstr2bReturn.length === 0) {
    throw new Error(`GSTR-2B for ${validated.periodMonth}/${validated.periodYear} not generated. Generate GSTR-2B first.`);
  }

  // Load GSTR2B lines
  const gstr2bLines = await db.select().from(gstReturnLines).where(
    eq(gstReturnLines.gstReturnId, gstr2bReturn[0].id),
  );

  // Calculate eligible ITC (Table 4 of GSTR-3B)
  let eligibleIGST = 0;
  let eligibleCGST = 0;
  let eligibleSGST = 0;
  let eligibleCess = 0;

  for (const line of gstr2bLines) {
    eligibleIGST += Number(line.igstAmount);
    eligibleCGST += Number(line.cgstAmount);
    eligibleSGST += Number(line.sgstAmount);
    eligibleCess += Number(line.cessAmount);
  }

  // Load opening ITC balance from ledger (simplified - would come from gstLedgers table)
  // For now, assume zero opening balance
  const openingIGST = 0;
  const openingCGST = 0;
  const openingSGST = 0;

  // Total ITC available
  const totalIGST = openingIGST + eligibleIGST;
  const totalCGST = openingCGST + eligibleCGST;
  const totalSGST = openingSGST + eligibleSGST;

  // Calculate net tax payable
  let netIGST = outwardIGST - totalIGST;
  let netCGST = outwardCGST - totalCGST;
  let netSGST = outwardSGST - totalSGST;
  let netCess = outwardCess - eligibleCess;

  // ITC utilization order as per GST rules:
  // 1. IGST credit: first IGST liability, then CGST, then SGST (any order for CGST/SGST)
  // 2. CGST credit: first CGST liability, then IGST (NOT SGST)
  // 3. SGST credit: first SGST liability, then IGST (NOT CGST)

  const itcUtilized = {
    igst: {
      forIGST: 0,
      forCGST: 0,
      forSGST: 0,
    },
    cgst: {
      forCGST: 0,
      forIGST: 0,
    },
    sgst: {
      forSGST: 0,
      forIGST: 0,
    },
  };

  // Step 1: Use IGST credit for IGST liability
  if (netIGST > 0) {
    const usedForIGST = Math.min(totalIGST, netIGST);
    itcUtilized.igst.forIGST = usedForIGST;
    netIGST -= usedForIGST;
  }

  // Step 2: Use remaining IGST credit for CGST liability
  const remainingIGST = totalIGST - itcUtilized.igst.forIGST;
  if (netCGST > 0 && remainingIGST > 0) {
    const usedForCGST = Math.min(remainingIGST, netCGST);
    itcUtilized.igst.forCGST = usedForCGST;
    netCGST -= usedForCGST;
  }

  // Step 3: Use remaining IGST credit for SGST liability
  const remainingIGSTAfterCGST = remainingIGST - itcUtilized.igst.forCGST;
  if (netSGST > 0 && remainingIGSTAfterCGST > 0) {
    const usedForSGST = Math.min(remainingIGSTAfterCGST, netSGST);
    itcUtilized.igst.forSGST = usedForSGST;
    netSGST -= usedForSGST;
  }

  // Step 4: Use CGST credit for CGST liability
  if (netCGST > 0) {
    const usedForCGST = Math.min(totalCGST, netCGST);
    itcUtilized.cgst.forCGST = usedForCGST;
    netCGST -= usedForCGST;
  }

  // Step 5: Use remaining CGST credit for IGST liability
  const remainingCGST = totalCGST - itcUtilized.cgst.forCGST;
  if (netIGST > 0 && remainingCGST > 0) {
    const usedForIGST = Math.min(remainingCGST, netIGST);
    itcUtilized.cgst.forIGST = usedForIGST;
    netIGST -= usedForIGST;
  }

  // Step 6: Use SGST credit for SGST liability
  if (netSGST > 0) {
    const usedForSGST = Math.min(totalSGST, netSGST);
    itcUtilized.sgst.forSGST = usedForSGST;
    netSGST -= usedForSGST;
  }

  // Step 7: Use remaining SGST credit for IGST liability
  const remainingSGST = totalSGST - itcUtilized.sgst.forSGST;
  if (netIGST > 0 && remainingSGST > 0) {
    const usedForIGST = Math.min(remainingSGST, netIGST);
    itcUtilized.sgst.forIGST = usedForIGST;
    netIGST -= usedForIGST;
  }

  // Cash required = remaining liability after ITC utilization
  const cashRequired = {
    igst: String(Math.max(0, netIGST)),
    cgst: String(Math.max(0, netCGST)),
    sgst: String(Math.max(0, netSGST)),
    cess: String(Math.max(0, netCess)),
  };

  const totalCashRequired = Number(cashRequired.igst) + Number(cashRequired.cgst) + Number(cashRequired.sgst) + Number(cashRequired.cess);

  // Create or update GSTR-3B return
  let returnId: string;

  if (existingReturn.length > 0) {
    // Update existing draft/generated return
    const updateResult = await db.update(gstReturns).set({
      status: "generated",
      totalOutwardSupplies: String(outwardTaxableValue),
      totalEligibleItc: String(eligibleIGST + eligibleCGST + eligibleSGST + eligibleCess),
      totalTaxPayable: String(outwardIGST + outwardCGST + outwardSGST + outwardCess),
      totalTaxPaid: String(totalCashRequired),
      updatedAt: new Date(),
    }).where(
      eq(gstReturns.id, existingReturn[0].id),
    ).returning({ id: gstReturns.id });

    returnId = updateResult[0].id;

    // Delete old lines
    await db.delete(gstReturnLines).where(eq(gstReturnLines.gstReturnId, returnId));
  } else {
    // Create new return
    const createResult = await db.insert(gstReturns).values({
      tenantId,
      returnNumber: `GSTR3B-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
      returnType: "gstr3b",
      taxPeriodMonth: String(validated.periodMonth),
      taxPeriodYear: String(validated.periodYear),
      fiscalYear: `${validated.periodYear}-${String(validated.periodYear + 1).slice(-2)}`,
      status: "generated",
      dueDate: new Date(validated.periodYear, validated.periodMonth, 20).toISOString().split("T")[0], // 20th of next month
      totalOutwardSupplies: String(outwardTaxableValue),
      totalEligibleItc: String(eligibleIGST + eligibleCGST + eligibleSGST + eligibleCess),
      totalTaxPayable: String(outwardIGST + outwardCGST + outwardSGST + outwardCess),
      totalTaxPaid: String(totalCashRequired),
      createdBy: actorId,
    }).returning({ id: gstReturns.id });

    returnId = createResult[0].id;
  }

  // Insert return lines for GSTR-3B tables
  const allLines: Array<typeof gstReturnLines.$inferInsert> = [];

  // Table 3.1: Outward supplies
  allLines.push({
    gstReturnId: returnId,
    tableNumber: "3.1",
    tableDescription: "Outward taxable supplies",
    transactionType: "outward",
    placeOfSupply: "IN",
    taxableValue: String(outwardTaxableValue),
    igstAmount: String(outwardIGST),
    cgstAmount: String(outwardCGST),
    sgstAmount: String(outwardSGST),
    cessAmount: String(outwardCess),
    totalTaxAmount: String(outwardIGST + outwardCGST + outwardSGST + outwardCess),
    sourceDocumentType: "consolidated",
    sourceDocumentNumber: `OUTWARD-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
    sourceDocumentDate: new Date(validated.periodYear, validated.periodMonth - 1, 1).toISOString().split("T")[0],
    gstin: null,
    partyName: "Consolidated Outward Supplies",
  });

  // Table 4: ITC details
  allLines.push({
    gstReturnId: returnId,
    tableNumber: "4",
    tableDescription: "Eligible ITC",
    transactionType: "inward",
    placeOfSupply: "IN",
    taxableValue: "0",
    igstAmount: String(eligibleIGST),
    cgstAmount: String(eligibleCGST),
    sgstAmount: String(eligibleSGST),
    cessAmount: String(eligibleCess),
    totalTaxAmount: String(eligibleIGST + eligibleCGST + eligibleSGST + eligibleCess),
    sourceDocumentType: "consolidated",
    sourceDocumentNumber: `ITC-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
    sourceDocumentDate: new Date(validated.periodYear, validated.periodMonth - 1, 1).toISOString().split("T")[0],
    gstin: null,
    partyName: "Consolidated ITC",
  });

  // Table 5: ITC utilized
  allLines.push({
    gstReturnId: returnId,
    tableNumber: "5",
    tableDescription: "ITC utilized for payment of tax",
    transactionType: "itc_utilization",
    placeOfSupply: "IN",
    taxableValue: "0",
    igstAmount: String(itcUtilized.igst.forIGST + itcUtilized.igst.forCGST + itcUtilized.igst.forSGST),
    cgstAmount: String(itcUtilized.cgst.forCGST + itcUtilized.cgst.forIGST),
    sgstAmount: String(itcUtilized.sgst.forSGST + itcUtilized.sgst.forIGST),
    cessAmount: "0",
    totalTaxAmount: String(
      itcUtilized.igst.forIGST + itcUtilized.igst.forCGST + itcUtilized.igst.forSGST +
      itcUtilized.cgst.forCGST + itcUtilized.cgst.forIGST +
      itcUtilized.sgst.forSGST + itcUtilized.sgst.forIGST
    ),
    sourceDocumentType: "consolidated",
    sourceDocumentNumber: `ITC-UTIL-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
    sourceDocumentDate: new Date(validated.periodYear, validated.periodMonth - 1, 1).toISOString().split("T")[0],
    gstin: null,
    partyName: "ITC Utilization",
  });

  // Table 6: Tax payable and paid
  allLines.push({
    gstReturnId: returnId,
    tableNumber: "6",
    tableDescription: "Tax payable and paid",
    transactionType: "tax_payment",
    placeOfSupply: "IN",
    taxableValue: "0",
    igstAmount: String(outwardIGST),
    cgstAmount: String(outwardCGST),
    sgstAmount: String(outwardSGST),
    cessAmount: String(outwardCess),
    totalTaxAmount: String(outwardIGST + outwardCGST + outwardSGST + outwardCess),
    sourceDocumentType: "consolidated",
    sourceDocumentNumber: `TAX-PAY-${validated.periodYear}-${String(validated.periodMonth).padStart(2, "0")}`,
    sourceDocumentDate: new Date(validated.periodYear, validated.periodMonth - 1, 1).toISOString().split("T")[0],
    gstin: null,
    partyName: "Tax Liability",
    remarks: `Cash: ${totalCashRequired}`,
  });

  if (allLines.length > 0) {
    await db.insert(gstReturnLines).values(allLines);
  }

  // Append event
  await appendEvent(db, tenantId, "gst_return", returnId, "gstr3b_generated", {
    returnId,
    periodMonth: validated.periodMonth,
    periodYear: validated.periodYear,
    status: GSTReturnStatus.GENERATED,
    summary: {
      outward_supplies: String(outwardTaxableValue),
      outward_tax: String(outwardIGST + outwardCGST + outwardSGST + outwardCess),
      eligible_itc: String(eligibleIGST + eligibleCGST + eligibleSGST + eligibleCess),
      itc_utilized: String(
        itcUtilized.igst.forIGST + itcUtilized.igst.forCGST + itcUtilized.igst.forSGST +
        itcUtilized.cgst.forCGST + itcUtilized.cgst.forIGST +
        itcUtilized.sgst.forSGST + itcUtilized.sgst.forIGST
      ),
      cash_required: String(totalCashRequired),
      igst_payable: String(outwardIGST),
      cgst_payable: String(outwardCGST),
      sgst_payable: String(outwardSGST),
      cess_payable: String(outwardCess),
    },
    itcUtilization: {
      igst: {
        forIGST: String(itcUtilized.igst.forIGST),
        forCGST: String(itcUtilized.igst.forCGST),
        forSGST: String(itcUtilized.igst.forSGST),
      },
      cgst: {
        forCGST: String(itcUtilized.cgst.forCGST),
        forIGST: String(itcUtilized.cgst.forIGST),
      },
      sgst: {
        forSGST: String(itcUtilized.sgst.forSGST),
        forIGST: String(itcUtilized.sgst.forIGST),
      },
    },
    generatedAt: new Date().toISOString(),
  }, actorId);

  return {
    returnId,
    taxPayable: {
      igst: String(outwardIGST),
      cgst: String(outwardCGST),
      sgst: String(outwardSGST),
      cess: String(outwardCess),
      total: String(outwardIGST + outwardCGST + outwardSGST + outwardCess),
    },
    itcUtilized: {
      igst: String(itcUtilized.igst.forIGST + itcUtilized.igst.forCGST + itcUtilized.igst.forSGST),
      cgst: String(itcUtilized.cgst.forCGST + itcUtilized.cgst.forIGST),
      sgst: String(itcUtilized.sgst.forSGST + itcUtilized.sgst.forIGST),
      total: String(
        itcUtilized.igst.forIGST + itcUtilized.igst.forCGST + itcUtilized.igst.forSGST +
        itcUtilized.cgst.forCGST + itcUtilized.cgst.forIGST +
        itcUtilized.sgst.forSGST + itcUtilized.sgst.forIGST
      ),
    },
    cashRequired: {
      igst: cashRequired.igst,
      cgst: cashRequired.cgst,
      sgst: cashRequired.sgst,
      cess: cashRequired.cess,
      total: String(totalCashRequired),
    },
  };
}
