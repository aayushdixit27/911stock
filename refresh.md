# 911Stock — Session Refresh

> Drop this into any new Claude Code session to get fully up to speed instantly.

---

## What This Is

**911Stock** is an insider trading alert service for retail investors. It monitors SEC Form 4 filings and delivers plain-English alerts via Telegram (and later SMS). Built at the Deep Agents Hackathon (RSAC 2026, March 27) and now building toward a real product.

**Repo:** https://github.com/aayushdixit27/911stock
**Live (hackathon version):** https://911stock.vercel.app
**Telegram Bot:** @stock911_admin_bot
**Team:** Aayush Dixit (CEO), Bunyasit Fang "Big" (CTO)

---

## Current Status (as of April 13, 2026)

### Pivot History

1. **Hackathon (Mar 27):** Next.js web dashboard with AI phone calls
2. **RCS pivot (Apr 1-3):** Planned Twilio RCS/SMS as primary delivery
3. **Telegram pivot (Apr 11):** Twilio blocked by A2P 10DLC registration (~10 days). Switched to Telegram bot for instant delivery. SMS on roadmap.

### What's Working

| Component | Status | Notes |
|-----------|--------|-------|
| **Telegram bot** | ✅ Live | `/check TSLA`, `/watch`, `/unwatch`, `/watchlist`. Real SEC EDGAR data. |
| **SEC EDGAR parser** | ✅ Working | Fetches real Form 4 filings, parses XML. 8 tickers supported. |
| **Signal scoring** | ✅ Working | 0-10 scoring based on insider role, transaction size, 10b5-1 plan status. |
| **LLM analysis** | ✅ Working | Gemini via TrueFoundry generates plain-English context for score >= 5. |
| **Ghost DB** | ✅ Working | Telegram watchlists persist. Poller can query who watches what. |
| **Landing page** | ✅ Live | `/subscribe` with MARK design system, Stripe Checkout ($99/yr, 14-day trial). |
| **Stripe billing** | ✅ Test mode | Checkout, webhooks, portal all wired. Test keys on Vercel. |
| **Web dashboard** | ⚠️ Hackathon demo | 80% functional, 20% demo scaffolding. Real auth, watchlist, trading. |
| **EDGAR poller** | ❌ Not built | Big's task — standalone 60s cron, filter score >= 7, notify watchers. |
| **SMS/RCS** | ❌ Blocked | Twilio A2P 10DLC registration pending. On roadmap. |

### Key Decisions Made

| Decision | Detail | Date |
|----------|--------|------|
| **Telegram-first** | SMS blocked by A2P registration. Telegram is free, instant, no approval. | Apr 11 |
| **Keep web dashboard** | Originally planned to rip out. 80% functional, gives us a product while bot is built. | Apr 11 |
| **Drop RCS as primary** | Same registration requirements as SMS. No advantage if both blocked. | Apr 11 |
| **$99/year via Stripe** | 14-day trial. Checkout wired to /subscribe. Test mode on Vercel. | Apr 3 |
| **Drop Auth0** | Too heavyweight. Messaging handles approval. NextAuth sufficient for web. | Mar 31 |
| **MARK design system** | Editorial/magazine aesthetic. Crimson Pro + Inter + IBM Plex Mono. | Apr 2 |

### Product Thesis

**911Stock is a latency product, not an information product.** The data is public (SEC EDGAR). The analysis is commoditized (LLMs). The value is delivering the right signal to the user's lock screen within minutes of the filing.

### ICP

Retail investors with individual stock positions, sub-$100K portfolios, who don't have institutional-grade coverage. Active traders and day traders are high-intent. NOT passive index fund holders.

---

## Architecture

### Current (Apr 13)

```
Telegram Bot (bot/ — standalone Node.js process)
├── Long-polling for commands (/check, /watch, /unwatch, /watchlist)
├── SEC EDGAR Form 4 parser (real data, 8 tickers)
├── Signal scoring engine (0-10)
├── LLM analysis (Gemini via TrueFoundry, score >= 5)
└── Ghost DB (telegram_users, telegram_watchlist)

Web App (web/ — Next.js 16 on Vercel)
├── /subscribe — Landing page + Stripe Checkout ($99/yr)
├── /dashboard — Signal pipeline SSE (hackathon demo)
├── /feed — Paginated signal history
├── /settings — Notifications, Alpaca, Stripe, risk tolerance
├── /onboarding — 3-step wizard
├── /stack — Internal technical audit + roadmap
├── /gtm — Internal GTM strategy
└── API routes (19+), Auth.js, Ghost DB

Database: Ghost DB (Timescale Postgres)
├── Web tables: users, signals, alerts, trades, portfolio, watchlist, etc.
└── Telegram tables: telegram_users, telegram_watchlist
```

### Target (Next)

```
EDGAR Poller (Big building — standalone 60s cron)
  → Scan all tickers in telegram_watchlist
  → New Form 4 detected → score signal
  → If score >= 7 AND someone watches ticker:
    → LLM generates context
    → Send Telegram alert to watchers
  → If nobody watches → skip (save LLM cost)
```

---

## Repo Layout

```
bot/                              # Telegram bot (standalone)
├── bot.ts                        # Command handler + long-polling
├── edgar.ts                      # SEC EDGAR Form 4 parser
├── score.ts                      # Signal scoring engine
├── analyze.ts                    # LLM analysis (Gemini/TrueFoundry)
├── db.ts                         # Ghost DB (telegram_users, telegram_watchlist)
├── package.json                  # Standalone deps (openai, postgres, dotenv)
└── .env                          # TELEGRAM_BOT_TOKEN, DATABASE_URL, TRUEFOUNDRY_API_KEY

web/
├── src/app/
│   ├── page.tsx                  # Landing (unauth) / Dashboard (auth)
│   ├── page-client.tsx           # Client-side dashboard
│   ├── subscribe/page.tsx        # Landing page + Stripe Checkout
│   ├── dashboard/                # Signal pipeline SSE
│   ├── feed/                     # Signal feed (paginated)
│   ├── resolution/               # Trade confirmation
│   ├── settings/                 # User settings
│   ├── onboarding/               # 3-step onboarding wizard
│   ├── stack/                    # Internal: technical audit + roadmap
│   ├── gtm/                      # Internal: GTM strategy
│   └── api/                      # 19+ API routes
│       └── subscribe/route.ts    # Public Stripe Checkout (no auth)
├── src/lib/
│   ├── edgar.ts                  # SEC EDGAR parser (shared with bot)
│   ├── signals.ts                # Signal scoring (shared with bot)
│   ├── gemini.ts                 # LLM analysis (shared with bot)
│   ├── stripe.ts                 # Stripe billing (lazy-init)
│   ├── db.ts                     # Ghost DB schema + queries
│   ├── auth.ts                   # Auth.js v5 config
│   ├── alpaca.ts                 # Brokerage trading (Phase 3)
│   └── news.ts                   # Alpha Vantage news sentiment
├── src/middleware.ts              # Auth (/subscribe, /gtm, /stack are public)
└── docs/
    └── alert-templates.md        # RCS/SMS/Telegram message templates

DESIGN.md                         # MARK design system spec
CLAUDE.md                         # Project config + skill routing
```

---

## Design System (MARK)

Formalized in `DESIGN.md` at repo root.

| Role | Font | Usage |
|------|------|-------|
| Display | Crimson Pro (italic, 500) | Headlines, titles |
| Body | Inter (400-600) | Body copy, UI text |
| Data | IBM Plex Mono (400-600) | Tickers, prices, labels, badges |

| Color | Hex | Usage |
|-------|-----|-------|
| Paper | #fafaf9 | Page background |
| Ink | #1a1a18 | Primary text, dark buttons |
| Orange | #ea4c00 | CTA, accent, urgency (used sparingly) |
| Terra | #c45c2e | Secondary actions |
| Ember | #dc2626 | Alert dots, danger |

Aesthetic: Editorial/magazine. Restrained color (one accent). Aggressive simplicity.

---

## Environment Variables

### Bot (bot/.env)
```bash
TELEGRAM_BOT_TOKEN=              # From @BotFather
DATABASE_URL=                    # Ghost DB (ghost.build)
TRUEFOUNDRY_API_KEY=             # For Gemini LLM analysis
```

### Web (web/.env.local)
```bash
# Auth (Auth.js)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=                    # Ghost DB (ghost.build)

# LLM
TRUEFOUNDRY_API_KEY=

# Payments
STRIPE_SECRET_KEY=               # Test mode
STRIPE_PRICE_PREMIUM=            # price_1TI0sTQs4Wh8rf4Y7b6JFVAw

# Trading (Phase 3)
ALPACA_API_KEY=
ALPACA_API_SECRET=

# App
NEXT_PUBLIC_URL=https://911stock.vercel.app
```

---

## What's Being Built Right Now

### Task Split

**Big (CTO) — Server/Pipeline:**
1. Build EDGAR poller — standalone 60s cron, query `telegram_watchlist` for tickers
2. Expand CIK map beyond 8 tickers — dynamic lookup or DB table
3. Wire Gemini for context generation on high-score signals
4. Deploy poller as separate process
5. Send Telegram alerts via bot token to watchers (`getWatchersForTicker()` in bot/db.ts)

**Aayush (CEO) — Bot/Product (Done):**
1. ✅ Telegram bot with /check, /watch, /unwatch, /watchlist commands
2. ✅ Watchlists persisted to Ghost DB
3. ✅ EDGAR parser fixed (SMCI CIK, XSLT XML prefix)
4. ✅ /subscribe landing page with Stripe Checkout
5. ✅ Alert message templates (docs/alert-templates.md)

### Next Up
- Deploy bot to Railway/Fly.io for 24/7 uptime (currently runs on local machine)
- Big completes EDGAR poller → connects to bot for automated alerts
- End-to-end test: real Form 4 → real Telegram alert on phone

### Success Metrics
- Week 1: Real Form 4 → real Telegram alert on phone
- Week 2: Landing page live, 50 free beta users
- Week 4: First $99/year payment from a non-friend
- Month 2: 100 paying users ($9,900 ARR)

---

## Key Files to Read First

1. `DESIGN.md` — Full design system
2. `CLAUDE.md` — Project config + skill routing
3. `bot/bot.ts` — Telegram bot (command handler)
4. `bot/edgar.ts` — SEC EDGAR parser (fixed, 8 tickers)
5. `bot/db.ts` — Ghost DB queries for Telegram (watchlists, watchers)
6. `web/src/app/stack/page.tsx` — Technical audit + roadmap
7. `web/src/app/subscribe/page.tsx` — Landing page with Stripe
8. `docs/alert-templates.md` — Message templates for alerts

---

## Bugs Fixed This Session

1. **SMCI CIK wrong** — Was `0001096343` (Markel Group), fixed to `0001375365` (Super Micro Computer)
2. **EDGAR XML fetch returning HTML** — `primaryDocument` includes XSLT prefix (`xslF345X05/file.xml`), stripped to get raw XML
3. **Telegram bot token** — Original copy had `0` instead of `O` in token string
