import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jjffitzswjizxcsdhtjn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sbFetch(path: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY!,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase error (${res.status}) ${res.statusText}: ${text.slice(0, 200)}`);
  }
  return res;
}

export async function POST(req: Request) {
  try {
    if (!SERVICE_ROLE_KEY) {
      return Response.json({ error: "Server not configured: missing service key" }, { status: 500 });
    }

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
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(emailNorm)}&select=id`,
        { headers: { "apikey": SERVICE_ROLE_KEY, "Authorization": `Bearer ${SERVICE_ROLE_KEY}` } }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (existing?.length > 0) {
          return Response.json({ error: "An account with this email already exists" }, { status: 409 });
        }
      }
    } catch (e: any) {
      return Response.json({ error: `Cannot connect to database: ${e.message}` }, { status: 503 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const tenantId = randomUUID();

    // Create user
    await sbFetch("users", {
      method: "POST",
      body: JSON.stringify({
        id: userId, email: emailNorm, name: name || emailNorm.split("@")[0],
        password_hash: passwordHash,
      }),
    });

    // Create tenant
    await sbFetch("tenants", {
      method: "POST",
      body: JSON.stringify({
        id: tenantId,
        name: (name || emailNorm.split("@")[0]) + "'s Company",
        pan: "TEMP-PAN", address: "To be updated", state: "maharashtra",
      }),
    });

    // Link user to tenant
    await sbFetch("user_tenants", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, tenant_id: tenantId, role: "owner" }),
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Registration error:", err.message, err.stack);
    return Response.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
