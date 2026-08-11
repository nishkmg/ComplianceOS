import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PATHS = [
  "/dashboard",
  "/employees",
  "/payroll",
  "/payroll-reports",
  "/my-payslips",
  "/invoices",
  "/receivables",
  "/payments",
  "/journal",
  "/accounts",
  "/inventory",
  "/gst",
  "/itr",
  "/reports",
  "/settings",
  "/onboarding",
  "/access-denied",
  "/audit-log",
  "/coa",
  "/receipts",
  "/credit-notes",
  "/payables",
  "/support",
];

// ─── Rate limiting ───────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

export default async function middleware(req: NextRequest) {
  const secureCookie = req.nextUrl.protocol === "https:";
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie });
  const pathname = req.nextUrl.pathname;

  console.log("[middleware]", pathname, "protocol:", req.nextUrl.protocol, "secureCookie:", secureCookie, "token:", token ? "present" : "null", "secret:", process.env.NEXTAUTH_SECRET ? "set" : "missing");

  // ─── Rate limiting ───────────────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  // PDF routes: 10/min per user
  if (pathname.includes("/pdf")) {
    if (!checkRateLimit(`pdf:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many PDF requests. Try again in a minute." }, { status: 429 });
    }
  }

  // Non-auth API routes: 100/min per user
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth") && !pathname.startsWith("/api/trpc")) {
    if (!checkRateLimit(`api:${ip}`, 100, 60_000)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next") || pathname.startsWith("/api/trpc")) {
    return undefined;
  }

  // Already-authenticated users hitting auth screens or root → redirect to dashboard
  if (pathname === "/" && token) {
    const onboardingComplete = (token as { onboardingComplete?: boolean }).onboardingComplete;
    return NextResponse.redirect(new URL(onboardingComplete ? "/dashboard" : "/onboarding", req.url));
  }

  if ((pathname.startsWith("/login") || pathname.startsWith("/signup")) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow unauthenticated access to auth screens
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return undefined;
  }

  const isProtectedPath = PROTECTED_PATHS.some(path =>
    pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const onboardingComplete = (token as { onboardingComplete?: boolean }).onboardingComplete;
    if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return undefined;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
