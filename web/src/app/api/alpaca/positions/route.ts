import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlpacaConnection, getUserTier, upsertAlpacaConnection } from "@/lib/db";

const ALPACA_PAPER_URL = "https://paper-api.alpaca.markets";

interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

/**
 * Fetches positions from Alpaca using OAuth token.
 */
async function fetchPositionsWithToken(accessToken: string): Promise<AlpacaPosition[]> {
  const res = await fetch(`${ALPACA_PAPER_URL}/v2/positions`, {
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
 * Fetches a single position from Alpaca using OAuth token.
 */
async function fetchPositionWithToken(accessToken: string, symbol: string): Promise<AlpacaPosition | null> {
  const res = await fetch(`${ALPACA_PAPER_URL}/v2/positions/${symbol.toUpperCase()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Alpaca API error (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Attempts to refresh the access token using refresh token.
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
 * GET /api/alpaca/positions
 * 
 * Fetches Alpaca positions for the authenticated user.
 * Premium only - free users get 403.
 * Handles token refresh if access token is expired.
 */
export async function GET(req: NextRequest) {
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

  const symbol = req.nextUrl.searchParams.get("symbol");

  try {
    if (symbol) {
      const position = await fetchPositionWithToken(connection.access_token, symbol);
      
      if (!position) {
        return NextResponse.json(
          { error: `No position for ${symbol}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        position: {
          symbol: position.symbol,
          qty: parseFloat(position.qty),
          avgEntryPrice: parseFloat(position.avg_entry_price),
          currentPrice: parseFloat(position.current_price),
          marketValue: parseFloat(position.market_value),
          costBasis: parseFloat(position.cost_basis),
          unrealizedPL: parseFloat(position.unrealized_pl),
          unrealizedPLPct: parseFloat(position.unrealized_plpc) * 100,
          changeToday: parseFloat(position.change_today) * 100,
        },
      });
    }

    const positions = await fetchPositionsWithToken(connection.access_token);
    
    return NextResponse.json({
      positions: positions.map((p) => ({
        symbol: p.symbol,
        qty: parseFloat(p.qty),
        avgEntryPrice: parseFloat(p.avg_entry_price),
        currentPrice: parseFloat(p.current_price),
        marketValue: parseFloat(p.market_value),
        costBasis: parseFloat(p.cost_basis),
        unrealizedPL: parseFloat(p.unrealized_pl),
        unrealizedPLPct: parseFloat(p.unrealized_plpc) * 100,
        changeToday: parseFloat(p.change_today) * 100,
      })),
      totalValue: positions.reduce(
        (sum, p) => sum + parseFloat(p.market_value),
        0
      ),
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
          if (symbol) {
            const position = await fetchPositionWithToken(newTokens.access_token, symbol);
            if (!position) {
              return NextResponse.json(
                { error: `No position for ${symbol}` },
                { status: 404 }
              );
            }
            return NextResponse.json({
              position: {
                symbol: position.symbol,
                qty: parseFloat(position.qty),
                avgEntryPrice: parseFloat(position.avg_entry_price),
                currentPrice: parseFloat(position.current_price),
                marketValue: parseFloat(position.market_value),
                costBasis: parseFloat(position.cost_basis),
                unrealizedPL: parseFloat(position.unrealized_pl),
                unrealizedPLPct: parseFloat(position.unrealized_plpc) * 100,
                changeToday: parseFloat(position.change_today) * 100,
              },
            });
          } else {
            const positions = await fetchPositionsWithToken(newTokens.access_token);
            return NextResponse.json({
              positions: positions.map((p) => ({
                symbol: p.symbol,
                qty: parseFloat(p.qty),
                avgEntryPrice: parseFloat(p.avg_entry_price),
                currentPrice: parseFloat(p.current_price),
                marketValue: parseFloat(p.market_value),
                costBasis: parseFloat(p.cost_basis),
                unrealizedPL: parseFloat(p.unrealized_pl),
                unrealizedPLPct: parseFloat(p.unrealized_plpc) * 100,
                changeToday: parseFloat(p.change_today) * 100,
              })),
              totalValue: positions.reduce(
                (sum, p) => sum + parseFloat(p.market_value),
                0
              ),
            });
          }
        } catch (retryErr) {
          console.error("Alpaca positions fetch retry error:", retryErr);
        }
      }
    }

    console.error("Alpaca positions fetch error:", err);
    return NextResponse.json(
      { 
        error: "Failed to fetch positions",
        message: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}