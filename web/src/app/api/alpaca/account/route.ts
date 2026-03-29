import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlpacaConnection, getUserTier, upsertAlpacaConnection } from "@/lib/db";

const ALPACA_PAPER_URL = "https://paper-api.alpaca.markets";

/**
 * Fetches Alpaca account info using OAuth token.
 * Handles token refresh if expired.
 */
async function fetchAccountWithToken(accessToken: string) {
  const res = await fetch(`${ALPACA_PAPER_URL}/v2/account`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Alpaca API error (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Attempts to refresh the access token using refresh token.
 * Returns new tokens if successful, null otherwise.
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
} | null> {
  const clientId = process.env.ALPACA_CLIENT_ID?.trim();
  const clientSecret = process.env.ALPACA_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const res = await fetch("https://api.alpaca.markets/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

/**
 * GET /api/alpaca/account
 * 
 * Fetches Alpaca account info for the authenticated user.
 * Premium only - free users get 403.
 * Handles token refresh if access token is expired.
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

  // Get user's Alpaca connection
  const connection = await getAlpacaConnection(userId);
  if (!connection) {
    return NextResponse.json(
      { error: "Alpaca not connected", message: "Please connect your Alpaca account first" },
      { status: 400 }
    );
  }

  try {
    const account = await fetchAccountWithToken(connection.access_token);

    return NextResponse.json({
      connected: true,
      paperTrading: true,
      account: {
        id: account.id,
        number: account.account_number,
        status: account.status,
        buyingPower: parseFloat(account.buying_power),
        cash: parseFloat(account.cash),
        portfolioValue: parseFloat(account.portfolio_value),
        currency: account.currency,
        patternDayTrader: account.pattern_day_trader,
        blocked: account.trading_blocked || account.account_blocked,
      },
    });
  } catch (err) {
    // Check if token expired and we have refresh token
    if (connection.refresh_token) {
      const newTokens = await refreshAccessToken(connection.refresh_token);
      
      if (newTokens) {
        // Update stored tokens
        const expiresAt = newTokens.expires_in 
          ? new Date(Date.now() + newTokens.expires_in * 1000)
          : null;
        
        await upsertAlpacaConnection(userId, {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || connection.refresh_token,
          token_type: newTokens.token_type || "Bearer",
          expires_at: expiresAt,
        });

        // Retry with new token
        try {
          const account = await fetchAccountWithToken(newTokens.access_token);
          return NextResponse.json({
            connected: true,
            paperTrading: true,
            account: {
              id: account.id,
              number: account.account_number,
              status: account.status,
              buyingPower: parseFloat(account.buying_power),
              cash: parseFloat(account.cash),
              portfolioValue: parseFloat(account.portfolio_value),
              currency: account.currency,
              patternDayTrader: account.pattern_day_trader,
              blocked: account.trading_blocked || account.account_blocked,
            },
          });
        } catch (retryErr) {
          console.error("Alpaca account fetch retry error:", retryErr);
        }
      }
    }

    console.error("Alpaca account fetch error:", err);
    return NextResponse.json(
      { 
        error: "Failed to fetch account",
        message: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}