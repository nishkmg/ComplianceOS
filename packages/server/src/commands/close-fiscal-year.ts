// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { fiscalYears, journalEntries } = _db;
import { appendEvent } from "../lib/event-store";

export async function closeFiscalYear(
  db: Database,
  tenantId: string,
  fyId: string,
  actorId: string,
): Promise<void> {
  const fy = await db.select().from(fiscalYears).where(
    and(eq(fiscalYears.id, fyId), eq(fiscalYears.tenantId, tenantId)),
  );

  if (fy.length === 0) throw new Error("Fiscal year not found");
  if (fy[0].status !== "open") throw new Error("Fiscal year is already closed");

  const drafts = await db.select({ id: journalEntries.id }).from(journalEntries).where(
    and(
      eq(journalEntries.tenantId, tenantId),
      eq(journalEntries.fiscalYear, fy[0].year),
      eq(journalEntries.status, "draft"),
    ),
  ).limit(1);

  if (drafts.length > 0) {
    throw new Error("Cannot close fiscal year with draft entries");
  }

  await db.transaction(async (tx) => {
    await tx.update(fiscalYears)
      .set({ status: "closed", closedBy: actorId, closedAt: new Date() })
      .where(eq(fiscalYears.id, fyId));

    await appendEvent(tx, tenantId, "fiscal_year", fyId, "fiscal_year_closed", {
      fyId,
      year: fy[0].year,
      closedAt: new Date().toISOString(),
    }, actorId);
  });
}
