import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { upsertAlpacaConnection } from "@/lib/db";

/**
 * GET /api/alpaca/callback
 * 
 * Handles Alpaca OAuth callback.
 * Exchanges authorization code for access token,
 * stores tokens in database, redirects to settings with success/error.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Get state from cookie for CSRF validation
  const cookies = req.headers.get("cookie") || "";
  const stateCookie = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("alpaca_oauth_state="));
  const expectedState = stateCookie?.split("=")[1];

  // Base redirect URL
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/auth/login?error=session_expired", baseUrl)
    );
  }
  const userId = session.user.id;

  // Handle OAuth errors from Alpaca
  if (error) {
    console.error("Alpaca OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/settings?alpaca_error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  // Validate state to prevent CSRF
  if (!state || state !== expectedState) {
    console.error("Alpaca OAuth state mismatch", { state, expectedState });
    return NextResponse.redirect(
      new URL("/settings?alpaca_error=invalid_state", baseUrl)
    );
  }

  // Validate authorization code
  if (!code) {
    return NextResponse.redirect(
      new URL("/settings?alpaca_error=no_code", baseUrl)
    );
  }

  // Exchange code for token
  const clientId = process.env.ALPACA_CLIENT_ID?.trim();
  const clientSecret = process.env.ALPACA_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    console.error("Alpaca OAuth credentials not configured");
    return NextResponse.redirect(
      new URL("/settings?alpaca_error=server_config", baseUrl)
    );
  }

  try {
    const tokenResponse = await fetch("https://api.alpaca.markets/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/alpaca/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/settings?alpaca_error=token_exchange", baseUrl)
      );
    }

    const tokenData = await tokenResponse.json();

    // Calculate expiration if provided
    let expiresAt: Date | null = null;
    if (tokenData.expires_in) {
      expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    }

    // Store tokens in database
    await upsertAlpacaConnection(userId, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_type: tokenData.token_type || "Bearer",
      expires_at: expiresAt,
    });

    // Clear the state cookie and redirect with success
    const response = NextResponse.redirect(
      new URL("/settings?alpaca=connected", baseUrl)
    );
    response.headers.set(
      "Set-Cookie",
      "alpaca_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return response;
  } catch (err) {
    console.error("Alpaca callback error:", err);
    return NextResponse.redirect(
      new URL("/settings?alpaca_error=server_error", baseUrl)
    );
  }
}
