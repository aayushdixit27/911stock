---
name: 911stock
description: Real-time insider trading detection and voice alert system. Monitors SEC EDGAR Form 4 filings, scores signals with AI, and triggers automated phone calls to protect retail investors.
license: MIT
compatibility: Requires network access for SEC EDGAR, Google Gemini, Bland AI, Auth0, Yahoo Finance, and Alpha Vantage APIs. PostgreSQL database required.
metadata:
  author: aayushdixit
  version: "1.0.0"
---

# 911Stock — Insider Trading Alert Skill

## When to use this skill

Use this skill when building or extending a system that:
- Monitors SEC EDGAR for insider trading (Form 4) filings
- Scores and analyzes insider transactions using AI
- Triggers automated voice alerts to investors
- Handles trade approval workflows via push notifications (Auth0 CIBA)
- Fetches real-time stock prices and news sentiment

## Architecture

The pipeline flows in one direction:

```
SEC EDGAR Form 4 → Signal Detection → Score (0-10) → Gemini Analysis → Bland AI Phone Call → Auth0 CIBA Approval → Trade Execution
```

### Core modules

| Module | File | Purpose |
|--------|------|---------|
| EDGAR Poller | `src/lib/edgar.ts` | Fetches and parses Form 4 XML filings from SEC EDGAR |
| Signal Scorer | `src/lib/signals.ts` | Multi-factor scoring: role, sale type, position %, recency, sentiment |
| AI Analyzer | `src/lib/gemini.ts` | Plain-English explanation via Google Gemini |
| Voice Caller | `src/lib/bland.ts` | Outbound calls via Bland AI with approval tool |
| Auth0 CIBA | `src/lib/auth0-ciba.ts` | Push-based trade approval via Guardian app |
| News Sentiment | `src/lib/news.ts` | Alpha Vantage sentiment scoring for watchlist tickers |
| Database | `src/lib/db.ts` | PostgreSQL persistence for signals and alerts |
| Portfolio | `src/lib/portfolio.ts` | In-memory portfolio state and trade execution |

## SEC EDGAR Integration

### CIK Mapping

Always map tickers to 10-digit zero-padded CIK numbers:

```typescript
const CIK_MAP: Record<string, string> = {
  SMCI: "0001096343",
  TSLA: "0001318605",
  NVDA: "0001045810",
}
```

To add a new ticker, look up the CIK at `https://www.sec.gov/cgi-bin/browse-edgar?company=&CIK=TICKER&type=4`.

### Rate limiting

SEC EDGAR enforces a 5 requests/second limit. Always add 200ms delay between requests:

```typescript
await delay(200) // before each EDGAR fetch
```

### Form 4 parsing

Parse XML without external libraries using regex helpers:

```typescript
function xmlTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "i")
  const m = re.exec(xml)
  return m ? m[1].trim() : ""
}
```

Key fields to extract:
- `issuerTradingSymbol` — ticker
- `rptOwnerName` — insider name
- `officerTitle` — role (CEO, CFO, etc.)
- `transactionShares` → `value` — share count
- `transactionPricePerShare` → `value` — price
- `transactionAcquiredDisposedCode` → `value` — "D" = sell, "A" = buy

### 10b5-1 detection

Check footnotes for "10b5-1" mentions. Scheduled sales are less suspicious:

```typescript
const scheduled_10b5_1 =
  footnotes.includes("10b5-1") ||
  footnotes.includes("10b5\u20131") ||
  planCode === "1"
```

## Signal Scoring

Score signals 0-10 using these factors:

| Factor | Points | Condition |
|--------|--------|-----------|
| Unscheduled sale | +3 | `!signal.scheduled_10b5_1` |
| C-suite insider | +2 | Role is CEO, CFO, CTO, or COO |
| Rare seller | +2 | `last_transaction_months_ago > 12` |
| Large position reduction | +2 | `position_reduced_pct >= 15%` |
| Medium position reduction | +1 | `position_reduced_pct >= 10%` |
| High value sale | +1 | `total_value >= $2M` |
| Very negative news | +2 | `sentiment_score < -0.4` |
| Somewhat negative news | +1 | `sentiment_score < -0.2` |

**Thresholds:**
- Score < 5 → ignore, too low
- Score 5-6 → log and display, no call
- Score >= 7 → auto-trigger outbound phone call

## Bland AI Voice Calls

### Call script pattern

Always structure the call as:

1. **Identify** — "Hey, this is 911Stock."
2. **Alert** — Explain the signal with source citations
3. **Offer action** — "I can reduce your position by 50%."
4. **Handle response** — Use `request_approval` tool on "yes"
5. **Reassure** — "I'll keep monitoring" on "no"

```typescript
const result = await makeOutboundCall(phone, explanation, signal)
```

### Webhook flow

When user approves during the call:
1. Bland AI calls `POST /api/bland-webhook` with approval data
2. Webhook initiates Auth0 CIBA backchannel request
3. User gets push notification on Auth0 Guardian app
4. On Guardian approval → execute trade via `/api/execute-trade`

## Auth0 CIBA Flow

Client-Initiated Backchannel Authentication enables push-based trade approvals:

1. Backend sends CIBA request to Auth0 with user's `sub`
2. Auth0 pushes notification to Guardian mobile app
3. User approves/denies on their phone
4. Backend polls `POST /api/ciba-status` for result
5. On approval → execute the trade

Always set `AUTH0_AUDIENCE` (defaults to "911stock-api").

## Database Schema

Two tables, auto-migrated via `GET /api/migrate`:

```sql
CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  ticker TEXT NOT NULL,
  company_name TEXT,
  insider TEXT,
  role TEXT,
  action TEXT,
  shares NUMERIC,
  price_per_share NUMERIC,
  total_value NUMERIC,
  date TEXT,
  filed_at TEXT,
  scheduled_10b5_1 BOOLEAN DEFAULT FALSE,
  last_transaction_months_ago NUMERIC,
  position_reduced_pct NUMERIC,
  score INTEGER,
  explanation TEXT,
  alerted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  signal_id TEXT REFERENCES signals(id),
  ticker TEXT NOT NULL,
  call_id TEXT,
  explanation TEXT,
  approved BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Use `ON CONFLICT DO NOTHING` when inserting signals to handle duplicate polling.

## Real-Time Polling

The `/api/poll` endpoint is the heartbeat. Hit it on an interval:

```typescript
// Client-side polling every 60 seconds
setInterval(() => fetch('/api/poll', { method: 'POST' }), 60_000)
```

Or configure Vercel Cron in `vercel.json`:

```json
{
  "crons": [{ "path": "/api/poll", "schedule": "* * * * *" }]
}
```

The poll endpoint:
1. Fetches EDGAR for all watchlist tickers
2. Skips if score < 5
3. Deduplicates against DB
4. Auto-calls if score >= 7 and not already alerted

## Stock Quotes

Fetch live prices from Yahoo Finance with 60-second caching:

```typescript
// GET /api/stock-quote?symbol=SMCI
const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
```

## Common Mistakes

- Don't skip the 200ms delay between EDGAR requests — SEC will rate-limit you
- Don't call Bland AI without checking `alerted` flag — you'll double-call users
- Don't use `SELECT *` on the signals table in production — use indexed ticker lookups
- Don't store phone numbers in client-side code — use env vars
- Always handle EDGAR XML parsing failures gracefully — filings vary in structure
- Never trust raw EDGAR data for trade execution — always run through Gemini analysis first

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/trigger` | POST | Full pipeline: detect → analyze → call |
| `/api/poll` | POST | Cron-safe polling: detect → dedupe → call if new |
| `/api/analyze` | POST | Lightweight: detect → analyze (no DB, no call) |
| `/api/signal` | GET | Fetch latest signal for display |
| `/api/feed` | GET | Recent signals feed |
| `/api/stock-quote` | GET | Live stock price via Yahoo Finance |
| `/api/call` | POST | Trigger outbound Bland call manually |
| `/api/bland-webhook` | POST | Receives Bland AI callback → initiates CIBA |
| `/api/ciba-status` | POST | Poll Auth0 CIBA approval status |
| `/api/approve` | POST | Manual trade approval (fallback) |
| `/api/execute-trade` | POST | Execute portfolio trade |
| `/api/portfolio` | GET | Current holdings and trades |
| `/api/migrate` | GET | Run database migrations |
