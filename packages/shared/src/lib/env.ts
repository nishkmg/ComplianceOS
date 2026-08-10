import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  NEXTAUTH_SECRET: z.string().min(16),
  // NextAuth v5 derives the base URL from the request when unset (Vercel)
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_URL: z.string().url().optional(),

  // Legacy Supabase config — only required when STORAGE_DRIVER=supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  MAIL_HOST: z.string().min(1).optional(),
  MAIL_PORT: z.coerce.number().int().positive().optional(),
  MAIL_SECURE: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((v) => v === true || v === "true"),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),

  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  STORAGE_BUCKET: z.string().min(1).optional(),
  UPLOAD_DIR: z.string().min(1).optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),

  PROJECTOR_PORT: z.coerce.number().int().positive().default(3100),
  PROJECTOR_URL: z.string().url().optional(),

  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  DEMO_TENANT_ID: z.string().optional(),
  NEXT_PUBLIC_DEMO_MODE: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((v) => v === true || v === "true"),

  CI: z
    .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
    .optional()
    .transform((v) => v === true || v === "true" || v === "1"),
  BASE_URL: z.string().url().optional(),
  PORT: z.coerce.number().int().positive().optional(),

  SEED_DEMO: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((v) => v === true || v === "true"),
  ALLOW_SEED: z
    .union([z.boolean(), z.enum(["1", "0"])])
    .optional()
    .transform((v) => v === true || v === "1"),
  ALLOW_PROD_SEED: z
    .union([z.boolean(), z.enum(["1", "0"])])
    .optional()
    .transform((v) => v === true || v === "1"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function validateEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    console.error("Environment validation failed:");
    console.error(JSON.stringify(flat.fieldErrors, null, 2));
    throw new Error("Environment validation failed — see errors above");
  }
  cached = parsed.data;
  return cached;
}
