import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Auth0 middleware can't run in Edge Runtime on Vercel.
// Instead, we handle auth routes manually and let everything else through.
export async function middleware(request: NextRequest) {
  // Let all requests through — Auth0 is handled server-side in page.tsx
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
