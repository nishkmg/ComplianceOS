// @ts-nocheck
import { createServer } from "http";
import * as _db from "../../../db/src/index";
const { db, projectorState, eventStore, tenants } = _db;
import { eq, and, gt, asc, desc, sql } from "drizzle-orm";
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

async function ensureProjectorState(projector: Projector, tenantId: string): Promise<void> {
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

  if (!stateRow.length) {
    await db.insert(projectorState).values({
      tenantId,
      projectorName: projector.name,
      lastProcessedSequence: "0",
      status: "active",
    });
  }
}

async function processProjector(projector: Projector, tenantId: string): Promise<void> {
  await ensureProjectorState(projector, tenantId);

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

  const lastSeq = BigInt(stateRow[0]?.lastProcessedSequence ?? "0");

  const events = await db.execute(
    sql`
      SELECT * FROM event_store
      WHERE tenant_id = ${tenantId}
        AND sequence > ${lastSeq}
      ORDER BY sequence ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    `
  );

  if (!events.rows || events.rows.length === 0) return;

  let processingError = null;
  let lastProcessedEventId = null;

  await db.transaction(async (tx) => {
    const txDb = tx as any;

    for (const eventRow of events.rows) {
      const event = {
        id: eventRow.id,
        tenantId: eventRow.tenant_id,
        aggregateType: eventRow.aggregate_type,
        aggregateId: eventRow.aggregate_id,
        eventType: eventRow.event_type,
        payload: eventRow.payload,
        sequence: BigInt(eventRow.sequence),
        actorId: eventRow.actor_id,
        createdAt: new Date(eventRow.created_at),
      };

      if (!projector.handles.includes(event.eventType)) {
        lastProcessedEventId = event.id;
        continue;
      }

      try {
        await projector.process(txDb, event);
        lastProcessedEventId = event.id;
      } catch (err) {
        console.error(`[${projector.name}] Error processing event ${event.id}:`, err);
        processingError = err;
        break;
      }
    }

    if (lastProcessedEventId && !processingError) {
      const lastEvent = events.rows.find(r => r.id === lastProcessedEventId);
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
    }
  });

  if (processingError) {
    console.error(`[${projector.name}] Stopping at event ${lastProcessedEventId} due to error`);
  }
}

async function main(): Promise<void> {
  console.log(`[Projector Worker] Starting with ${projectors.length} projectors`);

  while (true) {
    try {
      const allTenants = await db.select({ id: tenants.id }).from(tenants);

      for (const projector of projectors) {
        for (const tenant of allTenants) {
          await processProjector(projector, tenant.id);
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
