# 911Stock

> 911 for your stocks. It watches your portfolio 24/7 and calls you when something matters.

An autonomous AI agent that monitors SEC filings and insider transactions for your specific holdings. When it detects something significant, it writes a plain-English analysis, stores the signal in its own database, and **calls your phone** to explain what it means for you.

**Live demo:** [911stock.vercel.app](https://911stock.vercel.app)

---

## How It Works

```
SEC EDGAR filing detected
  → Signal scored (0–10) with news sentiment
  → Plain-English analysis generated (Gemini)
  → Signal stored in Ghost DB with historical pattern match
  → AI calls your phone (Bland AI)
  → "SMCI's CEO just sold $2.1M. Want me to reduce your position by 50%?"
  → You say "Yes" → Auth0 CIBA push notification to approve
  → Trade executes via Alpaca → Resolution confirmed
```

No dashboards to check. No notifications to swipe away. Your phone rings.

## The Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL via [Ghost](https://ghost.build) (managed Postgres for agents) |
| LLM | Google Gemini via TrueFoundry AI Gateway |
| Voice | Bland AI — outbound calls with mid-call tool use |
| Auth | Auth0 CIBA + Guardian push notifications |
| Trading | Alpaca (paper trading API) |
| SEC Data | EDGAR API (Form 4 XML parsing) + Alpha Vantage (news sentiment) |
| Agent Optimization | OverClaw (Python agent for prompt optimization) |
| Deploy | Vercel |

## Quickstart

```bash
cd web
cp .env.example .env.local  # fill in your keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
# Required
GEMINI_API_KEY=              # aistudio.google.com
BLAND_API_KEY=               # bland.ai dashboard
MY_PHONE_NUMBER=+1...       # your phone number
DATABASE_URL=                # ghost connect <id>
NEXT_PUBLIC_URL=https://...  # public URL (Vercel)

# Auth0 (WoZ fallback if not set)
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_USER_SUB=auth0|...

# Trading
ALPACA_API_KEY=
ALPACA_API_SECRET=

# Optional
ALPHA_VANTAGE_KEY=           # news sentiment (free tier)
TRUEFOUNDRY_API_KEY=         # LLM gateway
```

### Database Setup

```bash
# Install Ghost CLI
curl -fsSL https://install.ghost.build | sh

# Create a database and get connection string
ghost login
ghost create
ghost connect <id>  # copy DATABASE_URL to .env.local

# Run migrations
curl http://localhost:3000/api/migrate
```

## Architecture

```
web/
├── src/app/
│   ├── page.tsx              # Watchlist + signal feed
│   ├── dashboard/            # Live pipeline dashboard (SSE)
│   ├── resolution/           # Trade confirmation + audit trail
│   └── api/
│       ├── trigger/          # Main pipeline: detect → score → analyze → call
│       ├── signal/           # SSE stream for dashboard
│       ├── bland-webhook/    # Receives "user said yes" → initiates CIBA
│       ├── alpaca/           # Account, positions, orders
│       ├── trade/            # Trade execution with approval
│       └── migrate/          # DB schema + seed data
├── src/lib/
│   ├── edgar.ts              # SEC EDGAR Form 4 parser
│   ├── bland.ts              # Outbound AI phone calls
│   ├── gemini.ts             # Signal analysis (plain English)
│   ├── alpaca.ts             # Brokerage integration
│   ├── auth0-ciba.ts         # Backchannel auth + Guardian push
│   ├── db.ts                 # Ghost DB (Postgres) — signals, alerts, trades
│   ├── news.ts               # Alpha Vantage news sentiment
│   └── signals.ts            # Signal scoring engine (0–10)
└── src/components/
    ├── NewsTimeline.tsx       # Real news timeline with auto-trigger
    ├── GuardianEnroll.tsx     # Auth0 Guardian device enrollment
    └── ...

overclaw/
├── agents/signal_agent.py    # Python agent for deep signal analysis
└── server.py                 # HTTP server (port 8001)
```

## Sponsor Integrations

| Sponsor | Integration | Prize Track |
|---------|------------|-------------|
| **Bland AI** | Real outbound calls with mid-call tool webhook | $500 |
| **Auth0** | CIBA flow — Guardian push notification for trade approval | $1,750 |
| **Ghost DB** | Real Postgres — signals, alerts, trades, agent learnings | $1,998 + $500/member |
| **OverClaw** | Python agent + prompt optimization | $651 |
| **TrueFoundry** | AI Gateway for LLM routing + audit trail | $600 |

## Team

Built at the **Deep Agents Hackathon** (RSAC 2026) at AWS Builder Loft, San Francisco.

- **Aayush Dixit** — CEO / Product
- **Bunyasit Fang (Big)** — CTO / Backend / Infrastructure

---

*Your portfolio, watched.*
