import { db, invoiceView } from "@complianceos/db";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";

function getIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const id = getIdFromPath(url.pathname);
    if (!tenantId || !id) return Response.json({ error: "tenantId and id required" }, { status: 400 });
    const [row] = await db.select().from(invoiceView).where(and(eq(invoiceView.tenantId, tenantId), eq(invoiceView.invoiceId, id))).limit(1);
    return Response.json({ invoice: row || null });
  } catch (err: any) { return Response.json({ error: err.message }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = getIdFromPath(url.pathname);
    const body = await req.json();
    const { tenantId, createdBy, ...fields } = body;
    if (!tenantId || !id) return Response.json({ error: "tenantId and id required" }, { status: 400 });
    if (!createdBy) return Response.json({ error: "createdBy required" }, { status: 400 });

    const db = getDb();
    const { modifyInvoice } = await import("@complianceos/server");
    await modifyInvoice(db, tenantId, createdBy, { id, ...fields });

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
