// @ts-nocheck
import type { Projector } from "./types.js";
import { eq, and, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { itrAnnualIncomeProjection } = _db;

export const itrAnnualIncomeProjector: Projector = {
  name: "itr_annual_income",
  handles: ["income_computed"],
  async process(db, event) {
    const payload = event.payload as any;
    const tenantId = event.tenantId;

    if (event.eventType === "income_computed") {
      const incomeData = payload.incomeByHead;
      if (!incomeData) return;

      const financialYear = payload.financialYear;
      const grossTotalIncome = payload.grossTotalIncome || 0;
      const deductions = payload.deductions;
      const totalDeductions = deductions?.totalDeductions || 0;
      const totalIncome = payload.totalIncome || 0;

      await db.insert(itrAnnualIncomeProjection).values({
        tenantId,
        financialYear,
        salaryIncome: String(incomeData.salary || 0),
        housePropertyIncome: String(incomeData.houseProperty || 0),
        businessIncome: String(incomeData.businessProfit || 0),
        capitalGains: String(incomeData.capitalGains || 0),
        otherSources: String(incomeData.otherSources || 0),
        grossTotalIncome: String(grossTotalIncome),
        totalDeductions: String(totalDeductions),
        totalIncome: String(totalIncome),
        lastComputedAt: new Date(payload.computedAt || new Date()),
        eventSequenceId: event.sequence,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: [
          itrAnnualIncomeProjection.tenantId,
          itrAnnualIncomeProjection.financialYear,
        ],
        set: {
          salaryIncome: sql`EXCLUDED.salary_income`,
          housePropertyIncome: sql`EXCLUDED.house_property_income`,
          businessIncome: sql`EXCLUDED.business_income`,
          capitalGains: sql`EXCLUDED.capital_gains`,
          otherSources: sql`EXCLUDED.other_sources`,
          grossTotalIncome: sql`EXCLUDED.gross_total_income`,
          totalDeductions: sql`EXCLUDED.total_deductions`,
          totalIncome: sql`EXCLUDED.total_income`,
          lastComputedAt: sql`EXCLUDED.last_computed_at`,
          eventSequenceId: sql`EXCLUDED.event_sequence_id`,
          updatedAt: new Date(),
        },
      });
    }
  },
};
