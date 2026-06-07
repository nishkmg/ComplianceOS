import { createServer } from "http";
// @ts-ignore — env validator lives in shared; .ts extension resolved at runtime by tsx
import { validateEnv } from "@complianceos/shared/lib/env";

try {
  validateEnv();
} catch (err) {
  // @ts-ignore
  console.error("[Projector Worker] Env validation failed:", (err).message);
  process.exit(1);
}

import * as _db from "../../../db/src/index";
const { db, projectorState, eventStore, tenants } = _db;
import { eq, and, sql } from "drizzle-orm";
import postgres from "postgres";
import { logger } from "../lib/logger";
import { accountBalanceProjector } from "./account-balance.js";
import { inventoryValuationProjector } from "./inventory-valuation.js";
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
  inventoryValuationProjector,
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

const BATCH_SIZE = 50;
const SAFETY_POLL_MS = 5_000;
const RECONNECT_BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];

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

  const eventRows = ((events as { rows?: Record<string, unknown>[] }).rows ?? (events as unknown as Record<string, unknown>[])) as Array<{
    id: string;
    tenant_id: string;
    aggregate_type: string;
    aggregate_id: string;
    event_type: string;
    payload: unknown;
    sequence: string | number | bigint;
    actor_id: string;
    created_at: string | Date;
  }>;
  if (!eventRows || eventRows.length === 0) return;

  let processingError = null;
  let lastProcessedEventId: string | null = null;

  await db.transaction(async (tx) => {
    const txDb = tx as any;

    for (const eventRow of eventRows) {
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
        logger.error(`[${projector.name}] Error processing event`, err as Error, {
          projector: projector.name,
          eventId: event.id,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
        });
        processingError = err;
        break;
      }
    }

    if (lastProcessedEventId && !processingError) {
      const lastEvent = eventRows.find(r => r.id === lastProcessedEventId);
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
    logger.error(`[${projector.name}] Stopping at event due to error`, new Error("Projector processing error"), {
      projector: projector.name,
      eventId: lastProcessedEventId,
    });
  }
}

let lastProcessedAt = Date.now();
let lastEventAt: string | null = null;
let notifyLagMs = 0;
let pendingNotifyReceivedAt: number | null = null;
let listenerConnected = false;

function updateLastProcessed() {
  lastProcessedAt = Date.now();
  if (pendingNotifyReceivedAt !== null) {
    notifyLagMs = Date.now() - pendingNotifyReceivedAt;
    pendingNotifyReceivedAt = null;
  }
}

async function processAll(): Promise<void> {
  const allTenants = await db.select({ id: tenants.id }).from(tenants);

  for (const projector of projectors) {
    for (const tenant of allTenants) {
      try {
        await processProjector(projector, tenant.id);
      } catch (err) {
        logger.error("[Projector Worker] Projector cycle error", err as Error, {
          projector: projector.name,
          tenantId: tenant.id,
        });
      }
    }
  }

  updateLastProcessed();
}

let kickRequested = false;
let processingPromise: Promise<void> | null = null;

function kick(receivedAt?: number) {
  if (receivedAt !== undefined) {
    pendingNotifyReceivedAt = receivedAt;
    lastEventAt = new Date(receivedAt).toISOString();
  }
  kickRequested = true;
  if (processingPromise) return;
  processingPromise = runLoop().finally(() => {
    processingPromise = null;
  });
}

async function runLoop(): Promise<void> {
  while (kickRequested) {
    kickRequested = false;
    try {
      await processAll();
    } catch (err) {
      logger.error("[Projector Worker] Error in main loop", err as Error);
    }
  }
}

type UnlistenHandle = { unlisten(): Promise<void> };
let listenClient: postgres.Sql | null = null;
let listenUnlisten: UnlistenHandle | null = null;
let reconnectAttempt = 0;
let reconnectTimer: NodeJS.Timeout | null = null;
let shuttingDown = false;

async function startListener(): Promise<void> {
  if (shuttingDown) return;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    logger.error("[Projector Worker] DATABASE_URL not set; listener disabled", new Error("Missing DATABASE_URL"));
    return;
  }

  const client = postgres(connectionString, { max: 1, idle_timeout: 0, connect_timeout: 10 });
  listenClient = client;

  const onNotify = (payload: string) => {
    if (!payload) return;
    const sepIdx = payload.indexOf(":");
    if (sepIdx < 0) return;
    const aggregateId = payload.slice(0, sepIdx);
    const sequenceStr = payload.slice(sepIdx + 1);
    if (!aggregateId || isNaN(parseInt(sequenceStr, 10))) return;
    kick(Date.now());
  };

  try {
    const meta = await client.listen("event_store_channel", onNotify);
    listenUnlisten = meta;
    listenerConnected = true;
    reconnectAttempt = 0;
    logger.info("[Projector Worker] LISTEN active on event_store_channel");
  } catch (err) {
    listenerConnected = false;
    logger.error("[Projector Worker] LISTEN failed", err as Error);
    await safeEndClient(client);
    listenClient = null;
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer) return;
  const delay = RECONNECT_BACKOFF_MS[Math.min(reconnectAttempt, RECONNECT_BACKOFF_MS.length - 1)];
  reconnectAttempt++;
  listenerConnected = false;
  logger.info(`[Projector Worker] Reconnecting listener in ${delay}ms (attempt ${reconnectAttempt})`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void teardownListener().then(() => startListener());
  }, delay);
}

async function safeEndClient(client: postgres.Sql): Promise<void> {
  try {
    await client.end({ timeout: 5 });
  } catch (err) {
    logger.warn("[Projector Worker] Error closing listener client", { error: (err as Error).message });
  }
}

async function teardownListener(): Promise<void> {
  if (listenUnlisten) {
    try {
      await listenUnlisten.unlisten();
    } catch (err) {
      logger.warn("[Projector Worker] Error unlistening", { error: (err as Error).message });
    }
    listenUnlisten = null;
  }
  if (listenClient) {
    await safeEndClient(listenClient);
    listenClient = null;
  }
  listenerConnected = false;
}

async function pingListener(): Promise<boolean> {
  if (!listenClient) return false;
  try {
    await listenClient`SELECT 1`;
    return true;
  } catch (err) {
    logger.warn("[Projector Worker] Listener ping failed", { error: (err as Error).message });
    return false;
  }
}

async function main(): Promise<void> {
  logger.info(`[Projector Worker] Starting`, { projectorCount: projectors.length });

  await startListener();

  setInterval(async () => {
    if (await pingListener()) {
      if (!listenerConnected) {
        listenerConnected = true;
        logger.info("[Projector Worker] Listener recovered (ping ok)");
      }
    } else if (listenerConnected) {
      listenerConnected = false;
      scheduleReconnect();
    }
    kick();
  }, SAFETY_POLL_MS);

  kick();
}

const healthServer = createServer((req, res) => {
  const timeSinceLastEvent = Date.now() - lastProcessedAt;
  const staleThreshold = 60_000;
  const isHealthy = timeSinceLastEvent < staleThreshold && listenerConnected;

  const healthData = {
    status: isHealthy ? "ok" : "stale",
    projectors: projectors.map((p) => p.name),
    lastProcessedMsAgo: timeSinceLastEvent,
    notifyLagMs,
    lastEventAt,
    listenerConnected,
    uptime: Math.floor((Date.now() - process.uptime() * 1000) / 1000),
  };

  if (req.url === "/health") {
    res.writeHead(isHealthy ? 200 : 503, { "Content-Type": "application/json" });
    res.end(JSON.stringify(healthData));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(healthData));
});

const PORT = parseInt(process.env.PROJECTOR_PORT ?? "3100", 10);
healthServer.listen(PORT, () => {
  logger.info(`[Projector Worker] Health check listening`, { port: PORT });
});

async function shutdown(signal: string) {
  shuttingDown = true;
  logger.info(`[Projector Worker] Received ${signal}, shutting down`);
  if (reconnectTimer) clearTimeout(reconnectTimer);
  await teardownListener();
  healthServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

main().catch((err) => logger.error("[Projector Worker] Fatal error", err as Error));
