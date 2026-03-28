/**
 * Alpaca Paper Trading Integration
 * 
 * Setup:
 * 1. Create paper trading account at https://app.alpaca.markets/
 * 2. Generate API keys in the dashboard
 * 3. Add to .env.local:
 *    ALPACA_API_KEY=your_key_id
 *    ALPACA_API_SECRET=your_secret_key
 */

// Types for Alpaca API responses
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

export type AlpacaQuote = {
  symbol: string;
  quote: {
    t: string;
    ap: number;  // ask price
    as: number;  // ask size
    bp: number;  // bid price
    bs: number;  // bid size
  };
};

// Configuration
const ALPACA_PAPER_URL = "https://paper-api.alpaca.markets";
const ALPACA_DATA_URL = "https://data.alpaca.markets";

function getCredentials() {
  const apiKey = process.env.ALPACA_API_KEY?.trim();
  const apiSecret = process.env.ALPACA_API_SECRET?.trim();
  
  if (!apiKey || !apiSecret) {
    return null;
  }
  
  return { apiKey, apiSecret };
}

// Check if Alpaca is configured
export function isAlpacaConfigured(): boolean {
  return getCredentials() !== null;
}

// Generic fetch helper
async function alpacaFetch(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    body?: Record<string, unknown>;
    baseUrl?: string;
  } = {}
): Promise<unknown> {
  const creds = getCredentials();
  if (!creds) {
    throw new Error("Alpaca API keys not configured. Set ALPACA_API_KEY and ALPACA_API_SECRET in .env.local");
  }

  const baseUrl = options.baseUrl || ALPACA_PAPER_URL;
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "APCA-API-KEY-ID": creds.apiKey,
    "APCA-API-SECRET-KEY": creds.apiSecret,
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

  return res.json();
}

// ── Account ────────────────────────────────────────────────────────────────

export async function getAccount(): Promise<AlpacaAccount> {
  return alpacaFetch("/v2/account") as Promise<AlpacaAccount>;
}

// ── Positions ───────────────────────────────────────────────────────────────

export async function getPositions(): Promise<AlpacaPosition[]> {
  return alpacaFetch("/v2/positions") as Promise<AlpacaPosition[]>;
}

export async function getPosition(symbol: string): Promise<AlpacaPosition | null> {
  try {
    return alpacaFetch(`/v2/positions/${symbol.toUpperCase()}`) as Promise<AlpacaPosition>;
  } catch (err) {
    if (err instanceof Error && err.message.includes("position does not exist")) {
      return null;
    }
    throw err;
  }
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderParams = {
  symbol: string;
  qty?: number;
  notional?: number;  // dollar amount instead of shares
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "stop_limit";
  time_in_force?: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok";
  limit_price?: number;
  stop_price?: number;
  client_order_id?: string;
};

export async function createOrder(params: OrderParams): Promise<AlpacaOrder> {
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

  return alpacaFetch("/v2/orders", { method: "POST", body }) as Promise<AlpacaOrder>;
}

export async function getOrders(options?: {
  status?: "open" | "closed" | "all";
  limit?: number;
}): Promise<AlpacaOrder[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.limit) params.set("limit", String(options.limit));
  
  const query = params.toString() ? `?${params.toString()}` : "";
  return alpacaFetch(`/v2/orders${query}`) as Promise<AlpacaOrder[]>;
}

export async function cancelOrder(orderId: string): Promise<void> {
  await alpacaFetch(`/v2/orders/${orderId}`, { method: "DELETE" });
}

// ── Market Data ─────────────────────────────────────────────────────────────

export async function getLatestQuote(symbol: string): Promise<AlpacaQuote> {
  return alpacaFetch(
    `/v2/stocks/quotes/latest?symbols=${symbol.toUpperCase()}&feed=iex`,
    { baseUrl: ALPACA_DATA_URL }
  ) as Promise<AlpacaQuote>;
}

export async function getCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const quote = await getLatestQuote(symbol);
    // Return mid-price between bid and ask
    const bid = quote.quote?.bp;
    const ask = quote.quote?.ap;
    if (bid && ask) {
      return (bid + ask) / 2;
    }
    return ask || bid || null;
  } catch {
    return null;
  }
}

// ── Convenience helpers for 911stock ────────────────────────────────────────

/**
 * Execute a sell order for a percentage of position
 * Used by the AI agent when detecting insider trading signals
 */
export async function sellPercentage(
  symbol: string,
  percentage: number,
  reason?: string
): Promise<AlpacaOrder> {
  // Get current position
  const position = await getPosition(symbol);
  if (!position) {
    throw new Error(`No position found for ${symbol}`);
  }

  const currentQty = parseFloat(position.qty);
  const sharesToSell = Math.floor(currentQty * (percentage / 100));
  
  if (sharesToSell < 1) {
    throw new Error(`Position too small to sell ${percentage}% (only ${currentQty} shares)`);
  }

  // Get current price for limit order (slightly below market for faster fill)
  const price = await getCurrentPrice(symbol);
  
  const orderParams: OrderParams = {
    symbol,
    qty: sharesToSell,
    side: "sell",
    type: price ? "limit" : "market",
    time_in_force: "day",
    client_order_id: `911stock-${Date.now()}-${symbol}`,
  };

  if (price) {
    // Set limit slightly below current price for faster execution
    orderParams.limit_price = Math.round(price * 0.995 * 100) / 100;
  }

  const order = await createOrder(orderParams);
  
  console.log(`[Alpaca] Sold ${sharesToSell} shares of ${symbol} (${percentage}% of position)`);
  if (reason) {
    console.log(`[Alpaca] Reason: ${reason}`);
  }

  return order;
}

/**
 * Buy a stock with specified dollar amount
 */
export async function buyNotional(
  symbol: string,
  amount: number,
  reason?: string
): Promise<AlpacaOrder> {
  const price = await getCurrentPrice(symbol);
  
  const orderParams: OrderParams = {
    symbol,
    notional: amount,
    side: "buy",
    type: price ? "limit" : "market",
    time_in_force: "day",
    client_order_id: `911stock-${Date.now()}-${symbol}`,
  };

  if (price) {
    // Set limit slightly above current price for faster execution
    orderParams.limit_price = Math.round(price * 1.005 * 100) / 100;
  }

  const order = await createOrder(orderParams);
  
  console.log(`[Alpaca] Bought $${amount} of ${symbol}`);
  if (reason) {
    console.log(`[Alpaca] Reason: ${reason}`);
  }

  return order;
}