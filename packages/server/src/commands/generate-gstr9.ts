// packages/server/src/commands/generate-gstr9.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { gstReturns } = _db;
import { appendEvent } from "../lib/event-store";
import { generateGstr9Schedules } from "../services/gstr-table-mapper";
import { getCurrentFiscalYear } from "@complianceos/shared";

export async function generateGstr9(
  db: Database,
  tenantId: string,
  actorId: string,
  input: { periodMonth: number; periodYear: number },
): Promise<{ returnId: string; returnNumber: string }> {
  const periodMonth = String(input.periodMonth).padStart(2, "0");
  const fiscalYear = getCurrentFiscalYear(new Date(`${input.periodYear}-${periodMonth}-15`));

  // Idempotent: return the existing GSTR-9 for the period if present
  const [existing] = await db
    .select()
    .from(gstReturns)
    .where(
      and(
        eq(gstReturns.tenantId, tenantId),
        eq(gstReturns.returnType, "gstr9"),
        eq(gstReturns.taxPeriodYear, String(input.periodYear)),
        eq(gstReturns.taxPeriodMonth, periodMonth),
      ),
    )
    .limit(1);
  if (existing) {
    await generateGstr9Schedules(db, existing.id, tenantId);
    return { returnId: existing.id, returnNumber: existing.returnNumber };
  }

  const returnNumber = `GSTR9-${input.periodYear}-${periodMonth}`;
  const [created] = await db.insert(gstReturns).values({
    tenantId,
    returnNumber,
    returnType: "gstr9",
    taxPeriodMonth: periodMonth,
    taxPeriodYear: String(input.periodYear),
    fiscalYear,
    status: "generated",
    dueDate: new Date(input.periodYear, 11, 31).toISOString().split("T")[0],
    createdBy: actorId,
  }).returning({ id: gstReturns.id });

  await generateGstr9Schedules(db, created.id, tenantId);

  await appendEvent(db, tenantId, "gst_return", created.id, "gstr9_generated", {
    returnId: created.id,
    periodMonth: input.periodMonth,
    periodYear: input.periodYear,
    status: "generated",
    generatedAt: new Date().toISOString(),
  }, actorId);

  return { returnId: created.id, returnNumber };
}
