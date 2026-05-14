import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

let _sql: any = null;

async function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const { default: postgres } = await import("postgres");
    _sql = postgres(url, { prepare: false });
  }
  return _sql;
}

export async function POST(req: Request) {
  try {
    const sql = await getSql();

    const { name, email, password } = await req.json();

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

    const existing = await sql`SELECT id FROM users WHERE email = ${emailNorm} LIMIT 1`;
    if (existing.length > 0) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const tenantId = randomUUID();

    await sql.begin(async (tx: any) => {
      await tx`INSERT INTO users (id, email, name, password_hash) VALUES (${userId}, ${emailNorm}, ${name || emailNorm.split("@")[0]}, ${passwordHash})`;
      await tx`INSERT INTO tenants (id, name, pan, address, state) VALUES (${tenantId}, ${(name || emailNorm.split("@")[0]) + "'s Company"}, 'TEMP-PAN', 'To be updated', 'maharashtra')`;
      await tx`INSERT INTO user_tenants (user_id, tenant_id, role) VALUES (${userId}, ${tenantId}, 'owner')`;
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Registration error:", err.message, err.stack);
    return Response.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
