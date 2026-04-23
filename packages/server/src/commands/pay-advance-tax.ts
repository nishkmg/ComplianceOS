// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { advanceTaxLedger } = _db;
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { ADVANCE_TAX_DUE_DATES, AdvanceTaxInstallmentNumber, RecordAdvanceTaxPaymentInputSchema } = _shared;

export interface PayAdvanceTaxOutput {
  installmentId: string;
  amount: string;
  dueDate: string;
  paidDate: string;
  interest234C: string;
}

const INTEREST_234C_RATE = 0.01; // 1% per month or part of month

/**
 * Calculate due date for advance tax installment
 */
function getDueDate(installmentNumber: string, assessmentYear: string): string {
  const [startYear, endYear] = assessmentYear.split("-");
  const dueMonthDay = ADVANCE_TAX_DUE_DATES[installmentNumber];
  const [month, day] = dueMonthDay.split("-");
  
  // 4th installment (March) falls in next calendar year
  const year = installmentNumber === AdvanceTaxInstallmentNumber.INSTALLMENT_4 
    ? endYear 
    : startYear;
  
  return `${year}-${month}-${day}`;
}

/**
 * Calculate interest 234C for delayed payment
 * Interest is 1% per month or part of month on shortfall
 */
function calculateInterest234C(
  amount: number,
  dueDate: string,
  paidDate: string
): number {
  const due = new Date(dueDate);
  const paid = new Date(paidDate);
  
  if (paid <= due) {
    return 0;
  }
  
  // Calculate months delayed (part of month counts as full month)
  let monthsDelayed = (paid.getFullYear() - due.getFullYear()) * 12;
  monthsDelayed += paid.getMonth() - due.getMonth();
  
  // If paid on different day, count as partial month
  if (paid.getDate() !== due.getDate()) {
    monthsDelayed += 1;
  }
  
  return Math.round(amount * INTEREST_234C_RATE * monthsDelayed * 100) / 100;
}

/**
 * Record advance tax installment payment.
 * 
 * Process:
 * 1. Validate assessment year format (YYYY-YY)
 * 2. Validate installment number (1-4)
 * 3. Calculate due date for installment
 * 4. Check if payment is delayed → calculate interest 234C
 * 5. Insert record into advance_tax_ledger table
 * 6. Append event: advance_tax_paid
 * 
 * Returns: { installmentId, amount, dueDate, paidDate, interest234C }
 */
export async function payAdvanceTax(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    assessmentYear: string;
    installmentNumber: any;
    amount: string;
    challanNumber: string;
    challanDate: string;
    paymentMode: "online" | "offline";
  },
): Promise<PayAdvanceTaxOutput> {
  // Validate input
  const validated = RecordAdvanceTaxPaymentInputSchema.parse({
    assessmentYear: input.assessmentYear,
    installmentNumber: input.installmentNumber,
    paidAmount: input.amount,
    paidDate: input.challanDate,
    challanNumber: input.challanNumber,
    challanDate: input.challanDate,
  });

  const { assessmentYear, installmentNumber, amount, challanNumber, challanDate } = input;

  // Validate assessment year format
  const fyRegex = /^\d{4}-\d{2}$/;
  if (!fyRegex.test(assessmentYear)) {
    throw new Error(`Invalid assessment year format: ${assessmentYear}. Expected YYYY-YY`);
  }

  // Validate installment number
  const validInstallments = Object.values(AdvanceTaxInstallmentNumber);
  // -ignore - type check
  if (!validInstallments.includes(installmentNumber as string)) {
    throw new Error(`Invalid installment number: ${installmentNumber}. Must be 1-4`);
  }

  // Validate amount
  const amountNum = parseFloat(amount);
  if (amountNum <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  // Calculate due date
  const dueDate = getDueDate(installmentNumber as string, assessmentYear);
  
  // Calculate interest 234C if delayed
  const interest234C = calculateInterest234C(amountNum, dueDate, challanDate);

  // Check for duplicate payment
  const existingPayment = await db.select()
    .from(advanceTaxLedger)
    .where(
      and(
        eq(advanceTaxLedger.tenantId, tenantId),
        eq(advanceTaxLedger.assessmentYear, assessmentYear),
        eq(advanceTaxLedger.installmentNumber, installmentNumber),
      ),
    );

  if (existingPayment.length > 0 && existingPayment[0].paidAmount !== "0") {
    throw new Error(
      `Advance tax for installment ${installmentNumber} (${assessmentYear}) already paid`
    );
  }

  // Insert record into advance_tax_ledger
  const installmentId = crypto.randomUUID();
  const paidAt = new Date();

  // -ignore - drizzle type
          await db.insert(advanceTaxLedger).values({
    id: installmentId,
    tenantId,
    assessmentYear,
    installmentNumber,
    dueDate,
    paidAmount: amount,
    paidDate: challanDate,
    challanNumber,
    challanDate,
    interest234c: interest234C.toString(),
    balance: "0",
    createdAt: paidAt,
  });

  const aggregateId = `${tenantId}-${assessmentYear}`;

  // Append event for audit trail
  await appendEvent(
    db,
    tenantId,
    "itr_return",
    aggregateId,
    "advance_tax_paid",
    {
      aggregateId,
      installmentId,
      tenantId,
      assessmentYear,
      installmentNumber,
      amount: amountNum,
      challanNumber,
      challanDate,
      interest234C,
      paidAt,
    },
    actorId,
  );

  return {
    installmentId,
    amount,
    dueDate,
    paidDate: challanDate,
    interest234C: interest234C.toString(),
  };
}
