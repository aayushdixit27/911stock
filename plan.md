# 911Stock — Build Plan

> "911 for your stocks. It watches your portfolio 24/7 and calls you when something matters."

**Team:** 2 people (Person A: Product/UX, Person B: CTO/Backend)
**Time:** 3.5 hours remaining
**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS
**Repo:** https://github.com/aayushdixit27/911stock

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Frontend + API routes in one project. AI codes it fastest. |
| Language | TypeScript | Type safety, better AI completions |
| Styling | Tailwind CSS | Fastest styling for hackathon. No CSS files. |
| LLM | Claude (Anthropic API) | Signal analysis + plain-English generation |
| Voice | Bland AI | Outbound calls (hero moment) + inbound calls (judge interaction) |
| Auth | Auth0 (CIBA flow) | Agent asks user approval before executing trades |
| Database | Ghost (ghost.build) | Agent's own Postgres DB — watchlists, signals, patterns, learnings |
| Deploy | Vercel (or localhost for demo) | One-command deploy |

### Key Change: Ghost DB replaces both Aerospike AND Ghost CMS

Ghost (ghost.build) is a managed Postgres platform built for AI agents. Instead of:
- ~~Aerospike WoZ (JSON files for historical patterns)~~ → Ghost DB tables
- ~~Ghost CMS WoZ (static HTML for alert feed)~~ → Ghost DB storing alert history, queryable

**Why this is better:**
- One real sponsor integration instead of two fake ones
- Ghost prize ($1,998 + $500/member) is the single biggest cash prize
- Agent managing its own database is the strongest "context engineering" signal
- Fork-before-risky-ops shows the judges the agent is self-aware about safety
- Fewer integrations to wire = more time to polish the demo

**Ghost setup (5 min):**
```bash
curl -fsSL https://install.ghost.build | sh
ghost login
ghost create   # → returns DB ID + connection string
ghost mcp install  # → MCP tools available to Claude Code
```

---

## Project Structure

```
911stock/
├── app/
│   ├── layout.tsx              # Root layout with 911Stock branding
│   ├── page.tsx                # Landing / Watchlist screen (Screen 1)
│   ├── dashboard/
│   │   └── page.tsx            # Live ticker dashboard (Screen 2)
│   ├── resolution/
│   │   └── page.tsx            # Position closed screen (Screen 3)
│   └── api/
│       ├── trigger/
│       │   └── route.ts        # POST: triggers the full agent pipeline
│       ├── signal/
│       │   └── route.ts        # GET: SSE stream for dashboard status updates
│       ├── analyze/
│       │   └── route.ts        # POST: Claude analyzes signal, returns plain-English
│       ├── call/
│       │   └── route.ts        # POST: triggers Bland outbound call
│       ├── inbound-context/
│       │   └── route.ts        # GET: serves watchlist context for Bland inbound agent
│       └── approve/
│           └── route.ts        # POST: Auth0 CIBA approval endpoint
├── lib/
│   ├── bland.ts                # Bland AI client (outbound + inbound setup)
│   ├── claude.ts               # Anthropic client for signal analysis
│   ├── auth0-ciba.ts           # Auth0 CIBA flow helpers
│   ├── ghost-db.ts             # Ghost DB client (pg connection, queries)
│   └── signals.ts              # Signal detection logic + scoring
├── data/
│   └── seed.sql                # SQL to seed Ghost DB with watchlist + historical patterns
├── components/
│   ├── WatchlistCard.tsx       # Stock card with ticker, price, status
│   ├── SignalFeed.tsx          # Streaming signal detection feed
│   ├── StatusStep.tsx          # Dashboard step indicator (detecting → scoring → calling)
│   ├── ResolutionCard.tsx      # Position closed summary card
│   └── PhoneRinging.tsx        # Visual "phone is ringing" animation
├── .env.local                  # API keys (DO NOT COMMIT)
├── .env.example                # Template for required env vars
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Ghost DB Schema

```sql
-- seed.sql — run via: ghost sql <id> "$(cat data/seed.sql)"

-- User watchlists
CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  tickers TEXT[] NOT NULL,
  sensitivity TEXT DEFAULT 'major_events_only',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO watchlists (user_name, phone, tickers) VALUES
  ('Demo User', '+1XXXXXXXXXX', ARRAY['SMCI', 'TSLA', 'NVDA']);

-- Historical insider patterns (replaces Aerospike/JSON)
CREATE TABLE historical_patterns (
  id SERIAL PRIMARY KEY,
  ticker TEXT NOT NULL,
  event_type TEXT NOT NULL,
  insider_role TEXT,
  event_date DATE,
  subsequent_30d_drop_pct FLOAT,
  confidence TEXT DEFAULT 'medium'
);

INSERT INTO historical_patterns (ticker, event_type, insider_role, event_date, subsequent_30d_drop_pct, confidence) VALUES
  ('SMCI', 'unscheduled_insider_sell', 'CFO', '2025-08-12', 15.2, 'high'),
  ('SMCI', 'unscheduled_insider_sell', 'CEO', '2024-11-03', 9.1, 'high'),
  ('SMCI', 'unscheduled_insider_sell', 'VP Sales', '2024-03-22', 11.8, 'high'),
  ('NVDA', 'unscheduled_insider_sell', 'CFO', '2025-06-15', 8.7, 'medium');

-- Signals detected by the agent
CREATE TABLE signals (
  id SERIAL PRIMARY KEY,
  ticker TEXT NOT NULL,
  insider TEXT NOT NULL,
  role TEXT,
  action TEXT NOT NULL,
  shares INT,
  price_per_share FLOAT,
  total_value FLOAT,
  signal_date DATE,
  filed_at TIMESTAMPTZ,
  scheduled_10b5_1 BOOLEAN DEFAULT FALSE,
  last_transaction_months_ago INT,
  position_reduced_pct FLOAT,
  significance_score FLOAT,
  plain_english TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent's learning log (self-improvement)
CREATE TABLE agent_learnings (
  id SERIAL PRIMARY KEY,
  signal_id INT REFERENCES signals(id),
  pattern_match_count INT,
  avg_historical_drop FLOAT,
  action_taken TEXT,
  user_approved BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert history (replaces Ghost CMS feed)
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  signal_id INT REFERENCES signals(id),
  user_name TEXT,
  alert_type TEXT, -- 'call', 'push', 'feed'
  plain_english TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Pre-loaded Signal Data (SMCI March 19 Event)

Instead of JSON files, this is seeded into Ghost DB via the signals table above. The agent pipeline:
1. Detects signal (from yfinance/Finnhub or pre-seeded in Ghost DB)
2. Queries `historical_patterns` table: "What happened last time SMCI insiders sold?"
3. Gets back 3 matches with avg 12% 30-day drop
4. Sends to Claude for plain-English generation
5. Stores the result in `signals` table + `agent_learnings` table
6. Triggers Bland call + stores in `alerts` table

---

## Agent Pipeline (What Happens When You Press the Button)

```
[Button Press on Watchlist Page]
        │
        ▼
POST /api/trigger
        │
        ├──▶ Query Ghost DB: SELECT * FROM watchlists WHERE user_name = 'Demo User'
        │
        ├──▶ Signal Detection: check for new insider transactions
        │    (yfinance/Finnhub OR pre-seeded in Ghost DB signals table)
        │    "SMCI insider sale detected. User owns SMCI."
        │
        ├──▶ SSE stream to /dashboard (status updates)
        │    → "Scanning SEC filings..."
        │    → "Signal detected: SMCI CEO sold $2.1M"
        │    → "Querying historical patterns in Ghost DB..."
        │    → "3 matches found. Avg 30-day drop: 12%"
        │    → "Scoring significance: HIGH"
        │    → "Generating plain-English explanation..."
        │
        ├──▶ Ghost DB: SELECT * FROM historical_patterns
        │    WHERE ticker = 'SMCI' AND event_type = 'unscheduled_insider_sell'
        │    → Returns 3 past events, avg 12% drop
        │
        ├──▶ POST /api/analyze (Claude)
        │    Input: signal + historical patterns from Ghost DB
        │    Output: plain-English explanation
        │    → "SMCI's CEO just sold $2.1M in stock — his first
        │       sale in 14 months, outside his scheduled plan.
        │       The last 3 times SMCI insiders did unscheduled
        │       sales, the stock dropped an average of 12% over
        │       30 days. You own SMCI. This is worth watching."
        │
        ├──▶ Ghost DB: INSERT INTO signals (...) + INSERT INTO agent_learnings (...)
        │    Agent stores its analysis + learning for future reference
        │
        ├──▶ POST /api/call (Bland outbound)
        │    Phone rings. AI reads the explanation.
        │    "Want me to reduce your SMCI position by 50%?"
        │    User says "Yes."
        │
        ├──▶ POST /api/approve (Auth0 CIBA)
        │    → Approval request sent → User confirms
        │    → Trade authorized
        │
        ├──▶ Ghost DB: INSERT INTO alerts (...) + UPDATE agent_learnings
        │    Agent records the alert delivery + user's decision
        │
        └──▶ Redirect to /resolution
             → "SMCI position reduced by 50%."
             → "Based on 3 similar events, estimated savings: ~12%"
             → "911Stock is still watching your other stocks."
```

---

## The 3 Screens

### Screen 1: Watchlist (Landing Page) — `/`
```
┌─────────────────────────────────────────────┐
│  🚨 911Stock                                │
│  Your portfolio, watched.                    │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  SMCI   │ │  TSLA   │ │  NVDA   │       │
│  │ $42.50  │ │ $285.20 │ │ $142.80 │       │
│  │ ▼ 3.2%  │ │ ▲ 0.8%  │ │ — 0.1%  │       │
│  │ Watching │ │ Watching │ │ Watching │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                              │
│  [ 🔴 TRIGGER AGENT — Scan for signals ]    │
│                                              │
│  Phone: +1 (XXX) XXX-XXXX                   │
│  Alert level: Major events only              │
└─────────────────────────────────────────────┘
```

### Screen 2: Live Dashboard — `/dashboard`
```
┌─────────────────────────────────────────────┐
│  🚨 911Stock — Agent Active                 │
│                                              │
│  ✅ Scanning SEC filings...          [done]  │
│  ✅ Signal: SMCI CEO sold $2.1M     [done]  │
│  ✅ Querying Ghost DB: 3 matches    [done]  │
│  ✅ Significance: HIGH              [done]  │
│  ✅ Plain-English explanation ready  [done]  │
│  🔄 Calling your phone...          [live]  │
│  ⏳ Awaiting trade approval         [next]  │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ "SMCI's CEO just sold $2.1M in     │    │
│  │  stock — his first sale in 14       │    │
│  │  months, outside his scheduled      │    │
│  │  plan. The last 3 times SMCI        │    │
│  │  insiders did this, the stock       │    │
│  │  dropped an average of 12%..."      │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  📞 Phone ringing...                        │
│  [animated pulse]                            │
└─────────────────────────────────────────────┘
```

### Screen 3: Resolution — `/resolution`
```
┌─────────────────────────────────────────────┐
│  🚨 911Stock — Action Taken                 │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  ✅ SMCI position reduced by 50%    │    │
│  │                                     │    │
│  │  Trigger: CEO sold $2.1M (Mar 19)   │    │
│  │  Pattern: 3 similar events avg -12% │    │
│  │  Action: Sold 500 shares @ $42.50   │    │
│  │  Approval: Auth0 CIBA ✓             │    │
│  │                                     │    │
│  │  Estimated savings: ~$2,550         │    │
│  │  (based on historical 12% decline)  │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  Ghost DB: signal stored, learning logged ✓  │
│  Agent memory: pattern + outcome saved       │
│                                              │
│  Still watching: TSLA, NVDA (no signals)     │
│                                              │
│  [ Call 911Stock: (XXX) XXX-XXXX ]          │
│  "Ask the agent anything about your stocks"  │
└─────────────────────────────────────────────┘
```

---

## Build Chunks — Person A (Product/UX)

### Chunk A1: Project Setup (15 min)
- [ ] `npx create-next-app@latest 911stock --typescript --tailwind --app --src-dir=false`
- [ ] Set up project structure (folders above)
- [ ] Create `data/seed.sql` with Ghost DB schema
- [ ] Create `.env.example` with required vars
- [ ] Push to GitHub

### Chunk A2: Watchlist Screen (30 min)
- [ ] Build `app/page.tsx` — landing page with watchlist cards
- [ ] Build `components/WatchlistCard.tsx` — stock ticker, price, status badge
- [ ] Big red "TRIGGER AGENT" button
- [ ] Phone number display
- [ ] 911Stock branding (red + black theme, alarm aesthetic)
- [ ] Button click → POST /api/trigger → redirect to /dashboard

### Chunk A3: Live Dashboard Screen (30 min)
- [ ] Build `app/dashboard/page.tsx` — streaming status feed
- [ ] Build `components/StatusStep.tsx` — step with icon (pending/active/done)
- [ ] Build `components/SignalFeed.tsx` — SSE listener, renders steps
- [ ] Build `components/PhoneRinging.tsx` — animated phone pulse when call active
- [ ] Plain-English explanation card (rendered from SSE data)
- [ ] Connect to SSE endpoint `/api/signal` for real-time updates

### Chunk A4: Resolution Screen (20 min)
- [ ] Build `app/resolution/page.tsx` — position closed summary
- [ ] Build `components/ResolutionCard.tsx` — trade details, savings estimate
- [ ] Ghost DB status line ("signal stored, learning logged")
- [ ] "Call 911Stock" section with inbound phone number
- [ ] "Still watching: TSLA, NVDA" section

### Chunk A5: Auth0 CIBA UX (20 min)
- [ ] Add approval step to dashboard flow
- [ ] "Agent is requesting trade approval..." UI state
- [ ] "Approved via Auth0 CIBA ✓" confirmation
- [ ] Wire to /api/approve endpoint (or WoZ if backend not ready)

### Chunk A6: Polish + Demo Prep (30 min)
- [ ] Responsive check (looks good on projected screen)
- [ ] Loading states, transitions between screens
- [ ] Error states (if call fails, show fallback)
- [ ] Screenshot/record backup demo video
- [ ] Write Devpost description

---

## Build Chunks — Person B (CTO/Backend)

### Chunk B1: Ghost DB Setup + Bland Outbound Call — THE PRIORITIES (30 min)
- [ ] Install Ghost CLI: `curl -fsSL https://install.ghost.build | sh`
- [ ] `ghost login` → `ghost create` → note DB ID
- [ ] Run seed.sql: `ghost sql <id> "$(cat data/seed.sql)"`
- [ ] Verify: `ghost sql <id> "SELECT * FROM watchlists"` → should return demo user
- [ ] Create `lib/ghost-db.ts` — pg client using `ghost connect <id>` connection string
- [ ] Create `lib/bland.ts` — Bland API client
- [ ] Build `app/api/call/route.ts` — triggers outbound call
- [ ] Call script template:
  ```
  "Hey, this is 911Stock. I'm watching SMCI for you.
  The CEO, Charles Liang, just sold 50,000 shares worth $2.1 million.
  That's his first sale in 14 months, and it wasn't part of his scheduled plan.
  The last 3 times SMCI insiders made unscheduled sales like this,
  the stock dropped an average of 12% over the next 30 days.
  You own SMCI. Want me to reduce your position by 50%?"
  ```
- [ ] **TEST THE CALL IN THE FIRST 15 MINUTES.** If it doesn't work, debug immediately.
- [ ] Confirm: phone rings, AI speaks, conversation works

### Chunk B2: Signal Detection + Claude Analysis (30 min)
- [ ] Create `lib/claude.ts` — Anthropic client
- [ ] Create `lib/signals.ts` — queries Ghost DB for signals, matches against watchlist, scores
- [ ] Build `app/api/analyze/route.ts`:
  - Input: signal + historical patterns from Ghost DB
  - Prompt Claude: "You are 911Stock. Analyze this insider transaction and explain in plain English what it means for someone who owns this stock. Be direct, specific, no jargon. Include the historical pattern."
  - Output: plain-English explanation string
- [ ] Build `app/api/trigger/route.ts` — orchestrator:
  1. Query Ghost DB for watchlist
  2. Detect signal (from DB or live yfinance)
  3. Query Ghost DB for historical patterns
  4. Send SSE updates
  5. Call Claude for analysis
  6. Store signal + learning in Ghost DB
  7. Trigger Bland call

### Chunk B3: SSE Streaming Endpoint (15 min)
- [ ] Build `app/api/signal/route.ts` — Server-Sent Events
- [ ] Stream status updates as the pipeline runs:
  - `{ step: "scanning", status: "active" }`
  - `{ step: "signal_detected", status: "done", data: {...} }`
  - `{ step: "querying_ghost", status: "active" }`
  - `{ step: "patterns_found", status: "done", count: 3 }`
  - `{ step: "analyzing", status: "active" }`
  - `{ step: "explanation_ready", status: "done", text: "..." }`
  - `{ step: "calling", status: "active" }`
  - `{ step: "call_complete", status: "done" }`

### Chunk B4: Auth0 CIBA Backend (30 min)
- [ ] Create `lib/auth0-ciba.ts`
- [ ] CIBA flow:
  1. Agent sends backchannel auth request to Auth0
  2. Auth0 sends push notification to user's device
  3. User approves
  4. Backend polls Auth0 for token
  5. Token received → trade authorized
- [ ] Build `app/api/approve/route.ts`
- [ ] If CIBA is too complex after 30 min → WoZ it:
  - Fake the approval with a setTimeout
  - Show the Auth0 logo + "Approved via CIBA" in UI
  - Explain CIBA verbally during demo

### Chunk B5: Bland Inbound Agent (20 min)
- [ ] Configure a Bland inbound number
- [ ] System prompt for inbound agent:
  ```
  You are 911Stock, a portfolio monitoring AI. The caller owns these stocks:
  - SMCI (Super Micro Computer) — recent alert: CEO sold $2.1M on March 19
  - TSLA (Tesla) — no recent signals, quiet
  - NVDA (NVIDIA) — no recent signals, quiet

  Historical pattern for SMCI: last 3 unscheduled insider sales led to avg 12% drop in 30 days.

  Rules:
  - Speak in plain English. No financial jargon.
  - Be concise. 2-3 sentences per answer.
  - If asked about a stock not in the watchlist, say "That stock isn't in your watchlist yet. Want me to add it?"
  - If asked something you don't know, say "I don't have data on that right now."
  ```
- [ ] Test with 3 questions: "What's happening with SMCI?" / "Should I sell?" / "Any news on Tesla?"

### Chunk B6: Ghost DB Self-Improvement Demo (15 min)
- [ ] After signal is processed, INSERT into `agent_learnings`:
  - pattern_match_count, avg_historical_drop, action_taken, user_approved
- [ ] Before calling, agent does: `SELECT COUNT(*) FROM signals WHERE ticker = 'SMCI'`
  - If > 1: "I've seen SMCI signals before. Combining with my previous analysis..."
  - This IS the self-improvement moment judges will see
- [ ] Optional: `ghost fork <id>` before experimental analysis, show in demo as safety measure

### Chunk B7: Wire Together + Test (15 min)
- [ ] End-to-end smoke test: button → dashboard → call → resolution
- [ ] Verify Ghost DB has new rows after pipeline runs
- [ ] Fix any integration bugs
- [ ] Push final code to GitHub

---

## Shared Chunks (Both People)

### Chunk S1: Smoke Test (Start of Hour 3)
- [ ] Full end-to-end run: press button on watchlist → dashboard streams → phone rings → resolution shows
- [ ] Verify Ghost DB writes: `ghost sql <id> "SELECT * FROM signals"` → should show new row
- [ ] Time it. Must complete within 60 seconds for demo pacing.
- [ ] Fix blockers. This is the integration checkpoint.

### Chunk S2: Demo Rehearsal (Last 30 min)
- [ ] Rehearsal 1: Full 3-min run. Time it. Note rough spots.
- [ ] Rehearsal 2: Fix rough spots. Run again.
- [ ] Rehearsal 3: Final clean run. Record as backup video.
- [ ] Decide: who narrates, who drives the laptop, who holds the phone

### Chunk S3: Submission (Last 15 min)
- [ ] Push all code to GitHub (git add, commit, push)
- [ ] Create Devpost project page
- [ ] Upload demo video (backup recording)
- [ ] Write project description (use demo script from below)
- [ ] List all sponsor tools used

---

## Timeline (Clock Time)

```
~12:00 PM  START BUILDING
           Person A: Chunk A1 (setup) → A2 (watchlist)
           Person B: Chunk B1 (Ghost DB setup + Bland outbound — TEST FIRST)

~12:30 PM  Person A: Chunk A3 (dashboard)
           Person B: Chunk B2 (signal detection + Claude + Ghost queries)

~1:00 PM   Person A: Chunk A4 (resolution)
           Person B: Chunk B3 (SSE) → B4 (Auth0 CIBA)

~1:30 PM   SMOKE TEST (both): Chunk S1
           Fix any blockers from end-to-end test

~1:45 PM   Person A: Chunk A5 (CIBA UX) → A6 (polish)
           Person B: Chunk B5 (inbound agent) → B6 (Ghost self-improvement)

~2:30 PM   Person B: Chunk B7 (wire + test)
           Person A: Start demo prep

~3:00 PM   DEMO REHEARSALS (both): Chunk S2

~3:15 PM   SUBMISSION: Chunk S3

~3:30 PM   DONE. Buffer for fires.
```

---

## Failover Protocol

| What breaks | When to cut | Fallback |
|---|---|---|
| Phone doesn't ring | 20 sec after trigger | Play backup recording from laptop speaker |
| Ghost DB connection fails | After 15 min of effort | Fall back to JSON files, explain Ghost verbally |
| Auth0 CIBA too complex | After 30 min of effort | WoZ: fake approval with setTimeout, show Auth0 logo |
| Inbound call gives bad answer | During rehearsal | Pre-rehearse 3 safe questions, avoid open-ended |
| Dashboard SSE doesn't stream | After 15 min of effort | Hardcode timed sequence with setInterval |
| Claude API rate limited | If it happens | Pre-generate the explanation, hardcode as fallback |

**Cut order (if running out of time):** Auth0 CIBA → Inbound call → Ghost self-improvement demo → Dashboard streaming. NEVER cut: outbound phone call, plain-English explanation, watchlist screen, Ghost DB (it's our biggest prize track).

---

## Demo Script (3 min) — 911Stock

```
0:00-0:20  PROBLEM
           "I own SMCI, Tesla, and NVIDIA. Insider transactions,
           SEC filings, and market signals happen 24/7. By the
           time I see it on CNBC, it's too late. What if an AI
           agent watched my stocks and called me when something
           actually matters?"

0:20-0:40  SOLUTION
           [Show watchlist screen]
           "This is 911Stock. 911 for your stocks. I enter my
           portfolio, and the agent watches it for me. Let me
           trigger it now."
           [Press the red button]

0:40-1:40  AUTONOMY
           [Dashboard comes alive — streaming status]
           "Watch. It's scanning SEC filings... found something.
           SMCI's CEO sold $2.1 million in stock on March 19th.
           It's querying its Ghost database for historical patterns...
           3 matches found. Scoring the significance...
           generating a plain-English explanation.
           All autonomous. I'm not touching anything."
           [Phone rings]
           "And there it is."

1:40-2:10  HERO MOMENT
           [Pick up phone on speaker]
           AI: "Hey, this is 911Stock. I'm watching SMCI for you.
           The CEO just sold $2.1 million — his first sale in
           14 months, outside his scheduled plan. The last 3 times
           SMCI insiders did this, the stock dropped an average of
           12%. Want me to reduce your position by 50%?"
           [Say "Yes"]
           [Resolution screen appears]

2:10-2:40  DEPTH
           [Show resolution screen]
           "4 sponsor tools working together. Bland AI for the call.
           Auth0 CIBA for trade approval — the agent can't act
           without my permission. And Ghost — the agent's own
           database. It queried historical patterns, stored this
           signal, and logged what it learned. Next time it sees
           an SMCI insider sale, it already knows the context.
           The agent gets smarter every time."

2:40-3:00  CLOSE
           [Hand judge the phone]
           "You can also call 911Stock. Ask it anything about your
           portfolio."
           "Nothing else calls your phone, knows your specific
           holdings, and explains what an insider sale means for
           you in plain English. 911Stock. Your portfolio, watched."
```

---

## Environment Variables Needed

```bash
# .env.local (DO NOT COMMIT)
ANTHROPIC_API_KEY=sk-ant-...          # Claude API for signal analysis
BLAND_API_KEY=sk-...                   # Bland AI for phone calls
BLAND_INBOUND_NUMBER=+1...            # Bland inbound number for judge calls
MY_PHONE_NUMBER=+1...                 # Phone to call during demo
GHOST_DB_ID=...                        # Ghost database ID
GHOST_CONNECTION_STRING=postgresql://... # Ghost DB connection string
AUTH0_DOMAIN=xxx.auth0.com            # Auth0 tenant
AUTH0_CLIENT_ID=...                   # Auth0 app client ID
AUTH0_CLIENT_SECRET=...               # Auth0 app client secret
```

---

## Sponsor Integration Summary

| Sponsor | What We Build | What We WoZ | Prize Track |
|---|---|---|---|
| **Bland AI** | Outbound call + inbound agent | — | $500 |
| **Auth0** | CIBA approval flow (or WoZ) | Login screen | $1,750 |
| **Ghost** | Real Postgres DB: watchlists, signals, patterns, learnings, alerts | — | $1,998 + $500/member |
| **Airbyte** | — | Narrative only ("data pipeline for SEC data") | $1,000 |

**Total potential: up to $5,248+**

**Why we dropped Aerospike:** Ghost DB covers everything Aerospike was doing (storage, patterns, dedup) plus gives us forking, SQL, and the biggest single cash prize. One real integration beats two fake ones.

**Why we dropped Overmind:** Focus on fewer, deeper integrations. The plan said "FIRST TO CUT" for Overmind anyway.

---

## What We're NOT Building
- Real brokerage API integration
- Real Airbyte data pipeline (mentioning it in narrative for the prize track)
- Multi-user support (hardcoded single demo user)
- Mobile app
- Real trade execution
- User registration / signup flow

## What We ARE Building (Real, Not WoZ)
- Real Ghost DB with real Postgres tables, queries, and agent writes
- Real Bland AI outbound + inbound phone calls
- Real Claude analysis with plain-English generation
- Auth0 CIBA (real if time allows, WoZ if not)
- Real SSE streaming dashboard
