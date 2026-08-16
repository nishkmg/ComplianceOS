import { getDb } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { itrReturns, itrSchedules } from "@complianceos/db";
import { getToken } from "next-auth/jwt";
export const runtime = "nodejs";

function getIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const idx = segments.indexOf("returns");
  if (idx !== -1 && idx + 1 < segments.length) return segments[idx + 1];
  return segments[segments.length - 2] || "";
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function flattenScheduleData(data: unknown): Array<[string, string]> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [];
  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") {
      for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
        if (subValue === null || subValue === undefined) continue;
        entries.push([`${key}.${subKey}`, String(subValue)]);
      }
    } else {
      entries.push([key, String(value)]);
    }
  }
  return entries;
}

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub || !token.tenantId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantId = token.tenantId as string;

    const url = new URL(req.url);
    const id = getIdFromPath(url.pathname);
    if (!id) {
      return Response.json({ error: "id required" }, { status: 400 });
    }

    const db = getDb();

    const [itrReturn] = await db.select().from(itrReturns).where(
      and(eq(itrReturns.id, id), eq(itrReturns.tenantId, tenantId)),
    );
    if (!itrReturn) return Response.json({ error: "ITR return not found" }, { status: 404 });

    const schedules = await db.select().from(itrSchedules).where(eq(itrSchedules.returnId, id));

    const rows: string[][] = [
      ["Return Type", itrReturn.returnType],
      ["Financial Year", itrReturn.financialYear],
      ["Assessment Year", itrReturn.assessmentYear],
      ["Status", itrReturn.status],
      [""],
      ["Schedule", "Field", "Value"],
    ];

    for (const schedule of schedules) {
      const fields = flattenScheduleData(schedule.scheduleData);
      if (fields.length === 0) {
        rows.push([schedule.scheduleCode, "", schedule.totalAmount ?? ""]);
      } else {
        for (const [field, value] of fields) {
          rows.push([schedule.scheduleCode, field, value]);
        }
      }
      rows.push([schedule.scheduleCode, "Total", schedule.totalAmount ?? ""]);
    }

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="itr-${id}.csv"`,
      },
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
