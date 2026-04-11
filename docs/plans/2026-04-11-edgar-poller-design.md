# EDGAR Poller Design

**Date:** 2026-04-11
**Status:** Approved for implementation

## Overview

Standalone Node.js script (`web/scripts/poller.ts`) that polls SEC EDGAR every 60 seconds for new Form 4 insider trading filings, scores them, generates LLM context, stores in Ghost DB, and delivers alerts via Twilio RCS/SMS.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  web/scripts/poller.ts  (npx tsx scripts/poller.ts)     │
│                                                         │
│  ┌─────────┐    ┌─────────┐    ┌──────────┐            │
│  │ EDGAR   │───▶│ Score   │───▶│ LLM      │            │
│  │ Poller  │    │ Engine  │    │ Analyze  │            │
│  │ (60s)   │    │ (0-10)  │    │ (Gemini) │            │
│  └─────────┘    └─────────┘    └──────────┘            │
│       │                               │                 │
│       ▼                               ▼                 │
│  ┌─────────────────────────────────────────┐           │
│  │          Dedup Check (DB)               │           │
│  │  SELECT id FROM signals WHERE           │           │
│  │  edgar_filing_id = $1                   │           │
│  └─────────────────────────────────────────┘           │
│       │                                │               │
│       ▼                                ▼               │
│  ┌──────────┐   score >= 7     ┌──────────────┐        │
│  │ Skip     │─────────────────▶│ Insert Signal│        │
│  │ (no-op)  │                  │ into DB      │        │
│  └──────────┘                  └──────────────┘        │
│                                         │              │
│                                         ▼              │
│                                  ┌──────────────┐      │
│                                  │ Twilio RCS   │      │
│                                  │ + SMS fallback│     │
│                                  └──────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Poll** — Every 60s, fetch recent Form 4 filings from EDGAR for each ticker in the watchlist
2. **Dedup** — Check `signals` table for existing `edgar_filing_id`. Skip if exists.
3. **Parse** — Parse Form 4 XML into Signal objects (reuse `edgar.ts`)
4. **Score** — Score 0-10 using existing `scoreSignal()` from `signals.ts`
5. **Threshold** — If score < 7: log and skip. If score ≥ 7: continue.
6. **Analyze** — Call Gemini via TrueFoundry for 2-sentence plain-English context
7. **Store** — Insert signal into `signals` table with `edgar_filing_id` for dedup
8. **Deliver** — Query `watchlist` for users watching this ticker, send RCS/SMS via Twilio

## Module Reuse

| Module | Location | Reused For |
|--------|----------|------------|
| `edgar.ts` | `web/src/lib/edgar.ts` | EDGAR API calls, Form 4 XML parsing, CIK mapping |
| `signals.ts` | `web/src/lib/signals.ts` | Signal scoring engine (0-10) |
| `gemini.ts` | `web/src/lib/gemini.ts` | LLM analysis via TrueFoundry gateway |
| `db.ts` | `web/src/lib/db.ts` | Postgres connection, `insertSignal()`, `getWatchlist()` |

## Error Handling

| Failure Mode | Behavior |
|---|---|
| EDGAR 429 / rate limit | Back off 5s, retry once, skip cycle |
| EDGAR 500 / timeout | Log warning, skip cycle, retry next 60s |
| Gemini API fails | Insert signal with fallback explanation, still send alert |
| DB connection fails | Log error, skip entire cycle, retry next 60s |
| Twilio send fails | Log error, signal still stored |
| Poller crashes | Relies on external process manager (pm2/systemd/cron) |

## Telegram Integration

**Env vars:**
```
TELEGRAM_BOT_TOKEN=           # From @BotFather
TELEGRAM_CHAT_IDS=            # Comma-separated, or query from DB/users table
```

**Flow:** Query `watchlist` table for users watching the signal's ticker. Send message via existing `telegram.ts` `sendTelegramMessage()` (plain `fetch`, no SDK needed).

**Message template:**
```
🚨 911Stock Alert

{INSIDER_NAME} ({ROLE}) at {COMPANY} ({TICKER}) just {ACTION} {SHARES} shares (${VALUE})

{LLM_CONTEXT}

Reply /stop to unsubscribe
```

## Deployment

**Local dev:** `cd web && npx tsx scripts/poller.ts`

**Production: Railway**
- Deploy as a Node service: `npx tsx scripts/poller.ts`
- Railway free tier: 500 hrs/mo, $5 credit
- Env vars configured in Railway dashboard
- No timeout limits (unlike Vercel serverless)
- **Cost:** ~$5/mo

**NOT Vercel:** Serverless cold starts + 10s timeout unsuitable for 60s polling with LLM calls.

## Dependencies

- Existing: `postgres`, `openai`, `tsx`
- New: `twilio` (Twilio Node SDK)

## Success Criteria

- Real Form 4 → real SMS on phone in < 5 minutes
- No duplicate alerts for same filing
- Graceful degradation when any single service is down
- Clean logs with `[poller]` prefix for easy monitoring
