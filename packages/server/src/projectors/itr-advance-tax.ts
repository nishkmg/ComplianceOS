import type { Projector } from "./types.js";
import { eq, and, sql } from "drizzle-orm";
import { itrAdvanceTaxProjection } from "@complianceos/db";

export const itrAdvanceTaxProjector: Projector = {
  name: "itr_advance_tax",
  handles: ["advance_tax_paid"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "advance_tax_paid") {
      const assessmentYear = payload.assessmentYear;
      if (!assessmentYear) return;

      const installmentNumber = payload.installmentNumber;
      const amount = parseFloat(payload.amount || "0");
      const interest234b = parseFloat(payload.interest234b || "0");
      const interest234c = parseFloat(payload.interest234c || "0");

      // Fetch existing projection to update cumulative values
      const [existing] = await db.select()
        .from(itrAdvanceTaxProjection)
        .where(
          and(
            eq(itrAdvanceTaxProjection.tenantId, tenantId),
            eq(itrAdvanceTaxProjection.assessmentYear, assessmentYear)
          )
        )
        .limit(1);

      if (existing) {
        // Update specific installment and recalculate totals
        const installmentField = getInstallmentField(installmentNumber);
        const currentInstallmentPaid = parseFloat(String(existing[installmentField]) || "0");
        const newInstallmentTotal = currentInstallmentPaid + amount;
        
        const newTotalAdvanceTax = 
          parseFloat(String(existing.installment1Paid) || "0") +
          parseFloat(String(existing.installment2Paid) || "0") +
          parseFloat(String(existing.installment3Paid) || "0") +
          parseFloat(String(existing.installment4Paid) || "0");
        
        const newInterest234b = (parseFloat(String(existing.interest234b) || "0") || 0) + interest234b;
        const newInterest234c = (parseFloat(String(existing.interest234c) || "0") || 0) + interest234c;

        const updateData: Record<string, any> = {
          [installmentField]: String(newInstallmentTotal),
          totalAdvanceTaxPaid: String(newTotalAdvanceTax + amount),
          interest234b: String(newInterest234b),
          interest234c: String(newInterest234c),
          lastUpdatedAt: new Date(payload.paidDate || new Date()),
          eventSequenceId: event.sequence,
          updatedAt: new Date(),
        };

        await db.update(itrAdvanceTaxProjection)
          .set(updateData)
          .where(
            and(
              eq(itrAdvanceTaxProjection.tenantId, tenantId),
              eq(itrAdvanceTaxProjection.assessmentYear, assessmentYear)
            )
          );
      } else {
        // First payment for this assessment year
        const installmentField = getInstallmentField(installmentNumber);
        
        await db.insert(itrAdvanceTaxProjection).values({
          tenantId,
          assessmentYear,
          installment1Paid: installmentField === "installment1Paid" ? String(amount) : "0",
          installment2Paid: installmentField === "installment2Paid" ? String(amount) : "0",
          installment3Paid: installmentField === "installment3Paid" ? String(amount) : "0",
          installment4Paid: installmentField === "installment4Paid" ? String(amount) : "0",
          totalAdvanceTaxPaid: String(amount),
          interest234b: String(interest234b),
          interest234c: String(interest234c),
          lastUpdatedAt: new Date(payload.paidDate || new Date()),
          eventSequenceId: event.sequence,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: [
            itrAdvanceTaxProjection.tenantId,
            itrAdvanceTaxProjection.assessmentYear,
          ],
          set: {
            [installmentField]: sql`CAST(${itrAdvanceTaxProjection[installmentField]} AS NUMERIC) + ${amount}`,
            totalAdvanceTaxPaid: sql`CAST(${itrAdvanceTaxProjection.totalAdvanceTaxPaid} AS NUMERIC) + ${amount}`,
            interest234b: sql`CAST(${itrAdvanceTaxProjection.interest234b} AS NUMERIC) + ${interest234b}`,
            interest234c: sql`CAST(${itrAdvanceTaxProjection.interest234c} AS NUMERIC) + ${interest234c}`,
            lastUpdatedAt: new Date(payload.paidDate || new Date()),
            eventSequenceId: sql`EXCLUDED.event_sequence_id`,
            updatedAt: new Date(),
          },
        });
      }
    }
  },
};

function getInstallmentField(installmentNumber: number | string): "installment1Paid" | "installment2Paid" | "installment3Paid" | "installment4Paid" {
  const num = typeof installmentNumber === "string" ? parseInt(installmentNumber, 10) : installmentNumber;
  switch (num) {
    case 1:
      return "installment1Paid";
    case 2:
      return "installment2Paid";
    case 3:
      return "installment3Paid";
    case 4:
      return "installment4Paid";
    default:
      throw new Error(`Invalid installment number: ${installmentNumber}`);
  }
}
