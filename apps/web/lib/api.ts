import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@complianceos/server";

export const api: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

// ─── Generic data fetch helpers (used by pages with REST APIs) ────────

const API_TIMEOUT = 15000;

export async function apiGet<T = any>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await fetch(path, { signal: controller.signal });
    if (!res.ok) throw new Error(`API error (${res.status})`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiPost(path: string, body: Record<string, unknown>): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error (${res.status})`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}
