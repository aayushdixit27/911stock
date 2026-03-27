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
| Monitoring | Overmind | Agent supervision, traces, policy compliance |
| Database | JSON files (WoZ) | Aerospike stand-in. Historical patterns, signals. |
| Publishing | Static HTML (WoZ) | Ghost stand-in. Alert feed page. |
| Deploy | Vercel (or localhost for demo) | One-command deploy |

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
│   ├── feed/
│   │   └── page.tsx            # Ghost WoZ - alert history feed
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
│       ├── approve/
│       │   └── route.ts        # POST: Auth0 CIBA approval endpoint
│       └── overmind/
│           └── route.ts        # POST: logs agent decision to Overmind
├── lib/
│   ├── bland.ts                # Bland AI client (outbound + inbound setup)
│   ├── claude.ts               # Anthropic client for signal analysis
│   ├── auth0-ciba.ts           # Auth0 CIBA flow helpers
│   ├── overmind.ts             # Overmind SDK client
│   └── signals.ts              # Signal detection logic + scoring
├── data/
│   ├── watchlist.json          # User's portfolio: SMCI, TSLA, NVDA
│   ├── signals.json            # Pre-loaded SMCI March 19 insider data
│   └── historical.json         # Historical insider sale patterns (WoZ Aerospike)
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

## Pre-loaded Data

### data/watchlist.json
```json
{
  "user": {
    "name": "Demo User",
    "phone": "+1XXXXXXXXXX",
    "stocks": ["SMCI", "TSLA", "NVDA"],
    "sensitivity": "major_events_only"
  }
}
```

### data/signals.json (SMCI March 19 Event)
```json
{
  "signals": [
    {
      "id": "smci-ceo-sell-20260319",
      "ticker": "SMCI",
      "insider": "Charles Liang",
      "role": "CEO",
      "action": "SELL",
      "shares": 50000,
      "price_per_share": 42.50,
      "total_value": 2125000,
      "date": "2026-03-19",
      "filed": "2026-03-19T16:30:00Z",
      "scheduled_10b5_1": false,
      "last_transaction_months_ago": 14,
      "position_reduced_pct": 18,
      "source": "SEC Form 4"
    }
  ]
}
```

### data/historical.json (WoZ Aerospike)
```json
{
  "patterns": [
    {
      "ticker": "SMCI",
      "event_type": "unscheduled_insider_sell",
      "occurrences": [
        { "date": "2025-08-12", "insider": "CFO", "subsequent_30d_drop_pct": 15.2 },
        { "date": "2024-11-03", "insider": "CEO", "subsequent_30d_drop_pct": 9.1 },
        { "date": "2024-03-22", "insider": "VP Sales", "subsequent_30d_drop_pct": 11.8 }
      ],
      "avg_30d_drop_pct": 12.0,
      "confidence": "high"
    },
    {
      "ticker": "NVDA",
      "event_type": "unscheduled_insider_sell",
      "occurrences": [
        { "date": "2025-06-15", "insider": "CFO", "subsequent_30d_drop_pct": 8.7 }
      ],
      "avg_30d_drop_pct": 8.7,
      "confidence": "medium"
    }
  ]
}
```

---

## Agent Pipeline (What Happens When You Press the Button)

```
[Button Press on Watchlist Page]
        │
        ▼
POST /api/trigger
        │
        ├──▶ Load watchlist.json + signals.json
        │
        ├──▶ Signal Detection: match signal to user's stocks
        │    "SMCI insider sale detected. User owns SMCI."
        │
        ├──▶ SSE stream to /dashboard (status updates)
        │    → "Scanning SEC filings..."
        │    → "Signal detected: SMCI CEO sold $2.1M"
        │    → "Cross-referencing historical patterns..."
        │    → "Scoring significance: HIGH"
        │    → "Generating plain-English explanation..."
        │
        ├──▶ POST /api/analyze (Claude)
        │    Input: signal + historical patterns
        │    Output: plain-English explanation
        │    → "SMCI's CEO just sold $2.1M in stock — his first
        │       sale in 14 months, outside his scheduled plan.
        │       The last 3 times SMCI insiders did unscheduled
        │       sales, the stock dropped an average of 12% over
        │       30 days. You own SMCI. This is worth watching."
        │
        ├──▶ POST /api/overmind (log decision)
        │    → "Agent decided: HIGH significance, recommend alert"
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
│  ✅ Cross-referencing 3 patterns    [done]  │
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
│  Overmind: 3 decisions, all within policy ✓  │
│  Agent learning: pattern stored for future   │
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
- [ ] Create `data/` folder with watchlist.json, signals.json, historical.json
- [ ] Create `.env.example` with required vars:
  ```
  ANTHROPIC_API_KEY=
  BLAND_API_KEY=
  BLAND_INBOUND_NUMBER=
  AUTH0_DOMAIN=
  AUTH0_CLIENT_ID=
  AUTH0_CLIENT_SECRET=
  OVERMIND_API_KEY=
  ```
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
- [ ] Overmind status line ("3 decisions, all within policy")
- [ ] "Call 911Stock" section with inbound phone number
- [ ] "Still watching: TSLA, NVDA" section

### Chunk A5: Ghost WoZ Feed (10 min)
- [ ] Build `app/feed/page.tsx` — static alert history
- [ ] 3-4 pre-written alert cards (past "events" the agent detected)
- [ ] Simple timeline layout

### Chunk A6: Auth0 CIBA UX (20 min)
- [ ] Add approval step to dashboard flow
- [ ] "Agent is requesting trade approval..." UI state
- [ ] "Approved via Auth0 CIBA ✓" confirmation
- [ ] Wire to /api/approve endpoint (or WoZ if backend not ready)

### Chunk A7: Polish + Demo Prep (30 min)
- [ ] Responsive check (looks good on projected screen)
- [ ] Loading states, transitions between screens
- [ ] Error states (if call fails, show fallback)
- [ ] Screenshot/record backup demo video
- [ ] Write Devpost description

---

## Build Chunks — Person B (CTO/Backend)

### Chunk B1: Bland Outbound Call — THE PRIORITY (30 min)
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
- [ ] Create `lib/signals.ts` — loads signals.json, matches against watchlist, scores
- [ ] Build `app/api/analyze/route.ts`:
  - Input: signal JSON + historical patterns
  - Prompt Claude: "You are 911Stock. Analyze this insider transaction and explain in plain English what it means for someone who owns this stock. Be direct, specific, no jargon. Include the historical pattern."
  - Output: plain-English explanation string
- [ ] Build `app/api/trigger/route.ts` — orchestrator:
  1. Load data
  2. Detect signal
  3. Send SSE updates
  4. Call Claude for analysis
  5. Trigger Bland call
  6. Log to Overmind

### Chunk B3: SSE Streaming Endpoint (15 min)
- [ ] Build `app/api/signal/route.ts` — Server-Sent Events
- [ ] Stream status updates as the pipeline runs:
  - `{ step: "scanning", status: "active" }`
  - `{ step: "signal_detected", status: "done", data: {...} }`
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

### Chunk B6: Overmind Integration (20 min) — FIRST TO CUT
- [ ] Create `lib/overmind.ts` — Overmind SDK client
- [ ] Build `app/api/overmind/route.ts` — logs agent decisions
- [ ] Log 3 decisions during pipeline:
  1. "Signal detected: HIGH significance (SMCI CEO sell)"
  2. "Recommendation: Alert user + suggest position reduction"
  3. "Trade executed: SMCI -50% (user approved via CIBA)"
- [ ] If SDK doesn't work → screenshot their dashboard, show pre-captured image

### Chunk B7: Wire Together + Test (15 min)
- [ ] End-to-end smoke test: button → dashboard → call → resolution
- [ ] Fix any integration bugs
- [ ] Push final code to GitHub

---

## Shared Chunks (Both People)

### Chunk S1: Smoke Test (Start of Hour 3)
- [ ] Full end-to-end run: press button on watchlist → dashboard streams → phone rings → resolution shows
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
           Person B: Chunk B1 (Bland outbound — TEST FIRST)

~12:30 PM  Person A: Chunk A3 (dashboard)
           Person B: Chunk B2 (signal detection + Claude)

~1:00 PM   Person A: Chunk A4 (resolution) → A5 (ghost feed)
           Person B: Chunk B3 (SSE) → B4 (Auth0 CIBA)

~1:30 PM   SMOKE TEST (both): Chunk S1
           Fix any blockers from end-to-end test

~1:45 PM   Person A: Chunk A6 (CIBA UX) → A7 (polish)
           Person B: Chunk B5 (inbound agent) → B6 (Overmind)

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
| Auth0 CIBA too complex | After 30 min of effort | WoZ: fake approval with setTimeout, show Auth0 logo |
| Overmind SDK fails | After 15 min of effort | Screenshot their hosted dashboard, show as image |
| Inbound call gives bad answer | During rehearsal | Pre-rehearse 3 safe questions, avoid open-ended |
| Dashboard SSE doesn't stream | After 15 min of effort | Hardcode timed sequence with setInterval |
| Claude API rate limited | If it happens | Pre-generate the explanation, hardcode as fallback |

**Cut order (if running out of time):** Overmind → Auth0 CIBA → Inbound call → Ghost feed → Dashboard streaming. NEVER cut: outbound phone call, plain-English explanation, watchlist screen.

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
           It's scoring the significance... cross-referencing
           historical patterns... generating a plain-English
           explanation. All autonomous. I'm not touching anything."
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
           [Show resolution + Overmind trace]
           "6 sponsor tools working together. Bland AI for the call.
           Auth0 CIBA for trade approval — the agent can't act
           without my permission. Aerospike for historical patterns.
           Ghost for my alert feed. Overmind supervising every
           decision. And the agent learns — it said 'the last 3
           times' because it remembered."

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
AUTH0_DOMAIN=xxx.auth0.com            # Auth0 tenant
AUTH0_CLIENT_ID=...                   # Auth0 app client ID
AUTH0_CLIENT_SECRET=...               # Auth0 app client secret
OVERMIND_API_KEY=...                  # Overmind agent supervision
```

---

## Sponsor Integration Summary

| Sponsor | What We Build | What We WoZ | Prize Track |
|---|---|---|---|
| **Bland AI** | Outbound call + inbound agent | — | $500 |
| **Auth0** | CIBA approval flow (or WoZ) | Login screen | $1,750 |
| **Aerospike** | — | JSON files for historical patterns | $650 |
| **Ghost** | — | Static HTML alert feed | $1,998 |
| **Airbyte** | — | Narrative only ("data pipeline") | $1,000 |
| **Overmind** | Agent trace logging (or screenshot) | — | $651 |

**Total potential: up to $6,549**

---

## What We're NOT Building
- Real brokerage API integration
- Real Airbyte data pipeline (no financial connectors available)
- Real Aerospike deployment (JSON files are the WoZ)
- Real Ghost CMS (static HTML page)
- Multi-user support (hardcoded single demo user)
- Mobile app
- Real trade execution
- User registration / signup flow
