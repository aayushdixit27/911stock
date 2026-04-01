/**
 * Alpaca OAuth Client for per-user trading
 * 
 * This module provides utilities to make Alpaca API calls using user-specific
 * OAuth tokens stored in the database.
 */

import { getAlpacaConnection, upsertAlpacaConnection } from "./db";

const ALPACA_PAPER_URL = "https://paper-api.alpaca.markets";
const ALPACA_DATA_URL = "https://data.alpaca.markets";
const ALPACA_OAUTH_TOKEN_URL = "https://api.alpaca.markets/oauth/token";

export type AlpacaPosition = {
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
};

export type AlpacaOrder = {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  order_class: string;
  order_type: string;
  type: string;
  side: "buy" | "sell";
  time_in_force: string;
  limit_price: string | null;
  stop_price: string | null;
  status: string;
  extended_hours: boolean;
};

export type AlpacaAccount = {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
};

export type OrderParams = {
  symbol: string;
  qty?: number;
  notional?: number;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "stop_limit";
  time_in_force?: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok";
  limit_price?: number;
  stop_price?: number;
  client_order_id?: string;
};

/**
 * Refresh the access token using refresh token
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
    const res = await fetch(ALPACA_OAUTH_TOKEN_URL, {
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
 * Get a valid access token for a user, refreshing if necessary
 */
async function getValidAccessToken(userId: string): Promise<string | null> {
  const connection = await getAlpacaConnection(userId);
  if (!connection) {
    return null;
  }

  // Check if token is expired
  const isExpired = connection.expires_at && new Date() > new Date(connection.expires_at);

  if (isExpired && connection.refresh_token) {
    const newTokens = await refreshAccessToken(connection.refresh_token);
    if (newTokens) {
      const expiresAt = newTokens.expires_in
        ? new Date(Date.now() + newTokens.expires_in * 1000)
        : null;

      await upsertAlpacaConnection(userId, {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || connection.refresh_token,
        token_type: newTokens.token_type || "Bearer",
        expires_at: expiresAt,
      });

      return newTokens.access_token;
    }
  }

  return connection.access_token;
}

/**
 * Make an authenticated request to Alpaca API
 */
async function alpacaFetch<T>(
  userId: string,
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    body?: Record<string, unknown>;
    baseUrl?: string;
  } = {}
): Promise<T> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    throw new Error("Alpaca not connected");
  }

  const baseUrl = options.baseUrl || ALPACA_PAPER_URL;
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Alpaca API error (${res.status}): ${errorText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Get user's Alpaca account info
 */
export async function getAlpacaAccount(userId: string): Promise<AlpacaAccount> {
  return alpacaFetch<AlpacaAccount>(userId, "/v2/account");
}

/**
 * Get all positions from Alpaca
 */
export async function getAlpacaPositions(userId: string): Promise<AlpacaPosition[]> {
  return alpacaFetch<AlpacaPosition[]>(userId, "/v2/positions");
}

/**
 * Get a specific position from Alpaca
 */
export async function getAlpacaPosition(userId: string, symbol: string): Promise<AlpacaPosition | null> {
  try {
    return await alpacaFetch<AlpacaPosition>(userId, `/v2/positions/${symbol.toUpperCase()}`);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

/**
 * Create an order on Alpaca
 */
export async function createAlpacaOrder(userId: string, params: OrderParams): Promise<AlpacaOrder> {
  const body: Record<string, unknown> = {
    symbol: params.symbol.toUpperCase(),
    side: params.side,
    type: params.type,
    time_in_force: params.time_in_force || "day",
  };

  if (params.qty) body.qty = params.qty;
  if (params.notional) body.notional = params.notional;
  if (params.limit_price) body.limit_price = params.limit_price;
  if (params.stop_price) body.stop_price = params.stop_price;
  if (params.client_order_id) body.client_order_id = params.client_order_id;

  return alpacaFetch<AlpacaOrder>(userId, "/v2/orders", {
    method: "POST",
    body,
  });
}

/**
 * Sell a percentage of a position on Alpaca
 */
export async function sellPercentageOnAlpaca(
  userId: string,
  symbol: string,
  percentage: number,
  clientOrderId?: string
): Promise<{ order: AlpacaOrder; sharesSold: number; price: number }> {
  // Get current position
  const position = await getAlpacaPosition(userId, symbol);
  if (!position) {
    throw new Error(`No position found for ${symbol}`);
  }

  const currentQty = parseFloat(position.qty);
  const sharesToSell = Math.floor(currentQty * (percentage / 100));

  if (sharesToSell < 1) {
    throw new Error(`Position too small to sell ${percentage}% (only ${currentQty} shares)`);
  }

  const order = await createAlpacaOrder(userId, {
    symbol,
    qty: sharesToSell,
    side: "sell",
    type: "market",
    time_in_force: "day",
    client_order_id: clientOrderId || `911stock-${Date.now()}-${symbol}`,
  });

  return {
    order,
    sharesSold: sharesToSell,
    price: parseFloat(position.current_price),
  };
}

/**
 * Get the latest quote for a symbol
 */
export async function getAlpacaQuote(userId: string, symbol: string): Promise<{ bid: number; ask: number }> {
  const data = await alpacaFetch<{
    quotes: Record<string, { bp: number; ap: number }>;
  }>(
    userId,
    `/v2/stocks/quotes/latest?symbols=${symbol.toUpperCase()}&feed=iex`,
    { baseUrl: ALPACA_DATA_URL }
  );

  const quote = data.quotes?.[symbol.toUpperCase()];
  if (!quote) {
    throw new Error(`No quote available for ${symbol}`);
  }

  return { bid: quote.bp, ask: quote.ap };
}
