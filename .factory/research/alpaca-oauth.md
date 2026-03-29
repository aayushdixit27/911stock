# Alpaca Markets API — OAuth, Paper Trading & Trade Execution

> Official docs: https://docs.alpaca.markets
> OAuth guide: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api
> JS SDK: https://github.com/alpacahq/alpaca-trade-api-js

## Installation

```bash
npm install @alpacahq/alpaca-trade-api
```

The official SDK (`@alpacahq/alpaca-trade-api` v3.x) supports TypeScript and provides REST + WebSocket clients.

## Environment Variables

```env
# .env.local

# OAuth App credentials (register at https://app.alpaca.markets/brokerage/apps/manage)
ALPACA_CLIENT_ID=your_oauth_client_id
ALPACA_CLIENT_SECRET=your_oauth_client_secret
ALPACA_REDIRECT_URI=http://localhost:3000/api/alpaca/callback

# For server-side API key auth (your own account / testing)
APCA_API_KEY_ID=your_api_key
APCA_API_SECRET_KEY=your_api_secret
```

## API Base URLs

| Environment | Trading API | OAuth Authorization |
|-------------|-------------|---------------------|
| **Paper** | `https://paper-api.alpaca.markets` | `https://app.alpaca.markets/oauth/authorize` (with `env=paper`) |
| **Live** | `https://api.alpaca.markets` | `https://app.alpaca.markets/oauth/authorize` (with `env=live`) |
| **Token Exchange** | `https://api.alpaca.markets/oauth/token` | — |
| **Market Data** | `https://data.alpaca.markets` | — |

## Database Schema

Store user OAuth tokens:

```sql
CREATE TABLE alpaca_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'bearer',
  scope TEXT,
  account_id TEXT,           -- Alpaca account ID
  is_paper BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, is_paper)
);
```

## OAuth 2.0 Flow

### Step 1: Redirect User to Alpaca Authorization

```typescript
// app/api/alpaca/connect/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const state = crypto.randomBytes(16).toString("hex")

  // Store state in session/cookie for CSRF verification
  // (In production, store in a short-lived cache or encrypted cookie)

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.ALPACA_CLIENT_ID!,
    redirect_uri: process.env.ALPACA_REDIRECT_URI!,
    state,
    scope: "account:write trading data",
    env: "paper", // Use "paper" for development, "live" for production
  })

  const authorizeUrl = `https://app.alpaca.markets/oauth/authorize?${params.toString()}`

  return NextResponse.redirect(authorizeUrl)
}
```

### Step 2: Handle Callback — Exchange Code for Token

```typescript
// app/api/alpaca/callback/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    console.error("Alpaca OAuth error:", error)
    return NextResponse.redirect(new URL("/dashboard?alpaca_error=denied", req.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?alpaca_error=no_code", req.url))
  }

  // TODO: Verify state matches what was stored in Step 1

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://api.alpaca.markets/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.ALPACA_CLIENT_ID!,
        client_secret: process.env.ALPACA_CLIENT_SECRET!,
        redirect_uri: process.env.ALPACA_REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text()
      console.error("Token exchange failed:", err)
      return NextResponse.redirect(new URL("/dashboard?alpaca_error=token_failed", req.url))
    }

    const tokenData = await tokenResponse.json()
    // tokenData = { access_token: "...", token_type: "bearer", scope: "..." }

    // Fetch the account info to get the account ID
    const accountResponse = await fetch("https://paper-api.alpaca.markets/v2/account", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const account = await accountResponse.json()

    // Store the token (encrypt in production!)
    await pool.query(
      `INSERT INTO alpaca_connections (user_id, access_token, token_type, scope, account_id, is_paper)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, is_paper) DO UPDATE SET
         access_token = $2, scope = $4, account_id = $5, updated_at = NOW()`,
      [
        session.user.id,
        tokenData.access_token,
        tokenData.token_type || "bearer",
        tokenData.scope || "",
        account.id,
        true, // paper account
      ]
    )

    return NextResponse.redirect(new URL("/dashboard?alpaca=connected", req.url))
  } catch (err) {
    console.error("Alpaca callback error:", err)
    return NextResponse.redirect(new URL("/dashboard?alpaca_error=server_error", req.url))
  }
}
```

## Using the Alpaca SDK with API Keys (Server-Side, Your Own Account)

```typescript
// lib/alpaca.ts
import Alpaca from "@alpacahq/alpaca-trade-api"

// For your own account (testing / paper trading)
export const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID!,
  secretKey: process.env.APCA_API_SECRET_KEY!,
  paper: true,  // Use paper trading
})
```

## Making API Calls with OAuth Tokens (On Behalf of Users)

The SDK doesn't natively support OAuth bearer tokens for per-user calls. Use direct `fetch` instead:

```typescript
// lib/alpaca-client.ts

const PAPER_BASE = "https://paper-api.alpaca.markets"
const LIVE_BASE = "https://api.alpaca.markets"

export class AlpacaClient {
  private accessToken: string
  private baseUrl: string

  constructor(accessToken: string, paper: boolean = true) {
    this.accessToken = accessToken
    this.baseUrl = paper ? PAPER_BASE : LIVE_BASE
  }

  private async request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Alpaca API error ${res.status}: ${error}`)
    }

    return res.json()
  }

  // Account
  async getAccount() {
    return this.request("/v2/account")
  }

  // Orders
  async createOrder(params: {
    symbol: string
    qty?: number
    notional?: number
    side: "buy" | "sell"
    type: "market" | "limit" | "stop" | "stop_limit" | "trailing_stop"
    time_in_force: "day" | "gtc" | "opg" | "ioc"
    limit_price?: number
    stop_price?: number
    client_order_id?: string
    extended_hours?: boolean
  }) {
    return this.request("/v2/orders", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getOrders(params?: { status?: string; limit?: number }) {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : ""
    return this.request(`/v2/orders${query}`)
  }

  async getOrder(orderId: string) {
    return this.request(`/v2/orders/${orderId}`)
  }

  async cancelOrder(orderId: string) {
    return this.request(`/v2/orders/${orderId}`, { method: "DELETE" })
  }

  // Positions
  async getPositions() {
    return this.request("/v2/positions")
  }

  async getPosition(symbol: string) {
    return this.request(`/v2/positions/${symbol}`)
  }

  async closePosition(symbol: string) {
    return this.request(`/v2/positions/${symbol}`, { method: "DELETE" })
  }

  // Portfolio History
  async getPortfolioHistory(params?: {
    period?: string
    timeframe?: string
    extended_hours?: boolean
  }) {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : ""
    return this.request(`/v2/account/portfolio/history${query}`)
  }

  // Market Data (uses different base URL)
  async getLatestQuote(symbol: string) {
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )
    return res.json()
  }

  async getBars(symbol: string, params: { start: string; end: string; timeframe: string }) {
    const query = new URLSearchParams(params as any).toString()
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/bars?${query}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )
    return res.json()
  }
}
```

### Using the Client in API Routes

```typescript
// app/api/trading/order/route.ts
import { auth } from "@/auth"
import { AlpacaClient } from "@/lib/alpaca-client"
import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's Alpaca token
  const result = await pool.query(
    'SELECT access_token, is_paper FROM alpaca_connections WHERE user_id = $1',
    [session.user.id]
  )
  const connection = result.rows[0]
  if (!connection) {
    return NextResponse.json({ error: "Alpaca not connected" }, { status: 400 })
  }

  const client = new AlpacaClient(connection.access_token, connection.is_paper)

  const { symbol, qty, side, type, time_in_force } = await req.json()

  try {
    const order = await client.createOrder({
      symbol,
      qty,
      side,
      type: type || "market",
      time_in_force: time_in_force || "day",
    })

    return NextResponse.json(order)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

## Trade Execution Examples

### Market Buy

```typescript
const order = await client.createOrder({
  symbol: "AAPL",
  qty: 10,
  side: "buy",
  type: "market",
  time_in_force: "day",
})
```

### Limit Buy

```typescript
const order = await client.createOrder({
  symbol: "AAPL",
  qty: 10,
  side: "buy",
  type: "limit",
  time_in_force: "gtc",
  limit_price: 150.00,
})
```

### Dollar-Based Order (Notional)

```typescript
// Buy $500 worth of AAPL
const order = await client.createOrder({
  symbol: "AAPL",
  notional: 500,
  side: "buy",
  type: "market",
  time_in_force: "day",
})
```

### Sell All Shares of a Position

```typescript
// Close entire position
await client.closePosition("AAPL")
```

## Using the SDK for API Key Auth (Testing)

```typescript
import Alpaca from "@alpacahq/alpaca-trade-api"

const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID!,
  secretKey: process.env.APCA_API_SECRET_KEY!,
  paper: true,
})

// Get account info
const account = await alpaca.getAccount()
console.log("Buying power:", account.buying_power)

// Place an order
const order = await alpaca.createOrder({
  symbol: "AAPL",
  qty: 1,
  side: "buy",
  type: "market",
  time_in_force: "day",
})

// Get positions
const positions = await alpaca.getPositions()

// Stream real-time data
const stream = alpaca.data_stream_v2
stream.onConnect(() => {
  stream.subscribeForTrades(["AAPL", "MSFT"])
  stream.subscribeForQuotes(["AAPL"])
})
stream.onStockTrade((trade) => {
  console.log("Trade:", trade.Symbol, trade.Price, trade.Size)
})
stream.connect()
```

## WebSocket Streaming (Real-Time Data)

```typescript
// lib/alpaca-stream.ts
import Alpaca from "@alpacahq/alpaca-trade-api"

const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID!,
  secretKey: process.env.APCA_API_SECRET_KEY!,
  paper: true,
})

export function subscribeToTrades(symbols: string[], onTrade: (trade: any) => void) {
  const stream = alpaca.data_stream_v2

  stream.onConnect(() => {
    console.log("Connected to Alpaca data stream")
    stream.subscribeForTrades(symbols)
  })

  stream.onStockTrade(onTrade)

  stream.onError((err: any) => {
    console.error("Stream error:", err)
  })

  stream.onDisconnect(() => {
    console.log("Disconnected from Alpaca data stream")
  })

  stream.connect()

  return () => {
    stream.unsubscribeFromTrades(symbols)
    stream.disconnect()
  }
}
```

## OAuth Scopes Reference

| Scope | Description |
|-------|-------------|
| `account:write` | Read/write account configurations and watchlists |
| `trading` | Place, cancel, modify orders |
| `data` | Access market data API |

Request all three for full functionality: `scope=account:write trading data`

## Paper Trading Notes

- Paper trading uses `https://paper-api.alpaca.markets` as base URL
- Same API endpoints as live, just different base URL
- Paper accounts start with $100,000 virtual cash by default
- Paper accounts can be reset from the Alpaca dashboard
- When using OAuth, set `env=paper` in the authorize URL to only authorize paper accounts
- An OAuth token for paper trading works with `paper-api.alpaca.markets`
- An OAuth token for live trading works with `api.alpaca.markets`
- Market data API (`data.alpaca.markets`) works with both paper and live tokens

## Account Object (Key Fields)

```typescript
interface AlpacaAccount {
  id: string                    // Account ID
  account_number: string
  status: string                // ACTIVE, ONBOARDING, etc.
  currency: string              // USD
  buying_power: string          // Available buying power
  cash: string                  // Cash balance
  portfolio_value: string       // Total portfolio value
  pattern_day_trader: boolean   // PDT flag
  trading_blocked: boolean
  account_blocked: boolean
  equity: string                // Total equity
  last_equity: string           // Previous day equity
  long_market_value: string
  short_market_value: string
  daytrade_count: number
}
```

## Order Object (Key Fields)

```typescript
interface AlpacaOrder {
  id: string
  client_order_id: string
  created_at: string
  updated_at: string
  submitted_at: string
  filled_at: string | null
  expired_at: string | null
  canceled_at: string | null
  failed_at: string | null
  asset_id: string
  symbol: string
  qty: string
  filled_qty: string
  filled_avg_price: string | null
  order_type: "market" | "limit" | "stop" | "stop_limit" | "trailing_stop"
  type: string
  side: "buy" | "sell"
  time_in_force: "day" | "gtc" | "opg" | "ioc"
  limit_price: string | null
  stop_price: string | null
  status: "new" | "partially_filled" | "filled" | "done_for_day" |
          "canceled" | "expired" | "replaced" | "pending_cancel" |
          "pending_replace" | "accepted" | "pending_new" | "accepted_for_bidding" |
          "stopped" | "rejected" | "suspended" | "calculated"
}
```

## Common Pitfalls

1. **OAuth tokens don't expire by default**: Alpaca OAuth tokens are long-lived. However, users can revoke access from their Alpaca dashboard. Always handle 401 errors gracefully.

2. **Encrypt tokens at rest**: OAuth access tokens grant full trading access. Encrypt them in your database. Use something like `crypto.createCipheriv` or a secrets manager.

3. **Rate limits**: Alpaca has rate limits (200 requests/minute for Trading API). Implement retry logic with exponential backoff.

4. **Market hours matter**: Market orders only execute during market hours (9:30 AM - 4:00 PM ET). Use `extended_hours: true` for pre/post-market limit orders.

5. **Paper vs Live base URLs**: Double-check you're hitting `paper-api.alpaca.markets` in development, not `api.alpaca.markets`.

6. **The SDK uses API keys, not OAuth**: `@alpacahq/alpaca-trade-api` is designed for API key auth. For OAuth (multi-user), use direct `fetch` calls with Bearer token.

7. **One connection per data stream**: Most accounts can only have 1 active WebSocket connection. If another app is connected, you'll get a 406 error.

8. **Fractional shares**: Alpaca supports fractional shares. You can use `notional` (dollar amount) instead of `qty` for market orders.

9. **Order qty is a string in responses**: Even though you send `qty` as a number, responses return it as a string. Parse accordingly.

10. **OAuth app registration**: Register your OAuth app at https://app.alpaca.markets/brokerage/apps/manage. You need a funded live account to create an OAuth app.

## Key Links

- Alpaca Docs: https://docs.alpaca.markets
- OAuth Guide: https://docs.alpaca.markets/docs/using-oauth2-and-trading-api
- Trading API: https://docs.alpaca.markets/reference/getaccount-1
- Orders API: https://alpaca.markets/docs/trading/orders
- Market Data API: https://docs.alpaca.markets/reference/stockbars
- JS SDK GitHub: https://github.com/alpacahq/alpaca-trade-api-js
- OAuth App Registration: https://app.alpaca.markets/brokerage/apps/manage
- Paper Trading: https://alpaca.markets/docs/trading/paper-trading
