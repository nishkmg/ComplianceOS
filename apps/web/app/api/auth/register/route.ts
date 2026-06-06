import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { supabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

async function sbPost(path: string, body: unknown) {
  const res = await supabaseRest(path, { method: "POST", body });
  if (!res.ok) {
    throw new Error(`Supabase error (${res.status}): ${res.text.slice(0, 200)}`);
  }
  return res;
}

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
    if (!emailNorm.includes("@") || password.length < 6) {
      return Response.json({ error: "Invalid email or password too short (min 6 chars)" }, { status: 400 });
    }

    // Check existing user
    try {
      const checkRes = await supabaseRest(`users?email=eq.${encodeURIComponent(emailNorm)}&select=id`);
      if (checkRes.ok) {
        const existing = Array.isArray(checkRes.json) ? checkRes.json : [];
        if (existing.length > 0) {
          return Response.json({ error: "An account with this email already exists" }, { status: 409 });
        }
      }
    } catch (e: any) {
      const code = e?.cause?.code || e?.code || "UNKNOWN";
      return Response.json({ error: `Cannot connect to database: ${e.message} (${code})` }, { status: 503 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const tenantId = randomUUID();

    // Create user
    await sbPost("users", {
        id: userId, email: emailNorm, name: name || emailNorm.split("@")[0],
        password_hash: passwordHash,
    });

    // Create tenant
    await sbPost("tenants", {
        id: tenantId,
        name: (name || emailNorm.split("@")[0]) + "'s Company",
        pan: "TEMP-PAN", address: "To be updated", state: "maharashtra",
    });

    // Link user to tenant
    await sbPost("user_tenants", { user_id: userId, tenant_id: tenantId, role: "owner" });

    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Registration error:", err.message, err.stack);
    return Response.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
