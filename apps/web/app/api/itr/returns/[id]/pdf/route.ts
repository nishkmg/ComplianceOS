import { getDb } from "@/lib/db";
import { streamPdf } from "@/lib/pdf-stream";
export const runtime = "nodejs";

type ItrFormType = "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4" | "ITR-5" | "ITR-6" | "ITR-7";

function getIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const idx = segments.indexOf("returns");
  if (idx !== -1 && idx + 1 < segments.length) return segments[idx + 1];
  return segments[segments.length - 2] || "";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    const format = url.searchParams.get("format") || "summary";
    const id = getIdFromPath(url.pathname);

    if (!tenantId || !id) {
      return Response.json({ error: "tenantId and id required" }, { status: 400 });
    }

    const validFormats = ["summary", "itr-v", "json"];
    if (!validFormats.includes(format)) {
      return Response.json({ error: `Invalid format. Use: ${validFormats.join(", ")}` }, { status: 400 });
    }

    if (format === "json") {
      const { supabaseRest } = await import("@/lib/supabase-rest");
      const res = await supabaseRest(
        `itr_returns?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`,
        { method: "GET" },
      );
      const rows = Array.isArray(res.json) ? res.json : [];
      const itrReturn = rows[0] || null;
      if (!itrReturn) return Response.json({ error: "Not found" }, { status: 404 });

      const linesRes = await supabaseRest(
        `itr_return_lines?return_id=eq.${encodeURIComponent(id)}&order=schedule_code.asc`,
        { method: "GET" },
      );
      const lines = Array.isArray(linesRes.json) ? linesRes.json : [];

      return Response.json({ return: { ...itrReturn, lines } });
    }

    const { generateItrPdf } = await import("@complianceos/server");
    const db = getDb();

    const { supabaseRest } = await import("@/lib/supabase-rest");
    const retRes = await supabaseRest(
      `itr_returns?id=eq.${encodeURIComponent(id)}&tenant_id=eq.${encodeURIComponent(tenantId)}`,
      { method: "GET" },
    );
    const rows = Array.isArray(retRes.json) ? retRes.json : [];
    if (!rows.length) return Response.json({ error: "ITR return not found" }, { status: 404 });

    const itrReturn = rows[0];
    const formType: ItrFormType | null = MAP_RETURN_TYPE_TO_FORM_TYPE[itrReturn.return_type?.toLowerCase() ?? ""] ?? null;
    if (!formType) return Response.json({ error: `Unknown return type: ${itrReturn.return_type}` }, { status: 400 });

    const result = await generateItrPdf(db, tenantId, {
      returnId: id,
      formType,
    });

    const filename = `${itrReturn.return_type?.toUpperCase() || "ITR"}_${itrReturn.assessment_year || "AY"}_${id.slice(0, 8)}.pdf`;
    return streamPdf(result.signedUrl, filename);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

const MAP_RETURN_TYPE_TO_FORM_TYPE: Record<string, ItrFormType> = {
  itr1: "ITR-1",
  itr2: "ITR-2",
  itr3: "ITR-3",
  itr4: "ITR-4",
  itr5: "ITR-5",
  itr6: "ITR-6",
  itr7: "ITR-7",
};
