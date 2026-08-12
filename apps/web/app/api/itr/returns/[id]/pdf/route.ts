import { getDb } from "@/lib/db";
import { streamPdf } from "@/lib/pdf-stream";
import { eq, and } from "drizzle-orm";
import { itrReturns, itrReturnLines } from "@complianceos/db";
import { getToken } from "next-auth/jwt";
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub || !token.tenantId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantId = token.tenantId as string;

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "summary";
    const id = getIdFromPath(url.pathname);

    if (!id) {
      return Response.json({ error: "id required" }, { status: 400 });
    }

    const validFormats = ["summary", "itr-v", "json"];
    if (!validFormats.includes(format)) {
      return Response.json({ error: `Invalid format. Use: ${validFormats.join(", ")}` }, { status: 400 });
    }

    if (format === "json") {
      const db = getDb();
      const [itrReturn] = await db.select().from(itrReturns).where(
        and(eq(itrReturns.id, id), eq(itrReturns.tenantId, tenantId)),
      );
      if (!itrReturn) return Response.json({ error: "Not found" }, { status: 404 });

      const lines = await db.select().from(itrReturnLines).where(eq(itrReturnLines.returnId, id));

      return Response.json({ return: { ...itrReturn, lines } });
    }

    const { generateItrPdf } = await import("@complianceos/server");
    const db = getDb();

    const [itrReturn] = await db.select().from(itrReturns).where(
      and(eq(itrReturns.id, id), eq(itrReturns.tenantId, tenantId)),
    );
    if (!itrReturn) return Response.json({ error: "ITR return not found" }, { status: 404 });

    const formType: ItrFormType | null = MAP_RETURN_TYPE_TO_FORM_TYPE[itrReturn.returnType?.toLowerCase() ?? ""] ?? null;
    if (!formType) return Response.json({ error: `Unknown return type: ${itrReturn.returnType}` }, { status: 400 });

    const result = await generateItrPdf(db, tenantId, {
      returnId: id,
      formType,
      actorId: token.sub,
    });

    const filename = `${itrReturn.returnType?.toUpperCase() || "ITR"}_${itrReturn.assessmentYear || "AY"}_${id.slice(0, 8)}.pdf`;
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
