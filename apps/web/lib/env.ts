const requiredServerEnvVars = [
  "DATABASE_URL",
  "REDIS_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

const requiredClientEnvVars = [
  "NEXT_PUBLIC_SENTRY_DSN",
] as const;

const optionalServerEnvVars = [
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "PROJECTOR_PORT",
] as const;

type EnvResult = { ok: true } | { ok: false; missing: string[] };

export function validateServerEnv(): EnvResult {
  const missing: string[] = [];
  for (const key of requiredServerEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    return { ok: false, missing };
  }
  return { ok: true };
}

export function validateClientEnv(): EnvResult {
  const missing: string[] = [];
  for (const key of requiredClientEnvVars) {
    if (typeof window !== "undefined" && !(key in (window as any).__ENV)) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }
  if (missing.length > 0) {
    return { ok: false, missing };
  }
  return { ok: true };
}

// Run at server startup
if (typeof window === "undefined") {
  const result = validateServerEnv();
  if (!result.ok) {
    console.error(
      `[ENV] Missing required environment variables:\n  ${result.missing.join("\n  ")}\n\n` +
        "See .env.example for all required variables."
    );
    process.exit(1);
  }
}
