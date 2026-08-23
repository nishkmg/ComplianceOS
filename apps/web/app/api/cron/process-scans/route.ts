import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Cron-invoked event processor — makes the projector drain run on Vercel
 * where no long-lived worker exists. Auth: Bearer CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "Cron not configured. Set CRON_SECRET." }, { status: 501 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Drain all tenants with pending events by replaying projectors per tenant.
    const { db } = await import("@complianceos/db");
    const { eventStore } = await import("@complianceos/db");
    const { runProjectorsForTenant } = await import("@complianceos/server");

    // Find distinct tenants that have events newer than their projector cursor.
    // Simplest correct approach: get distinct tenant_ids from event_store,
    // replay each, and report counts.
    const pendingRows = await (db as any)`
      SELECT DISTINCT es.tenant_id
      FROM event_store es
      WHERE NOT EXISTS (
        SELECT 1 FROM projector_state ps
        WHERE ps.tenant_id = es.tenant_id
          AND ps.last_processed_sequence >= es.sequence
      )
      LIMIT 50
    `;
    const results: Array<{ tenantId: string }> = [];
    for (const row of pendingRows) {
      await runProjectorsForTenant(row.tenant_id);
      results.push({ tenantId: row.tenant_id });
    }
    return Response.json({ ok: true, tenantsProcessed: results.length });
  } catch (err) {
    console.error("cron process-scans error:", err);
    return Response.json({ error: "Processing failed." }, { status: 500 });
  }
}
