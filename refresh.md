# 911Stock — Session Refresh

> Drop this into any new Claude Code session to get fully up to speed instantly.

---

## What This Is

**911Stock** is an insider trading alert service for retail investors. It monitors SEC Form 4 filings and delivers plain-English alerts to your phone via RCS/SMS within minutes of the filing. Built at the Deep Agents Hackathon (RSAC 2026, March 27) and now pivoting to a real product.

**Repo:** https://github.com/aayushdixit27/911stock
**Live (hackathon version):** https://911stock.vercel.app
**Team:** Aayush Dixit (CEO), Bunyasit Fang "Big" (CTO)

---

## Current Status (as of April 2, 2026)

### Pivot: Web Dashboard → RCS-First

The hackathon demo was a Next.js web dashboard with AI phone calls. We're pivoting to **RCS messaging via Twilio** as the primary product. No app install needed. 82% US reach. SMS fallback.

**Approved design doc:** `~/.gstack/projects/aayushdixit27-911stock/aayushdixit-main-design-20260401-140000.md`

### Key Decisions Made

| Decision | Detail |
|----------|--------|
| **Drop Auth0** | Too heavyweight. RCS buttons handle trade approval. |
| **Drop Telegram** | Only 9% US penetration. RCS is 82% with no app install. |
| **Drop iMessage bots** | Unofficial Apple APIs, account ban risk. |
| **Pricing: $99/year** | Front-loads cash, qualifies serious users. Stripe Checkout on own site (keep 97%). |
| **Narrowest wedge** | SEC Form 4 alerts + plain-English context via RCS. No trade execution in MVP. |
| **LLM: Gemini → Claude** | Better financial reasoning, data privacy. Config change via TrueFoundry gateway. |
| **Voice: Bland → Retell** | 22% cheaper, 33% faster, better voice quality. Later phase. |
| **Background: node-cron → Inngest** | Durable workflows with retries. Later phase. |

### Product Thesis

**911Stock is a latency product, not an information product.** The data is public (SEC EDGAR). The analysis is commoditized (LLMs). The value is delivering the right signal to the user's lock screen within minutes of the filing.

No existing competitor uses messaging as primary delivery. All 10+ products are web dashboards with email.

### ICP

Retail investors with individual stock positions, sub-$100K portfolios, who don't have institutional-grade coverage. Active traders and day traders are high-intent. NOT passive index fund holders.

---

## Architecture

### Current (Hackathon — still deployed on Vercel)

```
Next.js 16 (App Router) + React 19 + Tailwind CSS 4
├── Frontend: Watchlist, dashboard, resolution, settings, GTM page, Stack page
├── Backend: API routes (trigger, signal, analyze, call, trade, etc.)
├── Database: Ghost DB (Postgres) — signals, alerts, trades, portfolio, agent_learnings
├── Auth: Auth.js (next-auth) with email/password + Google OAuth
├── Trading: Alpaca Paper Trading API
├── Voice: Bland AI (outbound calls)
├── LLM: Gemini via TrueFoundry gateway
├── SEC Data: EDGAR API (Form 4 XML parsing) + Alpha Vantage (news sentiment)
└── Agent: Overclaw Python service (port 8001)
```

### Target (RCS Pivot)

```
EDGAR Poller (60s cron, Node.js standalone)
  → New Form 4 detected
  → Signal scoring (score >= 7 triggers alert)
  → LLM generates 2-sentence context (Gemini/Claude)
  → Store in Ghost DB
  → For each user watching this ticker:
    → Twilio RCS rich card (SMS fallback)

Landing page (Next.js on Vercel or static)
  → Phone input + ticker picker
  → Stripe Checkout ($99/year)
  → OTP verification (Twilio Verify)
```

---

## Repo Layout

```
web/
├── src/app/
│   ├── page.tsx              # Landing page (unauthenticated) / Dashboard (authenticated)
│   ├── page-client.tsx       # Client-side dashboard component
│   ├── dashboard/            # Live pipeline dashboard (SSE)
│   ├── resolution/           # Trade confirmation
│   ├── settings/             # Auth0 Guardian (being removed)
│   ├── gtm/                  # Internal: GTM strategy from judge feedback
│   ├── stack/                # Internal: Stack audit, action items, build sessions
│   ├── onboarding/           # CTO's SaaS onboarding flow
│   ├── subscribe/            # NEW: Landing page for RCS alerts (being built)
│   └── api/                  # 19+ API routes
├── src/lib/
│   ├── edgar.ts              # SEC EDGAR Form 4 parser (reusable)
│   ├── signals.ts            # Signal scoring engine 0-10 (reusable)
│   ├── gemini.ts             # LLM analysis via TrueFoundry (reusable)
│   ├── bland.ts              # Voice calls (being replaced by Retell)
│   ├── alpaca.ts             # Brokerage trading (Phase 3)
│   ├── auth0-ciba.ts         # Being removed
│   ├── auth.ts               # Auth.js v5 config
│   ├── stripe.ts             # Stripe billing (lazy-init for Vercel build)
│   ├── db.ts                 # Ghost DB schema + queries
│   └── news.ts               # Alpha Vantage news sentiment
├── src/components/
│   ├── Nav.tsx               # Navigation (CTO's SaaS version)
│   ├── NewsTimeline.tsx      # Real news timeline
│   └── GuardianEnroll.tsx    # Being removed
└── src/middleware.ts         # Auth middleware (/gtm and /stack are public)

overclaw/
├── agents/signal_agent.py    # Python agent for signal analysis
└── server.py                 # HTTP server (port 8001)
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

```bash
# Auth (Auth.js)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=                # Ghost DB (ghost.build)

# LLM
TRUEFOUNDRY_API_KEY=
GEMINI_API_KEY=

# Voice (being replaced)
BLAND_API_KEY=
MY_PHONE_NUMBER=+1...

# Trading
ALPACA_API_KEY=
ALPACA_API_SECRET=

# Payments
STRIPE_SECRET_KEY=
STRIPE_PRICE_PREMIUM=

# App
NEXT_PUBLIC_URL=https://911stock.vercel.app
ALPHA_VANTAGE_KEY=           # Optional: news sentiment
```

---

## Internal Pages (temporary, remove before public launch)

- `/gtm` — Go-to-market strategy synthesized from 27 judge conversations
- `/stack` — Stack audit, RCS pivot plan, action items, build session splits, payment comparison

Both are public (no auth required via middleware exception).

---

## What's Being Built Right Now

### 1-Hour Build Session Split

**Big (CTO):**
- Twilio RCS/SMS setup
- EDGAR → alert pipeline (standalone Node script)
- Context generation (wire Gemini)
- End-to-end test: real Form 4 → real SMS

**Aayush (CEO):**
- `/subscribe` landing page (headline, phone input, ticker picker, Stripe)
- Alert copy (RCS/SMS message templates)
- Text 10 people with alert screenshot

### Success Metrics
- Week 1: Real Form 4 → real SMS/RCS on phone < 5 min
- Week 2: Landing page live, 50 free beta users
- Week 4: First $99/year payment from a non-friend
- Month 2: 100 paying users ($9,900 ARR)

---

## Key Files to Read First

1. `DESIGN.md` — Full design system
2. `CLAUDE.md` — Project config + skill routing
3. `web/src/lib/edgar.ts` — SEC EDGAR parser (core, reusable)
4. `web/src/lib/signals.ts` — Signal scoring engine (core, reusable)
5. `web/src/app/stack/page.tsx` — Current action items and decisions
6. `web/src/app/gtm/page.tsx` — GTM strategy from judge feedback
