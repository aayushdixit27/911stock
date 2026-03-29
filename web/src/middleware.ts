import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/accuracy",
  "/auth/login",
  "/auth/register",
  "/onboarding",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/migrate",
  "/api/accuracy",
  "/api/user/onboarding",
  "/_next",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes are handled by individual route handlers - skip middleware redirect
  // They will return 401 if auth is required
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/") && !pathname.startsWith("/api/stripe/webhook") && !pathname.startsWith("/api/migrate") && !pathname.startsWith("/api/user/onboarding")) {
    return NextResponse.next();
  }

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    pathname === path ||
    pathname.startsWith("/accuracy") ||
    pathname.startsWith("/api/accuracy") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/user/onboarding") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/migrate")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for session token in cookies (JWT from NextAuth)
  const token = request.cookies.get("next-auth.session-token")?.value ||
                request.cookies.get("__Secure-next-auth.session-token")?.value ||
                request.cookies.get("authjs.session-token")?.value ||
                request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
