// @ts-nocheck
import { eq, and, count } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { fiscalYears } = _db;
import { appendEvent } from "../lib/event-store";

export async function createFiscalYear(
  db: Database,
  tenantId: string,
  actorId: string,
  year: string,
  startDate: string,
  endDate: string,
): Promise<{ fyId: string }> {
  const openFys = await db.select({ count: count() }).from(fiscalYears).where(
    and(eq(fiscalYears.tenantId, tenantId), eq(fiscalYears.status, "open")),
  );

  if (openFys[0].count >= 2) {
    throw new Error("Maximum 2 concurrent open fiscal years allowed");
  }

  const result = await db.transaction(async (tx) => {
    const fy = await tx.insert(fiscalYears).values({
      tenantId,
      year,
      startDate,
      endDate,
      status: "open",
    }).returning({ id: fiscalYears.id });

    await appendEvent(tx, tenantId, "fiscal_year", fy[0].id, "fiscal_year_created", {
      fyId: fy[0].id,
      year,
      startDate,
      endDate,
    }, actorId);

    return { fyId: fy[0].id };
  });

  return result;
}
