import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/db";
import crypto from "crypto";

/**
 * GET /api/alpaca/auth
 * 
 * Initiates Alpaca OAuth flow for premium users.
 * Free users receive 403.
 * Premium users are redirected to Alpaca OAuth authorize URL.
 */
export async function GET() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Check premium tier
  const tier = await getUserTier(userId);
  if (tier !== "premium") {
    return NextResponse.json(
      { error: "Premium required", message: "Alpaca integration is available for premium users only" },
      { status: 403 }
    );
  }

  // Check Alpaca OAuth credentials
  const clientId = process.env.ALPACA_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json(
      { error: "Alpaca OAuth not configured" },
      { status: 503 }
    );
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(32).toString("hex");

  // Store state in a cookie (short-lived, HTTP-only, secure)
  const stateCookie = `alpaca_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`;

  // Build authorization URL
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/alpaca/callback`;
  
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: "account:write trading data",
    // Paper trading environment for development
    // In production, this would be "live" or configurable per user preference
    env: "paper",
  });

  const authorizeUrl = `https://app.alpaca.markets/oauth/authorize?${params.toString()}`;

  // Redirect to Alpaca with state cookie
  const response = NextResponse.redirect(authorizeUrl);
  response.headers.set("Set-Cookie", stateCookie);

  return response;
}
