// @ts-nocheck
import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { gstCashLedger, fiscalYears } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { CreateGSTChallanInputSchema } = _shared;

export interface CreateGSTChallanOutput {
  challanId: string;
  challanNumber: string;
  cin: string;
  amount: string;
  validUpto: Date;
}

/**
 * Generate CPIN (Challan Identification Number) for GST payment.
 * Format: CPIN-YYYYMMDD-XXXXXX (6-digit sequence)
 */
function generateChallanNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  const sequence = Math.floor(100000 + Math.random() * 900000);
  return `CPIN-${dateStr}-${sequence}`;
}

/**
 * Generate CIN (Challan Identification Number) - 14-digit unique number.
 * Format: BSR code (7) + date (6) + sequence (1) = 14 digits
 * For simplicity, using timestamp-based generation.
 */
function generateCIN(challanNumber: string): string {
  // BSR code placeholder (actual BSR comes from bank)
  const bsrCode = "0000000";
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const sequence = challanNumber.split("-")[2] || "000000";
  return `${bsrCode}${dateStr}${sequence.charAt(0)}`;
}

/**
 * Create GST challan for tax payment.
 * 
 * Input:
 * - periodMonth, periodYear: Tax period
 * - taxAmounts: IGST, CGST, SGST, cess, interest, penalty
 * 
 * Process:
 * 1. Validate input
 * 2. Generate challan number (CPIN format)
 * 3. Create record in gst_cash_ledger (status: pending)
 * 4. Append `gst_challan_created` event
 * 
 * Returns: { challanId, challanNumber, cin, amount, validUpto }
 * 
 * Validity: Challan valid for 15 days from generation
 */
export async function createGSTChallan(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    periodMonth: number;
    periodYear: number;
    taxAmounts: {
      igst?: string;
      cgst?: string;
      sgst?: string;
      cess?: string;
      interest?: string;
      penalty?: string;
    };
  },
): Promise<CreateGSTChallanOutput> {
  const validated = CreateGSTChallanInputSchema.parse(input);

  const { periodMonth, periodYear, taxAmounts } = validated;

  // Calculate total amount
  const totalAmount = (
    parseFloat(taxAmounts.igst || "0") +
    parseFloat(taxAmounts.cgst || "0") +
    parseFloat(taxAmounts.sgst || "0") +
    parseFloat(taxAmounts.cess || "0") +
    parseFloat(taxAmounts.interest || "0") +
    parseFloat(taxAmounts.penalty || "0")
  ).toString();

  if (parseFloat(totalAmount) <= 0) {
    throw new Error("Total challan amount must be greater than zero");
  }

  // Generate challan number and CIN
  const challanNumber = generateChallanNumber();
  const cin = generateCIN(challanNumber);

  // Challan valid for 15 days
  const validUpto = new Date();
  validUpto.setDate(validUpto.getDate() + 15);

  // Get fiscal year
  const fiscalYear = getFYForPeriod(periodMonth, periodYear);
  const fyResult = await db.select({ id: fiscalYears.id })
    .from(fiscalYears)
    .where(eq(fiscalYears.year, fiscalYear))
    .limit(1);
  
  const fiscalYearId = fyResult.length > 0 ? fyResult[0].id : fiscalYear;

  const transactionDate = new Date().toISOString().split("T")[0];

  // Create challan records in cash ledger (one per tax type)
  const challanRecords = [];
  
  const taxTypes = [
    { type: "igst", amount: taxAmounts.igst },
    { type: "cgst", amount: taxAmounts.cgst },
    { type: "sgst", amount: taxAmounts.sgst },
    { type: "cess", amount: taxAmounts.cess },
  ] as const;

  for (const tax of taxTypes) {
    if (tax.amount && parseFloat(tax.amount) > 0) {
      const [record] = // -ignore - drizzle type
          await db.insert(gstCashLedger).values({
        tenantId,
        transactionType: "payment",
        taxType: tax.type,
        amount: tax.amount,
        balance: "0", // Will be updated on payment
        transactionDate,
        challanNumber,
        challanDate: transactionDate,
        narration: `GST challan for ${periodMonth}/${periodYear}`,
        fiscalYear: fiscalYearId,
        createdBy: actorId,
      }).returning({ id: gstCashLedger.id });
      
      challanRecords.push(record);
    }
  }

  // Handle interest and penalty if present
  if (taxAmounts.interest && parseFloat(taxAmounts.interest) > 0) {
    // -ignore - drizzle type
          await db.insert(gstCashLedger).values({
      tenantId,
      transactionType: "interest",
      taxType: "igst", // Interest typically tracked under IGST
      amount: taxAmounts.interest,
      balance: "0",
      transactionDate,
      challanNumber,
      challanDate: transactionDate,
      narration: `Interest on GST for ${periodMonth}/${periodYear}`,
      fiscalYear: fiscalYearId,
      createdBy: actorId,
    });
  }

  if (taxAmounts.penalty && parseFloat(taxAmounts.penalty) > 0) {
    // -ignore - drizzle type
          await db.insert(gstCashLedger).values({
      tenantId,
      transactionType: "penalty",
      taxType: "igst", // Penalty typically tracked under IGST
      amount: taxAmounts.penalty,
      balance: "0",
      transactionDate,
      challanNumber,
      challanDate: transactionDate,
      narration: `Penalty on GST for ${periodMonth}/${periodYear}`,
      fiscalYear: fiscalYearId,
      createdBy: actorId,
    });
  }

  // Use first challan record ID as the main challan ID
  const challanId = challanRecords.length > 0 ? challanRecords[0].id : crypto.randomUUID();

  // Append event for audit trail
  await appendEvent(
    db,
    tenantId,
    "gst_challan",
    challanId,
    "gst_challan_created",
    {
      challanId,
      challanNumber,
      cin,
      periodMonth,
      periodYear,
      taxAmounts: {
        igst: taxAmounts.igst || "0",
        cgst: taxAmounts.cgst || "0",
        sgst: taxAmounts.sgst || "0",
        cess: taxAmounts.cess || "0",
        interest: taxAmounts.interest || "0",
        penalty: taxAmounts.penalty || "0",
      },
      totalAmount,
      validUpto: validUpto.toISOString(),
      status: "pending",
    },
    actorId,
  );

  return {
    challanId,
    challanNumber,
    cin,
    amount: totalAmount,
    validUpto,
  };
}

function getFYForPeriod(periodMonth: number, periodYear: number): string {
  const startYear = periodMonth >= 4 ? periodYear : periodYear - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}
