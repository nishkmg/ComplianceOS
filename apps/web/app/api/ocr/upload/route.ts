import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@complianceos/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const tenantId = req.headers.get("x-tenant-id");

    if (!file || !tenantId) {
      return NextResponse.json({ error: "Missing file or tenant" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileUrl, fileSize } = await uploadFile(buffer, file.name, tenantId);

    return NextResponse.json({ fileUrl, fileSize });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
