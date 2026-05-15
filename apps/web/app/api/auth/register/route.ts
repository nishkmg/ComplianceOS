import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import dns from "dns";
import https from "https";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jjffitzswjizxcsdhtjn.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const runtime = "nodejs";

const ipv4Agent = new https.Agent({
  keepAlive: true,
  lookup(hostname, options, callback) {
    dns.lookup(hostname, { ...options, family: 4 }, callback);
  },
});

function normalizeBaseUrl(input: string) {
  return input.trim().replace(/\/$/, "");
}

async function httpJson(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    // @ts-expect-error Next.js runtime supports Node agent passthrough
    agent: ipv4Agent,
  });
  return res;
}

async function sbFetch(path: string, options: RequestInit = {}) {
  const baseUrl = normalizeBaseUrl(SUPABASE_URL);
  const url = `${baseUrl}/rest/v1/${path}`;
  const res = await httpJson(url, {
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
      const baseUrl = normalizeBaseUrl(SUPABASE_URL);
      const checkRes = await httpJson(
        `${baseUrl}/rest/v1/users?email=eq.${encodeURIComponent(emailNorm)}&select=id`,
        { headers: { "apikey": SERVICE_ROLE_KEY, "Authorization": `Bearer ${SERVICE_ROLE_KEY}` } }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (existing?.length > 0) {
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
