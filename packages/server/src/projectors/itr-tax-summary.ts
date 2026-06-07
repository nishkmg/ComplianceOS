import type { Projector } from "./types.js";
import { eq, and, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { itrTaxSummaryProjection, itrReturns, itrAnnualIncomeProjection } = _db;

export const itrTaxSummaryProjector: Projector = {
  name: "itr_tax_summary",
  handles: ["tax_computed", "self_assessment_tax_paid", "income_computed"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "tax_computed") {
      const itrReturnId = payload.itrReturnId;
      if (!itrReturnId) return;

      const [itr] = await db.select()
        .from(itrReturns)
        .where(eq(itrReturns.id, itrReturnId))
        .limit(1);
      if (!itr) return;

      const financialYear = itr.financialYear;
      const assessmentYear = itr.assessmentYear;
      if (!financialYear || !assessmentYear) return;

      const [income] = await db.select()
        .from(itrAnnualIncomeProjection)
        .where(
          and(
            eq(itrAnnualIncomeProjection.tenantId, tenantId),
            eq(itrAnnualIncomeProjection.financialYear, financialYear),
          ),
        )
        .limit(1);

      const taxOnTotalIncome = Number(payload.taxOnTotalIncome || 0);
      const rebate87a = Number(payload.rebate87A || 0);
      const surcharge = Number(payload.surcharge || 0);
      const cess = Number(payload.cess || 0);
      const totalTaxPayable = Number(payload.totalTaxPayable || 0);
      const tdsTcsCredit = Number(payload.tdsTcsCredit || 0);
      const advanceTaxPaid = Number(payload.advanceTaxPaid || 0);
      const balancePayable = Number(payload.balancePayable || 0);

      await db.insert(itrTaxSummaryProjection).values({
        tenantId,
        itrReturnId,
        assessmentYear,
        financialYear,
        taxRegime: payload.taxRegime,
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
        salaryIncome: income?.salaryIncome ?? "0",
        housePropertyIncome: income?.housePropertyIncome ?? "0",
        businessIncome: income?.businessIncome ?? "0",
        capitalGainsIncome: income?.capitalGains ?? "0",
        otherSourcesIncome: income?.otherSources ?? "0",
        totalDeductions: income?.totalDeductions ?? "0",
        taxableIncome: income?.totalIncome ?? "0",
        lastComputedAt: new Date(payload.computedAt || new Date()),
        eventSequenceId: event.sequence,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: [
          itrTaxSummaryProjection.tenantId,
          itrTaxSummaryProjection.assessmentYear,
        ],
        set: {
          itrReturnId,
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
          salaryIncome: sql`EXCLUDED.salary_income`,
          housePropertyIncome: sql`EXCLUDED.house_property_income`,
          businessIncome: sql`EXCLUDED.business_income`,
          capitalGainsIncome: sql`EXCLUDED.capital_gains_income`,
          otherSourcesIncome: sql`EXCLUDED.other_sources_income`,
          totalDeductions: sql`EXCLUDED.total_deductions`,
          taxableIncome: sql`EXCLUDED.taxable_income`,
          lastComputedAt: sql`EXCLUDED.last_computed_at`,
          eventSequenceId: sql`EXCLUDED.event_sequence_id`,
          updatedAt: new Date(),
        },
      });
    } else if (event.eventType === "self_assessment_tax_paid") {
      const assessmentYear = payload.assessmentYear;
      if (!assessmentYear) return;

      const selfAssessmentTax = parseFloat(payload.amount || "0");

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
    } else if (event.eventType === "income_computed") {
      const financialYear = payload.financialYear;
      if (!financialYear) return;

      const incomeData = payload.incomeByHead || {};
      const totalDeductions = payload.deductions?.totalDeductions ?? 0;
      const taxableIncome = payload.totalIncome ?? 0;

      const [existing] = await db.select()
        .from(itrTaxSummaryProjection)
        .where(
          and(
            eq(itrTaxSummaryProjection.tenantId, tenantId),
            eq(itrTaxSummaryProjection.financialYear, financialYear),
          ),
        )
        .limit(1);

      if (existing) {
        await db.update(itrTaxSummaryProjection)
          .set({
            salaryIncome: String(incomeData.salary || 0),
            housePropertyIncome: String(incomeData.houseProperty || 0),
            businessIncome: String(incomeData.businessProfit || 0),
            capitalGainsIncome: String(incomeData.capitalGains || 0),
            otherSourcesIncome: String(incomeData.otherSources || 0),
            totalDeductions: String(totalDeductions),
            taxableIncome: String(taxableIncome),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(itrTaxSummaryProjection.tenantId, tenantId),
              eq(itrTaxSummaryProjection.financialYear, financialYear),
            ),
          );
      }
    }
  },
};
