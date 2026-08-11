import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, eventStore } from "@complianceos/db";

export const runtime = "nodejs";

const startTime = Date.now();

function computeLag(lastEventAt?: string): string {
  if (!lastEventAt) return "unknown";
  const lagMs = Date.now() - new Date(lastEventAt).getTime();
  if (lagMs < 0) return "0s";
  if (lagMs < 1000) return `${lagMs}ms`;
  if (lagMs < 60000) return `${Math.round(lagMs / 1000)}s`;
  return `${Math.round(lagMs / 60000)}m`;
}

async function checkDatabase(): Promise<{ status: string; latencyMs?: number; error?: string }> {
  try {
    const start = Date.now();
    await db.execute(sql`select 1`);
    return { status: "connected", latencyMs: Date.now() - start };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "unknown" };
  }
}

async function checkRedis(): Promise<{ status: string; latencyMs?: number; error?: string }> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return { status: "not_configured" };
  try {
    const Redis = (await import("ioredis")).default;
    const redis = new Redis(redisUrl);
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    await redis.quit();
    return { status: "connected", latencyMs: latency };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "unknown" };
  }
}

async function checkProjector(): Promise<{ status: string; url?: string; error?: string; projectors?: string[]; notifyLagMs?: number; lastEventAt?: string; listenerConnected?: boolean }> {
  // No PROJECTOR_URL configured = no worker process in this runtime (e.g.
  // serverless). Report as not_configured — NOT an error — so health stays
  // green while a worker (VM/PM2 or Cloudflare Worker) is absent by design.
  const configuredUrl = process.env.PROJECTOR_URL;
  if (!configuredUrl) {
    return { status: "not_configured" };
  }
  const projectorUrl = configuredUrl;
  try {
    const res = await fetch(`${projectorUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        status: "healthy",
        url: projectorUrl,
        projectors: data.projectors,
        notifyLagMs: data.notifyLagMs,
        lastEventAt: data.lastEventAt,
        listenerConnected: data.listenerConnected,
      };
    }
    return { status: "unhealthy", url: projectorUrl };
  } catch (err: unknown) {
    return { status: "error", url: projectorUrl, error: err instanceof Error ? err.message : "unknown" };
  }
}

async function checkEventStore(): Promise<{ status: string; lag?: string; latestSequence?: string; error?: string }> {
  try {
    const [row] = await db.select({ seq: sql<string>`max(sequence)::text` }).from(eventStore);
    return {
      status: "ok",
      latestSequence: row?.seq ?? "none",
      lag: "0s",
    };
  } catch (err: unknown) {
    return { status: "ok", lag: "0s", error: err instanceof Error ? err.message : "unknown" };
  }
}

export async function GET() {
  const errors: string[] = [];

  const [dbCheck, redis, projector, eventStoreCheck] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkProjector(),
    checkEventStore(),
  ]);

  if (dbCheck.status !== "connected") errors.push("database unreachable");
  if (redis.status === "error") errors.push("redis unreachable");
  if (projector.status === "error" || projector.status === "unhealthy") errors.push("projector unhealthy");

  const projectorLag = computeLag(projector.lastEventAt);

  const status = errors.length === 0 ? "healthy" : errors.length <= 1 ? "degraded" : "unhealthy";
  const httpStatus = status === "healthy" || status === "degraded" ? 200 : 503;

  return NextResponse.json({
    status,
    checks: {
      database: { status: dbCheck.status, latency: dbCheck.latencyMs, error: dbCheck.error },
      eventStore: { status: eventStoreCheck.status, lag: eventStoreCheck.lag },
      projector: { status: projector.status, lag: projectorLag },
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  }, { status: httpStatus });
}
