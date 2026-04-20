import { auth } from "./lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(async (req: typeof NextRequest.prototype) => {
  const session = await auth();
  const pathname = req.nextUrl.pathname;

  // Paths that bypass onboarding check
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return undefined;
  }

  // Protect all /(app)/* routes
  if (pathname.startsWith("/(app)")) {
    if (!session?.user?.onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
