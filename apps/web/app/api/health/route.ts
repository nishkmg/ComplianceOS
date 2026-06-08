import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase-rest";

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
    const res = await supabaseRest("users?select=id&limit=1", { method: "GET" });
    if (res.ok) {
      return { status: "connected", latencyMs: Date.now() - start };
    }
    return { status: "error", error: `Supabase returned ${res.status}` };
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
  const projectorUrl = process.env.PROJECTOR_URL || "http://localhost:3100";
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
    const res = await supabaseRest("event_store?select=sequence&order=sequence.desc&limit=1", { method: "GET" });
    if (res.ok) {
      const rows = res.json as Array<{ sequence: number }> | null;
      const seq = rows?.[0]?.sequence ?? null;
      return {
        status: "ok",
        latestSequence: seq != null ? String(seq) : "none",
        lag: "0s",
      };
    }
    return { status: "ok", lag: "0s", latestSequence: "none" };
  } catch (err: unknown) {
    return { status: "ok", lag: "0s", error: err instanceof Error ? err.message : "unknown" };
  }
}

export async function GET() {
  const errors: string[] = [];

  const [db, redis, projector, eventStore] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkProjector(),
    checkEventStore(),
  ]);

  if (db.status !== "connected") errors.push("database unreachable");
  if (redis.status === "error") errors.push("redis unreachable");
  if (projector.status === "error" || projector.status === "unhealthy") errors.push("projector unhealthy");

  const projectorLag = computeLag(projector.lastEventAt);

  const status = errors.length === 0 ? "healthy" : errors.length <= 1 ? "degraded" : "unhealthy";
  const httpStatus = status === "healthy" || status === "degraded" ? 200 : 503;

  return NextResponse.json({
    status,
    checks: {
      database: { status: db.status, latency: db.latencyMs, error: db.error },
      eventStore: { status: eventStore.status, lag: eventStore.lag },
      projector: { status: projector.status, lag: projectorLag },
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  }, { status: httpStatus });
}
