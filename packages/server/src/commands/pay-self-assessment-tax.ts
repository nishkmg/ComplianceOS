import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { selfAssessmentLedger, itrReturns } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { RecordSelfAssessmentTaxInputSchema } from "@complianceos/shared";

export interface PaySelfAssessmentTaxOutput {
  paymentId: string;
  amount: string;
  balanceAfterPayment: string;
  paidDate: string;
}

/**
 * Record self-assessment tax payment.
 * 
 * Process:
 * 1. Validate assessment year format (YYYY-YY)
 * 2. Fetch ITR return and validate exists
 * 3. Fetch total tax payable from itr_returns table
 * 4. Fetch advance tax paid and TDS/TCS credits
 * 5. Calculate balance payable: taxPayable - advanceTax - tdsTcs
 * 6. Validate payment amount matches balance
 * 7. Insert record into self_assessment_ledger table
 * 8. Update itr_returns table with self-assessment tax
 * 9. Append event: self_assessment_tax_paid
 * 
 * Returns: { paymentId, amount, balanceAfterPayment, paidDate }
 */
export async function paySelfAssessmentTax(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    assessmentYear: string;
    itrReturnId: string;
    amount: string;
    challanNumber: string;
    challanDate: string;
    paymentMode: "online" | "offline";
  },
): Promise<PaySelfAssessmentTaxOutput> {
  const { assessmentYear, itrReturnId, amount, challanNumber, challanDate } = input;

  // Validate assessment year format
  const fyRegex = /^\d{4}-\d{2}$/;
  if (!fyRegex.test(assessmentYear)) {
    throw new Error(`Invalid assessment year format: ${assessmentYear}. Expected YYYY-YY`);
  }

  // Validate amount is positive
  const amountNum = parseFloat(amount);
  if (amountNum <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  // Fetch ITR return
  const [itrReturn] = await db.select()
    .from(itrReturns)
    .where(
      and(
        eq(itrReturns.tenantId, tenantId),
        eq(itrReturns.id, itrReturnId),
      ),
    );

  if (!itrReturn) {
    throw new Error(`ITR return ${itrReturnId} not found`);
  }

  // Validate tenant ownership
  if (itrReturn.tenantId !== tenantId) {
    throw new Error("ITR return does not belong to this tenant");
  }

  // Validate status is computed
  if (itrReturn.status !== "computed") {
    throw new Error(
      `Cannot record self-assessment tax: ITR return status is '${itrReturn.status}', expected 'computed'. ` +
      "Please run computeTax first."
    );
  }

  // Calculate balance payable from ITR return
  const taxPayable = parseFloat(itrReturn.taxPayable || "0");
  const advanceTaxPaid = parseFloat(itrReturn.advanceTaxPaid || "0");
  const tdsTcsCredit = parseFloat(itrReturn.tdsTcsCredit || "0");
  const existingSelfAssessmentTax = parseFloat(itrReturn.selfAssessmentTax || "0");
  const balancePayable = parseFloat(itrReturn.balancePayable || "0");

  // Check if already paid
  if (existingSelfAssessmentTax > 0) {
    throw new Error("Self-assessment tax already paid for this ITR return");
  }

  // Validate payment amount matches balance
  if (amountNum !== balancePayable) {
    throw new Error(
      `Payment amount (${amountNum}) does not match balance payable (${balancePayable}). ` +
      `Tax payable: ${taxPayable}, Advance tax: ${advanceTaxPaid}, TDS/TCS: ${tdsTcsCredit}`
    );
  }

  // Insert record into self_assessment_ledger
  const paymentId = crypto.randomUUID();
  const paidAt = new Date();

  await db.insert(selfAssessmentLedger).values({
    id: paymentId,
    tenantId,
    assessmentYear,
    taxPayable: taxPayable.toString(),
    advanceTaxPaid: advanceTaxPaid.toString(),
    tdsTcsCredit: tdsTcsCredit.toString(),
    balancePayable: balancePayable.toString(),
    paidAmount: amount,
    challanNumber,
    challanDate,
    paidDate: challanDate,
    createdAt: paidAt,
  });

  // Update itr_returns table
  await db.update(itrReturns)
    .set({
      selfAssessmentTax: amount,
      totalTaxPaid: (advanceTaxPaid + tdsTcsCredit + amountNum).toString(),
      balancePayable: "0",
      updatedAt: paidAt,
    })
    .where(eq(itrReturns.id, itrReturnId));

  // Append event for audit trail
  await appendEvent(
    db,
    tenantId,
    "itr_return",
    itrReturnId,
    "self_assessment_tax_paid",
    {
      aggregateId: itrReturnId,
      paymentId,
      tenantId,
      assessmentYear,
      itrReturnId,
      amount: amountNum,
      challanNumber,
      challanDate,
      balanceAfterPayment: 0,
      paidAt,
    },
    actorId,
  );

  return {
    paymentId,
    amount,
    balanceAfterPayment: "0",
    paidDate: challanDate,
  };
}
