# Deep Agents Hackathon - RSAC 2026: Session Refresh

> Drop this into any new Claude Code session to get fully up to speed instantly.

---

## What This Is

A hackathon happening **March 27, 2026** at **AWS Builder Loft** (525 Market St, SF). Organized by **tokens&**. Theme: **Context Engineering** -- build autonomous, self-improving AI agents.

**Coding window:** 11:00 AM - 4:30 PM PT (5.5 hours)
**Team size:** Max 4
**Total prizes:** $17,850+

---

## The Challenge (Exact Wording)

> **Build agents that don't just think -- they act.**
> Build infrastructure for autonomous, self-improving AI agents that can tap into real-time data sources, make sense of what they find, and take meaningful action without human intervention.
> Showcase how they **continuously learn and improve** as they operate -- creating solutions that feel **alive, adaptive, and built for real-world impact**.

---

## Judging Criteria

| Criterion | What Judges Want |
|---|---|
| **Autonomy** | Agent acts on real-time data without manual intervention |
| **Idea** | Solves a meaningful problem with real-world value |
| **Technical Implementation** | How well was it built |
| **Tool Use** | Effectively uses **at least 3 sponsor tools** |
| **Presentation (Demo)** | 3-minute demo |

**Submission:** 3-min demo video, public GitHub repo, skill on shipables.dev, Devpost project page. No pre-existing projects.

---

## Prize Tracks

| Track | Prize | Sponsor |
|---|---|---|
| Auth0 for AI Agents | $1,750 (3 winners) | Auth0 |
| Airbyte: Conquer with Context | $1,000 / $500 / $250 + job interview (1st) | Airbyte |
| Macroscope | $1,000 (1-2 winners) | Macroscope |
| Kiro | 42K subscription credits (3 winners) | AWS/Kiro |
| Senso.ai | $3,000 in credits (3 winners) | Senso.ai |
| Aerospike APIs | $650 (3 winners) | Aerospike |
| Ghost (by TigerData) — Best Use of Ghost | $1,998 cash + $500/member Visa gift card (1 team) | Ghost (ghost.build) |
| Overmind Builders | $651 + mystery prize (2 winners) | Overmind |
| TrueFoundry AI Gateway | $600 (1 winner) | TrueFoundry |
| Bland (Most Ab-Norm-al) | $500 (1 winner) | Bland AI |

---

## Sponsors: What They Do (Quick Reference)

| Sponsor | What It Does | Use It For | Key API/Install |
|---|---|---|---|
| **Amazon Bedrock** | LLM platform + agent orchestration | Multi-agent supervisor, Claude reasoning, tool use, RAG, guardrails | `boto3` / Bedrock SDK |
| **Kiro** | AWS agentic IDE (VS Code fork) | Spec-driven dev, agent hooks, autonomous coding | kiro.dev |
| **Auth0** | Identity & auth for AI agents | OAuth Token Vault (30+ services), async approval (CIBA), fine-grained auth for RAG | auth0.com/ai, LangChain/LlamaIndex SDKs |
| **Bland AI** | Voice AI phone calls | Outbound/inbound calls, mid-call function calling, voice cloning | MCP: `https://docs.bland.ai/mcp`, CLI: `bland`, API: `POST api.bland.ai/v1/calls` |
| **Airbyte** | 52 data connectors for agents | Real-time SaaS data (CRM, Slack, Jira, Gmail, Stripe...) inside agent loop | `npx skills add airbytehq/airbyte-agent-connectors` |
| **Aerospike** | Real-time multi-model DB | Sub-ms vector search, agent memory, state store, graph | Python SDK, LangChain extension |
| **TrueFoundry** | Deploy & observe agents | Kubernetes deploy, OpenTelemetry traces, AI Gateway, RBAC | truefoundry.com |
| **Overmind** | Agent supervision & safety | Real-time monitoring, drift detection, RL optimization | overmind.so |
| **Macroscope** | Code understanding engine | AST analysis, dependency graphs, AI code review, Q&A | macroscope.com API |
| **Ghost** | First DB for agents (by TigerData) | Agent creates/forks/queries Postgres DBs freely, CLI+MCP only | ghost.build, `curl -fsSL https://install.ghost.build \| sh`, `ghost mcp install` |
| **TigerData** | Agentic Postgres (ex-Timescale) | Instant DB forks, MCP server, BM25 + vector search | tigerdata.com |
| **Tavily** | AI search API | Web research, deep research, domain/time filtering | tavily.com, LangChain/MCP |
| **Letta** | Stateful agents (ex-MemGPT) | Persistent memory: core/archival/recall tiers | letta.com, open-source |

---

## Installed Tools

### gstack (Garry Tan's Claude Code factory)
- **Location:** `~/.claude/skills/gstack`
- **Key commands:** `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/review`, `/qa`, `/ship`, `/browse`, `/cso`, `/investigate`, `/retro`
- **Troubleshoot:** `cd ~/.claude/skills/gstack && ./setup`

### Bland AI (Voice Calls)
- **MCP Server:** Added via `claude mcp add bland-ai --transport http https://docs.bland.ai/mcp` (INSTALLED)
- **CLI:** `bland` command (v0.2.5 INSTALLED globally via `npm install -g bland-cli`)
- **Shipable:** spencerjsmall/bland-ai on shipables.dev
- **Docs:** docs.bland.ai
- **API Key needed:** Set `BLAND_API_KEY` env var (get from bland.ai dashboard)
- **Quick call:** `POST https://api.bland.ai/v1/calls` with `phone_number`, `prompt`, `voice`

### Ghost (Agent Database by TigerData)
- **CLI:** `ghost` (v0.4.5 INSTALLED at `~/.local/bin/ghost`)
- **MCP:** `ghost mcp install` (installed for Claude Code)
- **Login:** `ghost login` (GitHub OAuth)
- **Create DB:** `ghost create` → returns ID + connection string
- **Fork DB:** `ghost fork <id>` → copy-on-write clone
- **Query:** `ghost sql <id> "SELECT * FROM signals"`
- **Free tier:** 100 compute hours/month, 1TB storage, unlimited DBs + forks
- **Website:** ghost.build

### Airbyte Agent Connectors
- **Location:** `~/.claude/skills/airbyte`
- **52 connectors:** airtable, amazon-ads, amplitude, asana, chargebee, clickup, confluence, facebook-marketing, freshdesk, github, gitlab, gmail, gong, google-ads, google-analytics, google-drive, greenhouse, harvest, hubspot, incident-io, intercom, jira, klaviyo, linear, linkedin-ads, mailchimp, monday, notion, orb, paypal, pinterest, pylon, salesforce, sendgrid, sentry, shopify, slack, snapchat-marketing, stripe, tiktok-marketing, twilio, typeform, woocommerce, zendesk-chat, zendesk-support, zendesk-talk, zoho-crm, and more
- **Install connectors:** `pip install airbyte-agent-<name>` (e.g. `airbyte-agent-slack`)
- **Docs:** docs.airbyte.com/ai-agents
- **Platform:** app.airbyte.ai (free trial)

---

## Key People

### Speakers
| Name | Company | Role |
|---|---|---|
| Jon Turdiev | AWS | Sr. Solutions Architect, Startups |
| Spencer Small | Bland AI | Head of Engineering |
| Lucas Beeler | Aerospike | Solutions Architect |
| Sai Krishna | TrueFoundry | Dev Rel |
| Tyler Edwards | Overmind | CEO (ex-MI5/MI6/GCHQ) |
| Rob Bishop | Macroscope | Co-founder |
| Fred Patton | Auth0 | Sr. Developer Advocate |
| Ajay Kulkarni | TigerData | CEO (ex-Timescale) |
| Pedro Lopez | Airbyte | Sr. Software Engineer |

### Judges (27 total -- key ones)
| Name | Role | What They Care About |
|---|---|---|
| Jon Turdiev | AWS SA | Architecture quality, AWS integration |
| Rakesh Kumar | AWS GTM | Business value, market potential (finance background) |
| Juhi Parekh | AI PM @ Turing | Product sense, UX (built 0-to-1 at Apple, Amazon, Samsung) |
| Spencer Small | Bland Engineering | Voice AI creativity |
| Tyler Edwards | Overmind CEO | Agent safety, supervision (intelligence community) |
| Akhat Rakishev | Overmind CTO | ML infra, optimization (ex-Monzo) |
| Divyarani Raghupatruni | Alacriti Sr. Dir. Product | Data orchestration, fintech (ex-Block/Square) |
| Sahil Sachdeva | LinkedIn SWE | System design, scalability |
| Devansh Jain | Letta Research | Agent memory, statefulness |
| Sofia Guzowski | Tavily | Web search/research quality |
| Rob Bishop | Macroscope Co-founder | Code understanding, AST analysis |
| Pedro Lopez | Airbyte SWE | Data pipeline integration |

---

## THE BUILD: 911Stock

> "911 for your stocks. It watches your portfolio 24/7 and calls you when something matters."

**Repo:** https://github.com/aayushdixit27/911stock
**Full build plan:** See `plan.md` for chunk-by-chunk task breakdown with Person A/B split.
**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS

### What It Does
An autonomous agent that monitors SEC filings and insider transactions for YOUR specific portfolio. When it detects something significant, it writes a plain-English analysis, stores the signal in its own Ghost database, and calls your phone to explain what it means for YOU. You can also call it back and ask questions.

### The Hero Moment (UPDATED)
You walk on stage, show the dashboard with SMCI, TSLA, NVDA in your watchlist. Press **Play Timeline**. News scrolls through — Mar 18, everything calm, SMCI at $42.50 +4.2%. Then Mar 19 hits: DOJ indictment, Reuters, Bloomberg. SMCI drops to $39.10. The agent **automatically** fires the pipeline — no button click. Phone rings. The AI says:

> "Hey, this is 911Stock. I'm watching SMCI for you. The co-founder was just charged with smuggling $2.5 billion of AI servers to China. The stock is already down 8% after hours. Based on 3 similar events in SMCI's history, the average 30-day decline is 12%. Want me to reduce your position by 50%?"

You say "Yes." Auth0 CIBA approval → trade executes in Ghost DB → resolution screen shows live trade confirmation with order ID, before/after position, estimated savings. Then you hand the judge your phone: "Call 911Stock. Ask it anything."

### The One Sentence That IS The Product
The plain-English explanation generator is the product. Everything else is infrastructure to deliver it.

### Stock Data APIs (Free, No Paid Subscription)

| Source | What It Gives You | Setup | Key Needed? |
|---|---|---|---|
| **yfinance** | Insider transactions, prices, news (DataFrame) | `pip install yfinance` (2 min) | No |
| **Finnhub** | Insider trades JSON, sentiment, WebSocket prices | `pip install finnhub-python` (5 min) | Free (60 calls/min) |
| **SEC EDGAR** | Raw Form 4 XML, authoritative source | requests + xml parsing (15 min) | No (set User-Agent) |

**Fastest path:** `pip install yfinance finnhub-python`
```python
import yfinance as yf
ticker = yf.Ticker("NVDA")
insider_df = ticker.insider_transactions  # Done. DataFrame.
```

### Sponsor Integration (5 tools)

| Sponsor | What We Build (Real) | What We WoZ | Prize Track |
|---|---|---|---|
| **Bland AI** | Outbound call + inbound agent | — | $500 |
| **Auth0** | CIBA approval flow (or WoZ) | Login screen | $1,750 |
| **Ghost** | Real Postgres DB: watchlists, signals, patterns, learnings, alerts | — | $1,998 + $500/member |
| **Overmind** | Agent supervision, traces, policy compliance (or screenshot) | — | $651 |
| **Airbyte** | — | Narrative only ("data pipeline") | $1,000 |
| **TrueFoundry** | Agent audit trail (or screenshot) | — | $600 |

**Key change:** Ghost DB (ghost.build) replaces both Aerospike AND Ghost CMS. One real Postgres DB instead of two fakes. Biggest single cash prize. TrueFoundry added as 6th sponsor per judge request.

### Prize Tracks
- Ghost ($1,998 + $500/member Visa gift card) — **biggest cash prize, real integration**
- Auth0 ($1,750)
- Airbyte ($1,000/$500/$250 + job interview)
- Overmind ($651 + mystery prize)
- Bland ($500 "Most Ab-Norm-al")
- **Total potential: up to $5,899+**

### Build Status (as of ~4:00 PM)

| Chunk | Status | What Was Built |
|---|---|---|
| A1: Setup | DONE | CTO scaffolded Next.js app |
| A2: Watchlist | DONE | Two-column dashboard: watchlist + news timeline, add/remove stocks, sensitivity dropdowns |
| A3: Dashboard | DONE | Pipeline steps, ink takeover agent analysis, phone ringing, Auth0 Guardian polling |
| A4: Resolution | DONE | Ink hero, trade confirmation with live order ID, Overmind trace, Ghost DB status, still watching |
| A5: Auth0 CIBA UX | DONE | Trade details card, shield icon, Guardian push notification flow |
| A6: Polish | DONE | Page transitions, loading spinners, focus states, responsive grids, hover states |
| NEW: News Timeline | DONE | 6 days of real SMCI news (DOJ, Reuters, Bloomberg), play/pause slideshow, auto-trigger on signal |
| NEW: Trade Execution | DONE | Portfolio positions, /api/execute-trade, live trade confirmation on resolution page |
| NEW: Live Prices | DONE | Stock prices update per day as timeline plays (SMCI $42.50→$28.48→$24.10) |
| NEW: Verified Sources | DONE | Ink panel with SEC Form 4, DOJ press release, Reuters — clickable links, preemptive trust |
| NEW: Smart Call Agent | DONE | Bland cites sources ("According to DOJ..."), personal position ($42,500), handles "hold on" gracefully |
| NEW: Auth0 Login | DONE | Auth0 middleware + login flow, CIBA Guardian push notifications |
| NEW: Ghost DB (real) | DONE | Real Postgres via TigerData — DATABASE_URL connected, portfolio + trades + signals tables |
| NEW: Custom Voice | DONE | Custom Bland voice ID for 911Stock agent |
| FIX: Mar 19 skip | DONE | Timeline was skipping Mar 19 due to stale closure — rewrote with refs |
| FIX: Tailwind/CSS | DONE | Removed duplicate CSS classes, fixed Turbopack resolution |
| FIX: Auth0 middleware | DONE | proxy.ts + middleware.ts at project root for Auth0 SDK v4 |

**Design:** MARK → Crimson Pro + Inter + IBM Plex Mono, fire gradient, ink/paper ground, terracotta accents

**Judge Feedback Applied:**
- "How do you know?" → Agent cites DOJ, Reuters, SEC Form 4 before being asked
- "Sounds like a scam" → Auth0 CIBA human-in-the-loop, sources panel on dashboard
- "I'd want to verify" → Agent handles "hold on" gracefully, stays on line
- "What about my specific holdings?" → Call references your exact position and dollar amount
- "Tiered pricing" → Free until first call, then monthly (narrative)
- "Social proof" → TrueFoundry audit trail for transparency

**Env vars configured:** Bland, Auth0 (domain, client, secret, audience, user sub), Overmind, TrueFoundry, Gemini, Ghost DB (DATABASE_URL + ID), AUTH0_SECRET, APP_BASE_URL

### Build Plan (2-person split — see plan.md for full chunk details)

```
Person A (Product/UX):                    Person B (CTO/Backend):
  A1: Project setup (15 min)                B1: Ghost DB + Bland outbound (30 min)
  A2: Watchlist screen (30 min)             B2: Signal detection + Claude (30 min)
  A3: Dashboard screen (30 min)             B3: SSE streaming (15 min)
  A4: Resolution screen (20 min)            B4: Auth0 CIBA backend (30 min)
  A5: Auth0 CIBA UX (20 min)               B5: Bland inbound agent (20 min)
  A6: Polish + demo prep (30 min)           B6: Overmind supervision (15 min)
                                            B7: Ghost self-improvement (15 min)
                                            B8: Wire + test (15 min)

Shared: S1 smoke test | S2 rehearsals | S3 submission
```

### 3-Minute Demo Script (UPDATED)

```
0:00-0:20  PROBLEM
           "I own SMCI, Tesla, and NVIDIA. March 19th, the DOJ
           charged SMCI's co-founder with smuggling $2.5 billion
           of AI chips to China. By the time CNBC covered it,
           the stock had already dropped 33%."

0:20-0:40  SOLUTION
           [Show dashboard — watchlist + news timeline]
           "This is 911Stock. It watches real news sources for
           your specific holdings. Watch what happens."
           [Press Play Timeline]

0:40-1:40  AUTONOMY
           [Timeline plays — Mar 18 calm, SMCI $42.50]
           "Mar 18, everything's fine..."
           [Mar 19 hits — DOJ, Reuters, Bloomberg flood in]
           "Mar 19. The agent detects it immediately."
           [Auto-triggers — no button press]
           [Dashboard streams — pipeline running]
           "It's scanning, matching patterns, generating analysis..."
           [Phone rings] "And there it is. Calling automatically."

1:40-2:10  HERO MOMENT
           [Phone on speaker] AI explains the situation.
           "Want me to reduce your position by 50%?" Say "Yes."
           [Auth0 CIBA approval → trade executes in Ghost DB]
           [Resolution: order ID, 1000→500 shares, est. savings]

2:10-2:40  DEPTH
           "5 sponsor tools. Bland AI for the call. Auth0 CIBA —
           the agent can't trade without permission. Ghost DB —
           the agent's own database, it wrote that trade.
           Overmind supervising every decision. Real news. Real
           analysis. Real trade execution."

2:40-3:00  CLOSE
           [Hand judge the phone] "Call 911Stock. Ask it anything."
           "If you owned SMCI on March 18th, this call would have
           saved you $5,000. 911Stock. Your portfolio, watched."
```

---

## 911Stock Architecture

```
BRAIN:    Claude (Anthropic API) -- signal analysis + plain-English generation
DATA:     yfinance + Finnhub (insider transactions, prices, news)
MEMORY:   Ghost DB (ghost.build) -- watchlists, signals, patterns, learnings
VOICE:    Bland AI -- outbound alert calls + inbound Q&A
AUTH:     Auth0 (CIBA) -- agent asks permission before executing trades
SHIELD:   Overmind -- agent supervision, policy compliance, traces
FRONTEND: Next.js (App Router) + Tailwind CSS
```

---

## Product Design Rules (from PRODUCT-DESIGN-PLAYBOOK.md)

### The 3 Laws

1. **ONE problem, ONE persona, ONE hero moment.** Don't let 8 sponsor integrations dilute your story. The #1 feedback from every mentor/judge: "You're mixing too many problems and solutions."
2. **Wizard of Oz the hard parts.** Polish the demo experience. Fake what you can't build in 5.5 hours. "AI with Claude Code Wizard-of-Oz's things so well -- fake databases, live data, animations. That is WAY more valuable than actually building the real thing."
3. **Benefits, not mechanisms.** Lead with pain and payoff. Save architecture for last 30 seconds.
   - Bad: "We use Bedrock multi-agent orchestration with Aerospike HNSW vector indexes"
   - Good: "Your security team sleeps through the night. The agent finds and fixes vulnerabilities before attackers exploit them."

### The Hero Moment Test

> "If it's not FUCK YES, it's FUCK NO."

Your demo needs ONE moment where judges lean forward. Signs you nailed it:
- "Can I use this now?" / "Is this on GitHub?"
- Judge asks follow-up questions about architecture (they're planning to use it)
- Pulling out phone to show someone

Signs you didn't:
- "That's cool" with no follow-up
- "I can see how someone would use this" (redirection = rejection)
- Polite nodding without enthusiasm

### Three Screens, Not Thirty

Build 3 screens that capture the full journey:
1. **The hook** -- the problem, live, painful
2. **The action** -- the agent DOES the thing autonomously
3. **The resolution** -- user FEELS the value (fix deployed, call made, threat gone)

### The Half-Day Rule

> "If you can't build and test this with a real customer in a half day, you're not pushing hard enough on Wizard-of-Oz thinking."

You literally have half a day. Prototype anything in 4 hours. Ask: do I actually need to build this technically, or can I fake the backend and show the experience?

### Talk to Sponsors First

The playbook says the biggest insights come from the first 10 minutes of conversation, not from building. **Talk to 1-2 sponsors/judges in the first hour.** Ask what problems they see. Adapt before you code.

---

## The 3-Minute Demo Formula

```
0:00-0:25  PROBLEM    "Every day, [AUDIENCE] faces [PROBLEM]. [PAINFUL STAT]."
0:25-0:45  SOLUTION   "[AGENT] does [WHAT] autonomously." Show the UI.
0:45-1:45  AUTONOMY   Trigger agent. Step back. Let it run. Narrate, don't touch.
1:45-2:15  WOW        Phone rings / PR appears / threat neutralized. ONE moment.
2:15-2:45  DEPTH      Flash TrueFoundry trace. "N sponsor tools working together."
2:45-3:00  CLOSE      "What took [TIME] now takes [SECONDS]. [AGENT NAME]."
```

**Key rules:**
- Live demo > slides
- Show the agent LEARNING ("it's smarter now than when it started")
- 3:00 hard stop
- Have a backup video recording

---

## The Context Engineering Winning Formula

Map directly to the challenge language:
1. **"Tap into real-time data sources"** -- yfinance/Finnhub insider transactions + SEC filings
2. **"Make sense of what they find"** -- Claude analysis + Ghost DB historical pattern matching
3. **"Take meaningful action"** -- Bland AI phone calls + Auth0 CIBA trade approval
4. **"Continuously learn and improve"** -- Ghost DB stores signals + outcomes; agent queries its own history
5. **"Alive, adaptive, real-world impact"** -- Live demo, real SMCI March 19 data, phone rings on stage

---

## Project Files

| File | What It Contains |
|---|---|
| `Research.md` | Full deep dive on every sponsor, speaker, judge, prize track |
| `Ideas.md` | 5 ideas with architectures, sponsor maps, demo scripts, comparison matrix |
| `Harry Potter Guide to Deep Agents.md` | 13-chapter story guide, Shire to Mount Doom difficulty progression |
| `LOTR Guide to Deep Agents.md` | 13-chapter Fellowship guide, every sponsor mapped to Middle-earth |
| `PRODUCT-DESIGN-PLAYBOOK.md` | IDEO framework, hero moment test, UX research, one-problem rule, Wizard of Oz prototyping |
| `Event Info.md` | Raw event page from Luma |
| `plan.md` | Full build plan: tech stack, project structure, chunks, Person A/B split, demo script |
| `Talking to judges.m4a.txt` | Transcript of sponsor/judge conversations (Airbyte, Overmind, Auth0) |
| `Improvement Ideas.md` | Inbound call expansion idea |
| `names.md` | Project name: 911Stock |
| `CLAUDE.md` | Claude Code project config with gstack skills |
| `refresh.md` | This file |

---

## Quick Start for New Session

```bash
# You're in:
cd "/Users/aayushdixit/Downloads/Votal Docs/Deep Agents Hackathon - RSAC 2026"

# Tools are installed at:
# ~/.claude/skills/gstack     (29 skills: /office-hours, /review, /qa, /ship, etc.)
# ~/.claude/skills/airbyte    (52 connectors: slack, github, salesforce, etc.)

# Read the full research:
cat Research.md

# Read the 5 ideas:
cat Ideas.md

# Start building:
# /office-hours    -- reframe your idea
# /plan-ceo-review -- challenge scope
# /plan-eng-review -- lock architecture
# Then code, /review, /qa, /ship
```
