import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@complianceos/db";
import { consumePasswordResetToken } from "@complianceos/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (typeof token !== "string" || token.length < 20) {
      return Response.json({ error: "This link is invalid or has expired. Request a new one." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const db = getDb();
    const res = await consumePasswordResetToken(db, token);
    if (!res) {
      return Response.json({ error: "This link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(users).set({ passwordHash }).where(eq(users.id, res.userId));

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message ?? "Reset failed" }, { status: 500 });
  }
}
