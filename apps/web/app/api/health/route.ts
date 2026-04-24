import { NextResponse } from "next/server";
import { db } from "@complianceos/db";
import { sql } from "drizzle-orm";

async function checkDatabase(): Promise<{ status: string; latencyMs?: number; error?: string }> {
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    return { status: "connected", latencyMs: Date.now() - start };
  } catch (err: any) {
    return { status: "error", error: err.message };
  }
}

async function checkRedis(): Promise<{ status: string; latencyMs?: number; error?: string }> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return { status: "not_configured" };
  }
  
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

async function checkProjector(): Promise<{ status: string; url?: string; error?: string }> {
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
  const [dbHealth, redisHealth, projectorHealth] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkProjector(),
  ]);

  const isHealthy = 
    dbHealth.status === "connected" && 
    redisHealth.status !== "error" && 
    projectorHealth.status !== "error";

  return NextResponse.json({
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "unknown",
    checks: {
      database: dbHealth,
      redis: redisHealth,
      projector: projectorHealth,
    },
  }, {
    status: isHealthy ? 200 : 503,
  });
}
