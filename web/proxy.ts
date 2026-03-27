import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Proxy stub — Auth0 middleware can't run in Vercel Edge Runtime.
// Auth is handled server-side via auth0.getSession() in page.tsx.
export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
