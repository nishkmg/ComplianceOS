// @ts-nocheck
import type { Projector } from "./types";
import { eq, and, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { statutoryLiabilities, payrollRuns } = _db;

export const statutoryLiabilitiesProjector: Projector = {
  name: "statutory_liabilities",
  handles: ["payroll_finalized", "payroll_voided"],
  async process(db, event) {
    const payload = event.payload as any;
    const payrollRunId = payload.payrollRunId;

    const [payrollRun] = await db.select()
      .from(payrollRuns)
      .where(eq(payrollRuns.id, payrollRunId));

    if (!payrollRun) return;

    const month = payrollRun.month;
    const year = payrollRun.year;
    const fiscalYear = payrollRun.fiscalYear;

    const payableByDate = new Date(parseInt(year), parseInt(month), 15);
    payableByDate.setMonth(payableByDate.getMonth() + 1);

    if (event.eventType === "payroll_finalized") {
      const pfEe = parseFloat(payrollRun.pfEe ?? "0");
      const pfEr = parseFloat(payrollRun.pfEr ?? "0");
      const esiEe = parseFloat(payrollRun.esiEe ?? "0");
      const esiEr = parseFloat(payrollRun.esiEr ?? "0");
      const tds = parseFloat(payrollRun.tdsDeducted ?? "0");
      const pt = parseFloat(payrollRun.professionalTax ?? "0");

      await db.insert(statutoryLiabilities).values({
        tenantId: event.tenantId,
        month,
        year,
        fiscalYear,
        pfEeTotal: String(pfEe),
        pfErTotal: String(pfEr),
        epsTotal: "0",
        esiEeTotal: String(esiEe),
        esiErTotal: String(esiEr),
        tdsTotal: String(tds),
        professionalTaxTotal: String(pt),
        payableByDate: payableByDate.toISOString().split("T")[0],
        paid: false,
      }).onConflictDoUpdate({
        target: [
          statutoryLiabilities.tenantId,
          statutoryLiabilities.month,
          statutoryLiabilities.year,
        ],
        set: {
          pfEeTotal: sql`${statutoryLiabilities.pfEeTotal} + ${pfEe}`,
          pfErTotal: sql`${statutoryLiabilities.pfErTotal} + ${pfEr}`,
          esiEeTotal: sql`${statutoryLiabilities.esiEeTotal} + ${esiEe}`,
          esiErTotal: sql`${statutoryLiabilities.esiErTotal} + ${esiEr}`,
          tdsTotal: sql`${statutoryLiabilities.tdsTotal} + ${tds}`,
          professionalTaxTotal: sql`${statutoryLiabilities.professionalTaxTotal} + ${pt}`,
        },
      });
    }
  },
};
