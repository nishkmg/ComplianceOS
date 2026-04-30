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
  await db.transaction(async (tx) => {
    const fy = await tx.select().from(fiscalYears).where(
      and(eq(fiscalYears.id, fyId), eq(fiscalYears.tenantId, tenantId)),
    ).for("update");

    if (fy.length === 0) throw new Error("Fiscal year not found");
    if (fy[0].status === "closed") throw new Error("Fiscal year is already closed");

    const draftCount = await tx.select().from(journalEntries).where(
      and(
        eq(journalEntries.tenantId, tenantId),
        eq(journalEntries.fiscalYear, fy[0].year),
        eq(journalEntries.status, "draft"),
      ),
    ).then(rows => rows.length);

    if (draftCount > 0) {
      // Transition to pending_close — drafts remain, no new entries allowed
      const updated = await tx.update(fiscalYears)
        .set({ 
          status: "pending_close", 
          closedBy: actorId,
          closedAt: new Date(),
        })
        .where(
          and(
            eq(fiscalYears.id, fyId),
            eq(fiscalYears.tenantId, tenantId),
            eq(fiscalYears.status, "open"),
          ),
        )
        .returning();

      if (updated.length === 0) {
        throw new Error("Concurrent modification: fiscal year status changed");
      }

      await appendEvent(tx, tenantId, "fiscal_year", fyId, "fiscal_year_closed", {
        fyId,
        year: fy[0].year,
        closedAt: new Date().toISOString(),
        pendingDrafts: draftCount,
      }, actorId);
      return;
    }

    const updated = await tx.update(fiscalYears)
      .set({ 
        status: "closed", 
        closedBy: actorId,
        closedAt: new Date(),
      })
      .where(
        and(
          eq(fiscalYears.id, fyId),
          eq(fiscalYears.tenantId, tenantId),
          eq(fiscalYears.status, "open"),
        ),
      )
      .returning();

    if (updated.length === 0) {
      throw new Error("Concurrent modification: fiscal year status changed");
    }

    await appendEvent(tx, tenantId, "fiscal_year", fyId, "fiscal_year_closed", {
      fyId,
      year: fy[0].year,
      closedAt: new Date().toISOString(),
    }, actorId);
  });
}
