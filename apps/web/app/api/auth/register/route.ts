import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (typeof email !== "string" || typeof password !== "string") {
      return Response.json({ error: "Invalid input types" }, { status: 400 });
    }

    const emailNorm = email.toLowerCase().trim();
    if (!emailNorm.includes("@") || password.length < 8) {
      return Response.json({ error: "Invalid email or password too short (min 8 chars)" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const db = getDb();
    const { bootstrapTenant } = await import("@complianceos/server");
    const result = await bootstrapTenant(db, {
      email: emailNorm,
      passwordHash,
      name: name || emailNorm.split("@")[0],
    });

    return Response.json({ success: true, userId: result.userId, tenantId: result.tenantId }, { status: 201 });
  } catch (err: any) {
    console.error("Registration error:", err.message, err.stack);
    return Response.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
