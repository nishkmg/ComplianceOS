import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

function getIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const accountId = getIdFromPath(url.pathname);
    const tenantId = url.searchParams.get("tenantId");
    if (!accountId || !tenantId) return Response.json({ error: "Missing params" }, { status: 400 });

    const res = await supabaseRest(`accounts?id=eq.${encodeURIComponent(accountId)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, { method: "GET" });
    const rows = Array.isArray(res.json) ? res.json : [];
    if (rows.length === 0) return Response.json({ error: "Not found" }, { status: 404 });

    return Response.json({ account: rows[0], transactions: [] });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
