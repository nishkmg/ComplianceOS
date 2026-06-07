import { supabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const entryId = segments[segments.length - 1];
    if (!entryId) return Response.json({ error: "Entry ID required" }, { status: 400 });

    const res = await supabaseRest(`journal_entries?id=eq.${encodeURIComponent(entryId)}`, { method: "GET" });
    const entries = Array.isArray(res.json) ? res.json : [];
    if (entries.length === 0) return Response.json({ error: "Not found" }, { status: 404 });
    const entry = entries[0];

    const linesRes = await supabaseRest(`journal_entry_lines?journal_entry_id=eq.${encodeURIComponent(entryId)}&order=id.asc`, { method: "GET" });
    const lines = linesRes.ok && Array.isArray(linesRes.json) ? linesRes.json : [];

    return Response.json({ entry: { ...entry, lines } });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
