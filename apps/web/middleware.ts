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
  "/support",
];

export default async function middleware(req: NextRequest) {
  const secureCookie = req.nextUrl.protocol === "https:";
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie });
  const pathname = req.nextUrl.pathname;

  console.log("[middleware]", pathname, "protocol:", req.nextUrl.protocol, "secureCookie:", secureCookie, "token:", token ? "present" : "null", "secret:", process.env.NEXTAUTH_SECRET ? "set" : "missing");

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
