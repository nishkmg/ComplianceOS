import { auth } from "./lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthRequest = NextRequest & { auth: { user?: { id: string; onboardingComplete?: boolean } } | null };

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
];

export default auth(async (req: AuthRequest) => {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next") || pathname.startsWith("/api/trpc")) {
    return undefined;
  }

  // Already-authenticated users hitting auth screens → redirect to dashboard
  if ((pathname.startsWith("/login") || pathname.startsWith("/signup")) && session?.user) {
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
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!session.user.onboardingComplete && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
