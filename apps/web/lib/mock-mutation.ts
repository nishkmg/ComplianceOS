export async function submitStep(step: number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, ...payload }),
  });
  const body = await res.json().catch(() => ({ error: "No response" }));
  if (!res.ok) {
    throw new Error((body as any)?.error || `Request failed (${res.status})`);
  }
  return body as Record<string, unknown>;
}
