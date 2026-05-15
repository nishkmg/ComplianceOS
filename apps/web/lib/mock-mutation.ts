const TIMEOUT_MS = 30000;

export async function submitStep(step: number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step, ...payload }),
      signal: controller.signal,
    });

    const body = await res.json().catch(() => ({ error: "No response from server" }));
    if (!res.ok) {
      const msg = (body as any)?.error || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return body as Record<string, unknown>;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
