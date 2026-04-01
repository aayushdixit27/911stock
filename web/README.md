# 911Stock

AI-powered insider trading alerts for stocks you own or watch.

911Stock is a SaaS product that monitors SEC Form 4 insider filings, scores their significance with AI, and helps investors decide what to do next. It started as a hackathon build and has evolved into a production-minded application with authentication, billing, notifications, paper trading, and accuracy tracking.

## Features

- Auth.js v5 authentication with email/password and optional Google OAuth
- Multi-tenant architecture with all user data scoped per account
- Personal watchlist management with a 50-ticker limit
- SEC EDGAR Form 4 monitoring for insider buy/sell activity
- AI signal scoring powered by Gemini, personalized to portfolio size and risk tolerance
- In-app notifications, email alerts, and premium phone call alerts
- Tier-based delivery: 15-minute delayed alerts for free users, real-time for premium users
- Alpaca paper trading integration via OAuth for premium accounts
- Trade execution flow from signal to AI recommendation to user approval to paper trade
- Stripe-powered Free and Premium subscriptions
- Signal accuracy tracking and a public accuracy dashboard
- Onboarding wizard for new users

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Ghost DB (managed Postgres via ghost.build)
- Auth.js v5
- Google Gemini (`gemini-3-flash-preview`)
- Bland AI
- Alpaca Markets paper trading API
- Stripe
- Tailwind CSS and a custom CSS design system

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Ghost DB Postgres instance
- API credentials for Gemini, Stripe, Bland AI, and Alpaca

### Installation

```bash
cd web
npm install
```

### Environment Variables

Create `web/.env.local` and set:

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

GEMINI_API_KEY=

BLAND_API_KEY=
MY_PHONE_NUMBER=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PREMIUM=

ALPACA_CLIENT_ID=
ALPACA_CLIENT_SECRET=

# Optional Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Run Locally

```bash
cd web
npm run dev
```

Open `http://localhost:3000`, then initialize the database schema:

```bash
# Visit in your browser
http://localhost:3000/api/migrate
```

## Architecture Overview

911Stock is a Next.js App Router application with server routes handling auth, watchlists, signal generation, notifications, billing, onboarding, and trade execution. Ghost DB stores multi-tenant application data such as users, watchlists, signals, notifications, subscriptions, Alpaca connections, trades, and signal outcomes. The signal pipeline fetches SEC EDGAR filings, enriches them with historical context and news sentiment, scores them with Gemini, then delivers alerts based on each user’s tier and preferences.

## API Routes

Core routes are organized under `src/app/api`:

| Route | Purpose |
| --- | --- |
| `/api/auth/[...nextauth]` | Auth.js session and OAuth handlers |
| `/api/auth/register` | Email/password account creation |
| `/api/migrate` | Creates or updates the Postgres schema |
| `/api/watchlist` | List and add watchlist tickers |
| `/api/watchlist/[ticker]` | Remove a ticker from the watchlist |
| `/api/feed` | Fetch personalized signal feed |
| `/api/trigger` | Run the insider signal detection pipeline |
| `/api/notifications` | Fetch delivered notifications |
| `/api/notifications/unread-count` | Notification badge count |
| `/api/user/onboarding` | Save onboarding progress and completion |
| `/api/user/settings` | Read and update user preferences |
| `/api/stripe/checkout` | Start premium checkout |
| `/api/stripe/portal` | Open Stripe billing portal |
| `/api/stripe/webhook` | Process subscription events |
| `/api/alpaca/auth` | Start Alpaca OAuth connection |
| `/api/alpaca/callback` | Complete Alpaca OAuth |
| `/api/execute-trade` | Execute a premium paper trade |
| `/api/accuracy` | Public accuracy dashboard data |

## Tiers

| Feature | Free | Premium |
| --- | --- | --- |
| Watchlist | Up to 50 tickers | Up to 50 tickers |
| SEC insider signal detection | Yes | Yes |
| Signal delivery speed | 15-minute delay | Real-time |
| In-app notifications | Yes | Yes |
| Email notifications | Yes | Yes |
| Phone call alerts | No | Yes |
| Alpaca paper trading | No | Yes |
| Trade execution flow | No | Yes |
| Accuracy dashboard | Yes | Yes |
