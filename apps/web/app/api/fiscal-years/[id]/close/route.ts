import { db } from "@complianceos/db";

export const runtime = "nodejs";

// ─── POST: close a fiscal year ────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").filter(Boolean).slice(-2)[0];
    const body = await req.json();
    const { tenantId, actorId } = body;
    if (!id || !tenantId || !actorId) {
      return Response.json({ error: "id, tenantId, actorId required" }, { status: 400 });
    }
    const { closeFiscalYear } = await import("@complianceos/server");
    await closeFiscalYear(db, tenantId, id, actorId);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("[fiscal-years/close] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
