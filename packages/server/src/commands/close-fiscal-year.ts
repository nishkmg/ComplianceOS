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
  if (fy[0].status === "closed") throw new Error("Fiscal year is already closed");

  // Check for draft entries
  const draftCount = await db.select().from(journalEntries).where(
    and(
      eq(journalEntries.tenantId, tenantId),
      eq(journalEntries.fiscalYear, fy[0].year),
      eq(journalEntries.status, "draft"),
    ),
  ).then(rows => rows.length);

  if (draftCount > 0) {
    throw new Error(`Cannot close FY with ${draftCount} draft entries. Please post or delete them first.`);
  }

  await db.transaction(async (tx) => {
    await tx.update(fiscalYears)
      .set({ 
        status: "closed", 
        closedBy: actorId,
        closedAt: new Date(),
      })
      .where(eq(fiscalYears.id, fyId));

    await appendEvent(tx, tenantId, "fiscal_year", fyId, "fiscal_year_closed", {
      fyId,
      year: fy[0].year,
      closedAt: new Date().toISOString(),
    }, actorId);
  });
}
