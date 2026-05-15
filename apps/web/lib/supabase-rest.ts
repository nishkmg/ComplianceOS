import dns from "dns";
import https from "https";

const DEFAULT_SUPABASE_URL = "https://jjffitzswjizxcsdhtjn.supabase.co";

const ipv4Agent = new https.Agent({
  keepAlive: true,
  lookup(hostname, options, callback) {
    dns.lookup(hostname, { ...options, family: 4 }, callback);
  },
});

function baseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  return raw.trim().replace(/\/$/, "");
}

function authHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

export function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseRest(path: string, init: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; headers?: Record<string, string> } = {}) {
  const url = new URL(`${baseUrl()}/rest/v1/${path}`);
  const method = init.method || "GET";
  const body = init.body === undefined ? undefined : JSON.stringify(init.body);

  const headers: Record<string, string> = {
    ...authHeaders(),
    ...init.headers,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return new Promise<{ status: number; ok: boolean; text: string; json: unknown }>((resolve, reject) => {
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        headers,
        agent: ipv4Agent,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let parsed: unknown = null;
          if (data.length > 0) {
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = null;
            }
          }
          resolve({
            status: res.statusCode || 0,
            ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
            text: data,
            json: parsed,
          });
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    if (body !== undefined) {
      req.write(body);
    }

    req.end();
  });
}
