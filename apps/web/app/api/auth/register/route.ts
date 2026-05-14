import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

async function getDb() {
  const { db, users, tenants, userTenants } = await import("@complianceos/db");
  return { db, users, tenants, userTenants };
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const { db, users, tenants, userTenants } = await getDb();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return Response.json({ error: "Invalid input types" }, { status: 400 });
    }

    const emailNorm = email.toLowerCase().trim();
    if (!emailNorm.includes("@") || password.length < 6) {
      return Response.json({ error: "Invalid email or password too short (min 6 chars)" }, { status: 400 });
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, emailNorm)).limit(1);
    if (existing.length > 0) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const tenantId = randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email: emailNorm,
        name: name || emailNorm.split("@")[0],
        passwordHash,
      });

      await tx.insert(tenants).values({
        id: tenantId,
        name: (name || emailNorm.split("@")[0]) + "'s Company",
        pan: "TEMP-PAN",
        address: "To be updated",
        state: "maharashtra",
      });

      await tx.insert(userTenants).values({
        userId,
        tenantId,
        role: "owner",
      });
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Registration error:", err);
    return Response.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
