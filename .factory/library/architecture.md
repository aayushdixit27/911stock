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

#### Table Schemas

**watchlist** — User's tracked tickers
```sql
CREATE TABLE watchlist (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  ticker TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ticker)
);
-- Index on user_id for fast lookups
```

**notifications** — In-app notifications with staggered delivery
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  signal_id TEXT REFERENCES signals(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  deliver_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Index on (user_id, read, deliver_at) for efficient unread/delivered queries
```

**user_settings** — User preferences and risk tolerance
```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  risk_tolerance TEXT DEFAULT 'moderate',
  notify_in_app BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT false,
  notify_phone BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**signals** — Includes `edgar_filing_id` for deduplication
```sql
-- UNIQUE constraint on (user_id, edgar_filing_id) prevents duplicate signals
-- from the same EDGAR filing for the same user
```

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

## API Routes

### Watchlist
- `GET /api/watchlist` — Returns user's watchlist tickers
- `POST /api/watchlist` — Add ticker (validates 1-5 uppercase letters, prevents duplicates with 409, max 50 tickers)
- `DELETE /api/watchlist/[ticker]` — Remove ticker

### Notifications
- `GET /api/notifications` — Returns delivered notifications (deliver_at <= now()) for authenticated user
- `PATCH /api/notifications/[id]` — Mark notification as read
- `GET /api/notifications/unread-count` — Count of unread delivered notifications

### Feed & Signals
- `GET /api/feed?page=1&limit=20` — Paginated signal feed for user
- `GET /api/feed?id=<signal_id>` — Single signal detail view
- `POST /api/trigger` — Run signal detection pipeline for user's watchlist
- `GET /api/signal` — SSE stream for real-time signal updates (scoped to user)

## Design Patterns

### Multi-tenancy via user_id Scoping
Every database query filters by the authenticated user's ID:
```typescript
// Pattern: Always pass userId to query functions
const signals = await getRecentSignals(session.user.id, limit);
// SQL: WHERE user_id = $1
```
This applies to all tables: signals, watchlist, notifications, trades, portfolio, alerts, etc.

### Signal Deduplication
Uses `edgar_filing_id` with unique constraint:
```sql
UNIQUE(user_id, edgar_filing_id)
```
Combined with `ON CONFLICT DO NOTHING` in INSERT queries, this ensures the same EDGAR filing never creates duplicate signals for a user.

### Staggered Delivery via deliver_at
Notifications use a `deliver_at` timestamp instead of immediate delivery:
```typescript
// Premium users: deliver_at = now()
// Free users: deliver_at = now() + 15 minutes
const deliverAt = userTier === 'premium' ? new Date() : new Date(Date.now() + 15 * 60 * 1000);
```
The notification API only returns notifications where `deliver_at <= now()`, enabling time-based feature gating without background jobs.

### Ticker Format Validation
Ticker symbols must match `/^[A-Z]{1,5}$/` (1-5 uppercase letters). This pattern is enforced in both API routes and frontend validation.

### Notification Polling
The Nav component polls `/api/notifications/unread-count` every 30 seconds to keep the notification badge updated.

1. **Every DB query is scoped by user_id** — no cross-tenant data leakage
2. **All API routes require authentication** — except /api/auth/*, /api/stripe/webhook, /api/migrate
3. **Feature gating is enforced at API level** — not just UI (premium features return 403 for free users)
4. **Signal deduplication by filing ID** — same EDGAR filing never creates duplicate signals
5. **Trade idempotency** — double-approving returns existing trade, not duplicate
6. **No in-memory state** — all state in Ghost DB (serverless-compatible)

## CSS Design System
Custom CSS variables: `--ink`, `--orange`, `--terra`, `--white`, `--paper`. No component library — custom CSS with Tailwind utility classes.
