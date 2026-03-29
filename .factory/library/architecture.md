# 911Stock Architecture

## System Overview

911Stock is a multi-tenant SaaS that monitors SEC insider trading filings and delivers personalized alerts to users. The system scores signal significance relative to each user's portfolio and delivers alerts through multiple channels with tier-based gating.

## Components

### Next.js App (App Router)
- **Pages:** Landing (/), Home (authenticated /), Dashboard (/dashboard), Feed (/feed), Settings (/settings), Resolution (/resolution)
- **API Routes:** All under /api/ — auth, signals, trading, billing, notifications
- **Auth:** Auth.js v5 with email/password + Google OAuth, JWT sessions, postgres adapter

### Database (Ghost DB — Managed Postgres)
- Single managed Postgres instance via ghost.build
- All tables have `user_id` column for multi-tenancy (foreign key to `users` table)
- Key tables: `users`, `accounts`, `sessions`, `watchlist`, `signals`, `alerts`, `trades`, `portfolio`, `agent_learnings`, `notifications`, `user_settings`

### External Services
- **Gemini AI** (`gemini-3-flash-preview`): Signal analysis, plain-English explanations
- **Bland AI**: Outbound phone calls for premium users
- **SEC EDGAR**: Real-time Form 4 filing detection
- **Alpha Vantage**: News sentiment scoring
- **Alpaca Markets**: Paper trading via OAuth (premium only)
- **Stripe**: Subscription billing (free/premium tiers)

## Data Flow

### Signal Detection Pipeline
```
EDGAR Poller (cron/manual) → Detect new Form 4 filings
  → Match against ALL users' watchlists
  → For each matching user:
    → Score signal relative to user's portfolio (position size, risk tolerance)
    → Generate AI explanation via Gemini
    → Store signal in DB (user-scoped)
    → Create notification (respecting staggered delivery: free=15min delay, premium=realtime)
    → If premium + phone enabled + score >= 7: trigger Bland AI call
```

### Trade Execution Flow
```
Signal detected → AI recommends action
  → User sees recommendation on Dashboard
  → User approves trade
  → If Alpaca connected: execute paper trade via Alpaca API
  → Store trade record in DB
  → Update portfolio positions
  → Show resolution/confirmation
```

### Billing Flow
```
New user → Free tier (default)
  → Clicks Upgrade → Stripe Checkout
  → Stripe webhook (checkout.session.completed) → Update user tier to premium
  → Premium features unlocked: realtime signals, phone calls, Alpaca trading
  → Manage via Stripe Customer Portal
  → Cancellation webhook → Downgrade to free tier
```

## Key Invariants

1. **Every DB query is scoped by user_id** — no cross-tenant data leakage
2. **All API routes require authentication** — except /api/auth/*, /api/stripe/webhook, /api/migrate
3. **Feature gating is enforced at API level** — not just UI (premium features return 403 for free users)
4. **Signal deduplication by filing ID** — same EDGAR filing never creates duplicate signals
5. **Trade idempotency** — double-approving returns existing trade, not duplicate
6. **No in-memory state** — all state in Ghost DB (serverless-compatible)

## CSS Design System
Custom CSS variables: `--ink`, `--orange`, `--terra`, `--white`, `--paper`. No component library — custom CSS with Tailwind utility classes.
