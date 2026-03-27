# 911Stock — Build Plan (LIVE)

> "911 for your stocks. It watches your portfolio 24/7 and calls you when something matters."

**Team:** 2 people (Person A: Product/UX, Person B: CTO/Backend)
**Deadline:** Mar 27, 2026 @ 4:30pm PDT
**Stack:** Next.js 16 (App Router) + TypeScript + custom CSS design system
**Repo:** https://github.com/aayushdixit27/911stock

---

## Current Status

### ✅ DONE — Backend

| File                         | What it does                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `src/lib/gemini.ts`          | Gemini `gemini-3-flash-preview` — signal analysis → plain English                 |
| `src/lib/bland.ts`           | Bland outbound calls. Tool fires webhook when user says yes. HTTPS-only tool URL. |
| `src/lib/edgar.ts`           | SEC EDGAR poller — Form 4 filings for SMCI/TSLA/NVDA, XML parsing, rate limiting  |
| `src/lib/news.ts`            | Alpha Vantage news sentiment — score bonus for negative news                      |
| `src/lib/signals.ts`         | Signal scoring engine (0–10). Reads pre-seeded JSON for demo mode.                |
| `src/lib/state.ts`           | In-memory last signal — shared between trigger and SSE routes                     |
| `src/lib/auth0-ciba.ts`      | Direct Auth0 backchannel auth (`/bc-authorize` + poll `/oauth/token`)             |
| `src/lib/db.ts`              | Ghost DB (Postgres via ghost.build) — signals, alerts tables + seed               |
| `src/app/api/trigger/`       | Main pipeline: demo mode (pre-seeded) or `?mode=live` (real EDGAR)                |
| `src/app/api/signal/`        | SSE stream — live pipeline status to dashboard                                    |
| `src/app/api/analyze/`       | Gemini analysis endpoint                                                          |
| `src/app/api/call/`          | Bland outbound call trigger                                                       |
| `src/app/api/bland-webhook/` | Receives "user said yes" from Bland → initiates Auth0 CIBA                        |
| `src/app/api/ciba-status/`   | Polls Auth0 until Guardian approved — dashboard polls this                        |
| `src/app/api/approve/`       | Manual approval fallback (WoZ if Auth0 not configured)                            |
| `src/app/api/poll/`          | Autonomous agent loop: EDGAR → news → score → DB → Bland                          |
| `src/app/api/feed/`          | Signal history from Ghost DB (falls back to seed data)                            |
| `src/app/api/migrate/`       | Creates DB tables + seeds SMCI signal — run once on deploy                        |
| `src/app/api/overmind/`      | Overmind trace logging (stub)                                                     |

### ✅ DONE — Frontend (3 screens)

| Screen                  | Route         | Status                                                                |
| ----------------------- | ------------- | --------------------------------------------------------------------- |
| Watchlist + Signal Feed | `/`           | ✅ Done — watchlist, signal feed, add/remove tickers, call AI button  |
| Live Pipeline Dashboard | `/dashboard`  | ✅ Done — SSE stream, step indicators, analysis card, CIBA approval   |
| Resolution              | `/resolution` | ✅ Done — trade details, Overmind trace, Ghost DB status, call button |
| Alert Feed              | `/feed`       | ✅ Done — reads from Ghost DB, seed fallback                          |

### ✅ DONE — Optimization

| Tool     | What was done                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| OverClaw | Python agent + test dataset + policies.md created. Run `overclaw optimize 911stock` to improve Gemini prompts. |

---

## Tech Stack (Actual)

| Layer              | Technology                         | Notes                                                                 |
| ------------------ | ---------------------------------- | --------------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router)            | App lives under `web/`                                                |
| Language           | TypeScript                         | Strict mode                                                           |
| Styling            | Custom CSS design system           | CSS vars: `--ink`, `--orange`, `--terra`, `--white`, `--paper`        |
| LLM                | Gemini `gemini-3-flash-preview`    | Via `@google/generative-ai`                                           |
| Voice              | Bland AI                           | Outbound only. Tool webhook requires HTTPS (deploy first).            |
| Auth               | Auth0 CIBA                         | Direct `/bc-authorize` + Guardian push. WoZ fallback built in.        |
| Database           | Ghost DB (ghost.build)             | Standard Postgres. `DATABASE_URL` in env.                             |
| Agent optimization | OverClaw                           | Local CLI. Run before demo to show optimized prompts.                 |
| Deploy             | Vercel                             | Required for Bland webhook to work end-to-end                         |

### Repo layout (`web/`)

```
web/
├── src/app/
│   ├── page.tsx, layout.tsx
│   ├── dashboard/page.tsx, resolution/page.tsx, feed/page.tsx
│   └── api/
│       ├── trigger/, signal/, analyze/, call/, bland-webhook/
│       ├── ciba-status/, approve/, migrate/, feed/, poll/
│       └── portfolio/, execute-trade/, overmind/
├── src/lib/          # gemini, bland, db, edgar, news, signals, auth0-ciba, state, …
└── src/components/   # WatchlistCard, StatusStep, PhoneRinging, …
```

---

## Full Flow

```
[Call AI button] → POST /api/trigger
  → detectSignal() (demo: pre-seeded SMCI) or fetchLatestSignal() (live: EDGAR)
  → fetchNewsSentiment(ticker)         ← Alpha Vantage
  → scoreSignal(signal, news)          ← 0–10 score
  → analyzeSignal(signal, pattern)     ← Gemini plain-English
  → insertSignal(dbSignal)             ← Ghost DB
  → makeOutboundCall(phone, explanation, signal)   ← Bland calls user

[Dashboard SSE] ← GET /api/signal
  → streams steps as trigger runs

[Bland call]
  User says "yes" → Bland fires tool → POST /api/bland-webhook
  → initiateCIBA(userId, "Approve: reduce SMCI by 50%")  ← Auth0 Guardian push
  → Dashboard polls GET /api/ciba-status every 3s
  → User taps Approve in Guardian app
  → Dashboard detects approved → redirect to /resolution
```

---

## Environment Variables

```bash
# Required for demo to work
GEMINI_API_KEY=          # aistudio.google.com → Get API key
BLAND_API_KEY=           # bland.ai → Dashboard → API Keys
MY_PHONE_NUMBER=+1...    # YOUR phone number — rings during demo
DATABASE_URL=            # Ghost DB → ghost connect <id>
NEXT_PUBLIC_URL=https:// # Public URL after deploy (Vercel) — required for Bland webhook

# Required for real Auth0 CIBA (WoZ if not set)
AUTH0_DOMAIN=xxx.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_USER_SUB=auth0|... # Your Auth0 user_id (find in Users dashboard)
AUTH0_AUDIENCE=911stock-api

# Optional
ALPHA_VANTAGE_KEY=       # Free tier — 25 calls/day news sentiment
```

---

## Sponsor Integration Summary

| Sponsor      | Integration                                                                                              | Prize Track          |
| ------------ | -------------------------------------------------------------------------------------------------------- | -------------------- |
| **Bland AI** | Real outbound call. Bland tool fires webhook when user says yes.                                         | $500 + $1k credits   |
| **Auth0**    | Real CIBA flow — Guardian push notification, user taps approve. WoZ fallback built in.                   | $1,750               |
| **Ghost DB** | Real Postgres — signals table, alerts table, seeded historical data. Agent reads + writes on every call. | $1,998 ($500/member) |
| **OverClaw** | Python agent + test dataset. Run `overclaw optimize 911stock` to show optimized prompts in demo.         | $651                 |
| **Airbyte**  | Narrative — "Airbyte would sync multiple data sources in production." Demo uses direct EDGAR API.        | mention              |

**Total potential: ~$4,899+**

---

## What Remains Before 4:30pm

### Critical (must do)

- [ ] **Deploy to Vercel** — `vercel deploy`. Required for Bland tool webhook to fire. Set `NEXT_PUBLIC_URL`.
- [ ] **Run DB migrate** — `POST /api/migrate` on production URL after deploy.
- [ ] **End-to-end smoke test** on deployed URL — button → dashboard → phone rings → CIBA → resolution.

### High value (do if time)

- [ ] **Run OverClaw** — `cd overclaw && overclaw init && overclaw optimize 911stock`. Show `report.md` score improvement in demo.
- [ ] **Auth0 CIBA setup** — Guardian app on phone, enroll account, set `AUTH0_USER_SUB`. Currently WoZ fallback.
- [ ] **Backup demo video** — record one clean run locally in case live demo has connectivity issues.

### Nice to have

- [ ] Overmind real integration (currently stub endpoint)
- [ ] Alpha Vantage key for news sentiment layer

---

## Demo Script (3 min)

```
0:00–0:20  PROBLEM
  "I own SMCI, Tesla, and NVIDIA. Insider transactions and SEC filings
  happen 24/7. By the time I see it on CNBC, the move is done.
  What if an AI agent watched my portfolio and called me the moment
  something actually matters?"

0:20–0:40  SOLUTION
  [Show watchlist screen — SMCI signal feed visible]
  "This is 911Stock. The agent has already detected something.
  SMCI's CEO sold $2.1 million in stock. Let me trigger it."
  [Press the call AI button]

0:40–1:40  AUTONOMY
  [Dashboard streams live]
  "It's scanning... found the signal. Now it's querying Ghost DB
  for historical patterns — 3 matches, average 12% drop over 30 days.
  Scoring the significance. Generating the explanation. All autonomous.
  I haven't touched anything."
  [Phone rings]
  "There it is."

1:40–2:10  HERO MOMENT
  [Pick up on speaker]
  AI: "Hey, this is 911Stock. SMCI's CEO just sold $2.1M — first sale
  in 14 months, outside his scheduled plan. Last 3 times this happened,
  the stock dropped 12% on average. Want me to reduce your position by 50%?"
  [Say yes]
  [Dashboard shows: Auth0 Guardian push sent]
  [Tap approve on phone]
  [Resolution screen loads]

2:10–2:40  DEPTH
  [Show resolution screen]
  "Four sponsor tools: Bland AI made the call. Auth0 CIBA required
  my approval — the agent cannot act without it. Ghost DB stored the signal,
  the pattern match, and what the agent learned. And OverClaw
  optimized the Gemini prompt that generated that explanation —
  here's the before/after score."
  [Show overclaw report.md]

2:40–3:00  CLOSE
  "Nothing else watches your specific holdings, calls your phone,
  and explains what an insider sale means for you — in plain English.
  911Stock. Your portfolio, watched."
```

---

## Failover Protocol

| What breaks                            | Fallback                                                  |
| -------------------------------------- | --------------------------------------------------------- |
| Phone doesn't ring                     | Play backup recording from laptop speaker                 |
| Bland webhook doesn't fire (localhost) | Show WoZ approval button — CIBA still works               |
| Auth0 CIBA not set up                  | Auto-approves via WoZ fallback — shows Auth0 logo         |
| Ghost DB connection fails              | Seed fallback in feed route — demo still runs             |
| OverClaw didn't run                    | Show the policies.md + test dataset — explain the concept |
| Live EDGAR has no signal               | Demo mode (pre-seeded SMCI) always works                  |

**Never cut:** outbound phone call, plain-English explanation, Ghost DB writes.

---

## Devpost Checklist

- [ ] 3-min demo recording
- [ ] Public GitHub repo
- [ ] Publish skill to shipables.dev
- [ ] List all sponsor tools with descriptions
- [ ] Write project description (copy from demo script)
