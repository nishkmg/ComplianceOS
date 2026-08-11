import type { Projector } from "./types";
import { eq, and } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { statutoryLiabilities, payrollRuns } = _db;

/**
 * Recompute a month's statutory totals SET-based from all FINALIZED runs.
 * Replay-idempotent (no accumulate) and void-correct: a voided run is
 * excluded by its status, so payroll_voided events naturally drop the
 * liabilities — the old accumulate-on-upsert doubled on replay and never
 * subtracted on void.
 */
async function recomputeMonth(
  db: Parameters<Projector["process"]>[0],
  tenantId: string,
  month: string,
  year: string,
  fiscalYear: string,
  payableByDate: string,
): Promise<void> {
  const runs = await db
    .select()
    .from(payrollRuns)
    .where(
      and(
        eq(payrollRuns.tenantId, tenantId),
        eq(payrollRuns.month, month),
        eq(payrollRuns.year, year),
        eq(payrollRuns.status, "finalized"),
      ),
    );

  const sums = runs.reduce(
    (acc, r) => {
      acc.pfEe += parseFloat(r.pfEe ?? "0");
      acc.pfEr += parseFloat(r.pfEr ?? "0");
      acc.eps += parseFloat(r.eps ?? "0");
      acc.esiEe += parseFloat(r.esiEe ?? "0");
      acc.esiEr += parseFloat(r.esiEr ?? "0");
      acc.tds += parseFloat(r.tdsDeducted ?? "0");
      acc.pt += parseFloat(r.professionalTax ?? "0");
      return acc;
    },
    { pfEe: 0, pfEr: 0, eps: 0, esiEe: 0, esiEr: 0, tds: 0, pt: 0 },
  );

  await db.insert(statutoryLiabilities).values({
    tenantId,
    month,
    year,
    fiscalYear,
    pfEeTotal: String(sums.pfEe),
    pfErTotal: String(sums.pfEr),
    epsTotal: String(sums.eps),
    esiEeTotal: String(sums.esiEe),
    esiErTotal: String(sums.esiEr),
    tdsTotal: String(sums.tds),
    professionalTaxTotal: String(sums.pt),
    payableByDate,
    paid: false,
  }).onConflictDoUpdate({
    target: [
      statutoryLiabilities.tenantId,
      statutoryLiabilities.month,
      statutoryLiabilities.year,
    ],
    set: {
      pfEeTotal: String(sums.pfEe),
      pfErTotal: String(sums.pfEr),
      epsTotal: String(sums.eps),
      esiEeTotal: String(sums.esiEe),
      esiErTotal: String(sums.esiEr),
      tdsTotal: String(sums.tds),
      professionalTaxTotal: String(sums.pt),
      payableByDate,
    },
  });
}

export const statutoryLiabilitiesProjector: Projector = {
  name: "statutory_liabilities",
  handles: ["payroll_finalized", "payroll_voided"],
  async process(db, event) {
    const payload = event.payload as any;
    const payrollRunId = payload.payrollRunId;

    const [payrollRun] = await db
      .select()
      .from(payrollRuns)
      .where(eq(payrollRuns.id, payrollRunId));

    if (!payrollRun) return;

    const month = payrollRun.month;
    const year = payrollRun.year;
    const fiscalYear = payrollRun.fiscalYear;

    const payableByDate = new Date(parseInt(year), parseInt(month), 15);
    payableByDate.setMonth(payableByDate.getMonth() + 1);

    await recomputeMonth(
      db,
      event.tenantId,
      month,
      year,
      fiscalYear,
      payableByDate.toISOString().split("T")[0],
    );
  },
};
