import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { db } from "@complianceos/db";
import * as _db from "@complianceos/db";
const { gstReturns } = _db;
import { generateGstr1Pdf, generateGstr2bPdf, generateGstr3bPdf, generateGstr9Pdf } from "@complianceos/server";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    if (!type || !["gstr1", "gstr2b", "gstr3b", "gstr9"].includes(type)) {
      return NextResponse.json({ error: "type must be gstr1|gstr2b|gstr3b|gstr9" }, { status: 400 });
    }

    const [gstReturn] = await db.select({ tenantId: gstReturns.tenantId }).from(gstReturns)
      .where(and(eq(gstReturns.id, params.id))).limit(1);
    if (!gstReturn) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    let result: { signedUrl: string; storagePath: string };

    switch (type) {
      case "gstr1":
        result = await generateGstr1Pdf(db, gstReturn.tenantId, params.id);
        break;
      case "gstr2b":
        result = await generateGstr2bPdf(db, gstReturn.tenantId, params.id);
        break;
      case "gstr3b":
        result = await generateGstr3bPdf(db, gstReturn.tenantId, params.id);
        break;
      case "gstr9":
        result = await generateGstr9Pdf(db, gstReturn.tenantId, params.id);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const filename = `${type.toUpperCase()}_${params.id.slice(0, 8)}.pdf`;
    return NextResponse.redirect(result.signedUrl, {
      headers: { "Content-Disposition": `attachment; filename="${filename}"` },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
