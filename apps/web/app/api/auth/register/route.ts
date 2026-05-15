import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jjffitzswjizxcsdhtjn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function supabaseFetch(path: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase API error (${res.status}): ${text.slice(0, 200)}`);
  }
}

export async function POST(req: Request) {
  try {
    if (!SERVICE_ROLE_KEY) {
      return Response.json({ error: "Server not configured for registration" }, { status: 500 });
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

    // Check for existing user via Supabase REST API
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(emailNorm)}&select=id`,
      {
        headers: {
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing.length > 0) {
        return Response.json({ error: "An account with this email already exists" }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const tenantId = randomUUID();

    // Create user
    await supabaseFetch("users", {
      id: userId,
      email: emailNorm,
      name: name || emailNorm.split("@")[0],
      password_hash: passwordHash,
    });

    // Create tenant
    await supabaseFetch("tenants", {
      id: tenantId,
      name: (name || emailNorm.split("@")[0]) + "'s Company",
      pan: "TEMP-PAN",
      address: "To be updated",
      state: "maharashtra",
    });

    // Create user-tenant association
    await supabaseFetch("user_tenants", {
      user_id: userId,
      tenant_id: tenantId,
      role: "owner",
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Registration error:", err.message, err.stack);
    return Response.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
