import { supabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

async function checkDatabase(): Promise<{ status: string; latencyMs?: number; error?: string }> {
  try {
    const start = Date.now();
    const res = await supabaseRest("users?select=id&limit=1", { method: "GET" });
    if (res.ok) {
      return { status: "connected", latencyMs: Date.now() - start };
    }
    return { status: "error", error: `Supabase returned ${res.status}` };
  } catch (err: any) {
    return { status: "error", error: err.message };
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
  } catch (err: any) {
    return { status: "error", error: err.message };
  }
}

async function checkProjector(): Promise<{ status: string; url?: string; error?: string; projectors?: string[] }> {
  const projectorUrl = process.env.PROJECTOR_URL || "http://localhost:3100";
  try {
    const res = await fetch(`${projectorUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return { status: "healthy", url: projectorUrl, projectors: data.projectors };
    }
    return { status: "unhealthy", url: projectorUrl };
  } catch (err: any) {
    return { status: "error", url: projectorUrl, error: err.message };
  }
}

export async function GET() {
  try {
    const [db, redis, projector] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkProjector(),
    ]);

    const overall = db.status === "connected" && redis.status !== "error" && projector.status !== "error" ? "healthy" : "degraded";

    return Response.json({
      status: overall,
      version: process.env.npm_package_version || "0.0.1",
      timestamp: new Date().toISOString(),
      checks: { database: db, redis, projector },
    }, {
      status: overall === "healthy" ? 200 : overall === "degraded" ? 200 : 503,
    });
  } catch (err: any) {
    return Response.json({
      status: "error",
      error: err.message,
    }, { status: 500 });
  }
}
