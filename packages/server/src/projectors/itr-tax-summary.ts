// @ts-nocheck
import type { Projector } from "./types.js";
import { eq, and, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { itrTaxSummaryProjection } = _db;

export const itrTaxSummaryProjector: Projector = {
  name: "itr_tax_summary",
  handles: ["tax_computed", "self_assessment_tax_paid"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "tax_computed") {
      const taxRegime = payload.taxRegime;
      const taxOnTotalIncome = payload.taxOnTotalIncome || 0;
      const rebate87a = payload.rebate87A || 0;
      const surcharge = payload.surcharge || 0;
      const cess = payload.cess || 0;
      const totalTaxPayable = payload.totalTaxPayable || 0;
      const tdsTcsCredit = payload.tdsTcsCredit || 0;
      const advanceTaxPaid = payload.advanceTaxPaid || 0;
      const balancePayable = payload.balancePayable || 0;
      
      // Derive assessment year from financial year (AY = FY + 1)
      const financialYear = payload.itrReturnId ? null : null; // Will need to fetch from ITR return
      const assessmentYear = financialYear 
        ? deriveAssessmentYear(financialYear)
        : null;

      if (!assessmentYear || !financialYear) return;

      await db.insert(itrTaxSummaryProjection).values({
        tenantId,
        assessmentYear,
        financialYear,
        taxRegime,
        taxOnTotalIncome: String(taxOnTotalIncome),
        rebate87a: String(rebate87a),
        surcharge: String(surcharge),
        cess: String(cess),
        totalTaxPayable: String(totalTaxPayable),
        tdsTcsCredit: String(tdsTcsCredit),
        advanceTaxPaid: String(advanceTaxPaid),
        selfAssessmentTax: "0",
        balancePayable: String(balancePayable),
        refundDue: String(Math.max(0, advanceTaxPaid + tdsTcsCredit - totalTaxPayable)),
        lastComputedAt: new Date(payload.computedAt || new Date()),
        eventSequenceId: event.sequence,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: [
          itrTaxSummaryProjection.tenantId,
          itrTaxSummaryProjection.assessmentYear,
        ],
        set: {
          taxRegime: sql`EXCLUDED.tax_regime`,
          taxOnTotalIncome: sql`EXCLUDED.tax_on_total_income`,
          rebate87a: sql`EXCLUDED.rebate_87a`,
          surcharge: sql`EXCLUDED.surcharge`,
          cess: sql`EXCLUDED.cess`,
          totalTaxPayable: sql`EXCLUDED.total_tax_payable`,
          tdsTcsCredit: sql`EXCLUDED.tds_tcs_credit`,
          advanceTaxPaid: sql`EXCLUDED.advance_tax_paid`,
          balancePayable: sql`EXCLUDED.balance_payable`,
          refundDue: sql`EXCLUDED.refund_due`,
          lastComputedAt: sql`EXCLUDED.last_computed_at`,
          eventSequenceId: sql`EXCLUDED.event_sequence_id`,
          updatedAt: new Date(),
        },
      });
    } else if (event.eventType === "self_assessment_tax_paid") {
      const assessmentYear = payload.assessmentYear;
      if (!assessmentYear) return;

      const selfAssessmentTax = parseFloat(payload.amount || "0");
      
      // Fetch existing projection to update cumulative values
      const [existing] = await db.select()
        .from(itrTaxSummaryProjection)
        .where(
          and(
            eq(itrTaxSummaryProjection.tenantId, tenantId),
            eq(itrTaxSummaryProjection.assessmentYear, assessmentYear)
          )
        )
        .limit(1);

      if (existing) {
        const totalTaxPayable = parseFloat(existing.totalTaxPayable || "0");
        const advanceTaxPaid = parseFloat(existing.advanceTaxPaid || "0");
        const tdsTcsCredit = parseFloat(existing.tdsTcsCredit || "0");
        const newBalance = Math.max(0, totalTaxPayable - advanceTaxPaid - tdsTcsCredit - selfAssessmentTax);
        const refundDue = Math.max(0, advanceTaxPaid + tdsTcsCredit + selfAssessmentTax - totalTaxPayable);

        await db.update(itrTaxSummaryProjection)
          .set({
            selfAssessmentTax: String(selfAssessmentTax),
            balancePayable: String(newBalance),
            refundDue: String(refundDue),
            eventSequenceId: event.sequence,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(itrTaxSummaryProjection.tenantId, tenantId),
              eq(itrTaxSummaryProjection.assessmentYear, assessmentYear)
            )
          );
      }
    }
  },
};

function deriveAssessmentYear(financialYear: string): string {
  const [startYear] = financialYear.split("-");
  const startYearNum = parseInt(startYear, 10);
  return `${startYearNum}-${String(startYearNum + 1).slice(-2)}`;
}
