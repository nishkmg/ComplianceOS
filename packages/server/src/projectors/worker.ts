import { createServer } from "http";
import { db, projectorState, eventStore } from "@complianceos/db";
import { eq, and, gt, asc, desc } from "drizzle-orm";
import { accountBalanceProjector } from "./account-balance.js";
import { journalEntryViewProjector } from "./journal-entry-view.js";
import { snapshotProjector } from "./snapshot.js";
import { fySummaryProjector } from "./fy-summary.js";
import { InvoiceViewProjector } from "./invoice-view.js";
import { ReceivablesProjector } from "./receivables-summary.js";
import { payrollSummaryProjector } from "./payroll-summary.js";
import { statutoryLiabilitiesProjector } from "./statutory-liabilities.js";
import { gstLiabilityProjector } from "./gst-liability.js";
import { gstItcAvailableProjector } from "./gst-itc-available.js";
import { gstCashBalanceProjector } from "./gst-cash-balance.js";
import { itrAnnualIncomeProjector } from "./itr-annual-income.js";
import { itrTaxSummaryProjector } from "./itr-tax-summary.js";
import { itrAdvanceTaxProjector } from "./itr-advance-tax.js";
import type { Projector } from "./types.js";

const projectors: Projector[] = [
  accountBalanceProjector,
  journalEntryViewProjector,
  snapshotProjector,
  fySummaryProjector,
  InvoiceViewProjector,
  ReceivablesProjector,
  payrollSummaryProjector,
  statutoryLiabilitiesProjector,
  gstLiabilityProjector,
  gstItcAvailableProjector,
  gstCashBalanceProjector,
  itrAnnualIncomeProjector,
  itrTaxSummaryProjector,
  itrAdvanceTaxProjector,
];

const POLL_INTERVAL_MS = 500;
const BATCH_SIZE = 50;

async function processProjector(projector: Projector, tenantId: string): Promise<void> {
  const stateRow = await db
    .select()
    .from(projectorState)
    .where(
      and(
        eq(projectorState.tenantId, tenantId),
        eq(projectorState.projectorName, projector.name),
      ),
    )
    .limit(1);

  // lastProcessedSequence stored as text in DB
  const lastSeq = BigInt(stateRow[0]?.lastProcessedSequence ?? "0");

  const events = await db
    .select()
    .from(eventStore)
    .where(gt(eventStore.sequence, lastSeq))
    .orderBy(asc(eventStore.sequence))
    .limit(BATCH_SIZE);

  if (events.length === 0) return;

  await db.transaction(async (tx) => {
    // Cast tx to any to satisfy Projector.process(db: Database) signature —
    // PgTransaction implements the same query surface as PostgresJsDatabase
    const txDb = tx as any;

    for (const event of events) {
      if (!projector.handles.includes(event.eventType)) continue;

      try {
        await projector.process(txDb, event);
      } catch (err) {
        console.error(`[${projector.name}] Error processing event ${event.id}:`, err);
      }
    }

    // Update last processed sequence to the highest sequence in this batch
    const lastEvent = events[events.length - 1]!;
    await tx
      .update(projectorState)
      .set({
        lastProcessedSequence: String(lastEvent.sequence),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectorState.tenantId, tenantId),
          eq(projectorState.projectorName, projector.name),
        ),
      );
  });
}

async function main(): Promise<void> {
  console.log(`[Projector Worker] Starting with ${projectors.length} projectors`);

  while (true) {
    try {
      for (const projector of projectors) {
        const tenantRows = await db
          .select({ tenantId: projectorState.tenantId })
          .from(projectorState)
          .where(eq(projectorState.projectorName, projector.name));

        const uniqueTenants = [...new Set(tenantRows.map((t) => t.tenantId))];

        for (const tenantId of uniqueTenants) {
          await processProjector(projector, tenantId);
        }
      }
    } catch (err) {
      console.error("[Projector Worker] Error in main loop:", err);
    }

    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

const healthServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", projectors: projectors.map((p) => p.name) }));
});

const PORT = parseInt(process.env.PROJECTOR_PORT ?? "3100", 10);
healthServer.listen(PORT, () => {
  console.log(`[Projector Worker] Health check on port ${PORT}`);
});

main().catch(console.error);
