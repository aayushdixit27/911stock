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

## THE BUILD: Personal Stock Guardian

> "It watches your stocks 24/7 and calls you when something matters — explained in plain English."

### What It Does
An autonomous agent that monitors SEC filings, news, and sentiment for YOUR specific portfolio. When it detects something significant (insider sales, earnings surprises, unusual activity), it writes a plain-English analysis, publishes it to your personal feed, and calls your phone to explain what it means for YOU.

### The Hero Moment
You walk on stage, say "I own Tesla and NVIDIA," show your watchlist. Trigger the agent. Phone rings. The AI says:

> "Hey, I'm watching NVIDIA for you. The CFO just sold $12 million in stock — that's unusual because she hasn't sold anything in 22 months and this wasn't part of her scheduled plan. Historically when NVIDIA insiders do this, the stock drops an average of 9% over the next 30 days. You have NVDA in your watchlist. Want me to tell you more?"

Every judge either trades stocks or knows someone who does. They immediately get it.

### The One Sentence That IS The Product
The plain-English explanation generator is the product. Everything else is infrastructure to deliver it.

```
Input:  CFO sold 847,232 shares at $142.50, no 10b5-1 plan,
        last transaction 22 months ago, position 40% reduced

Output: "The CFO just sold $12M in stock — her first sale in
        almost 2 years, outside her normal scheduled plan.
        That's the kind of move insiders make when they're
        not feeling great about the next few months."
```

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

| Sponsor | Role | Why It's Load-Bearing |
|---|---|---|
| **Airbyte** | Pull financial news, sentiment, market signals | The eyes — real-time data pipeline |
| **Auth0** | User signup, portfolio watchlist, phone number | The front door — identity tied to holdings |
| **Ghost** | Agent's persistent Postgres DB — watchlists, signals, learnings | The brain's storage — fork before risky ops, store everything |
| **Aerospike** | Fast signal dedup + vector similarity for pattern matching | The pattern matcher — "last time this happened..." |
| **Bland AI** | Phone call with personalized explanation | The hero moment — phone rings, AI explains |

### Prize Tracks
- Ghost ($1,998 cash + $500/member Visa gift card)
- Auth0 ($1,750)
- Airbyte ($1,000/$500/$250 + job interview)
- Aerospike ($650)
- Bland ($500 "Most Ab-Norm-al")
- **Total potential: up to $6,398+**

### Build Plan (5.5 hours)

```
Hour 1 (11:00-12:00): FOUNDATION + TALK TO SPONSORS
  - Project setup, pip install yfinance finnhub-python
  - Ghost: `curl -fsSL https://install.ghost.build | sh` + `ghost mcp install`
  - Ghost: create DB for watchlists, signals, agent learnings
  - Auth0 signup flow → enter watchlist + phone number
  - Talk to 1-2 sponsors while things install

Hour 2 (12:00-1:00): CORE AGENT
  - Signal detection agent (Bedrock/Claude)
  - yfinance + Finnhub → insider transactions, news, sentiment
  - Scoring engine: significance × relevance to user's portfolio
  - Ghost DB: store signals, user watchlists, scoring results
  - Plain-English explanation generator (THE PRODUCT)

Hour 3 (1:00-2:00): OUTPUT PIPELINE
  - Bland AI → phone call with portfolio-aware script
  - Aerospike: signal dedup + vector similarity for pattern matching
  - Ghost: fork DB before experimental analysis, store outcomes
  - Wire full pipeline: detect → score → explain → store → call

Hour 4 (2:00-3:00): SELF-IMPROVEMENT + POLISH
  - Learning loop via Ghost + Aerospike: query past signals
  - "This matches 3 previous insider sales" moment
  - Polish 3-screen demo: watchlist → agent working → phone rings
  - Wizard of Oz anything broken

Hour 5 (3:00-4:00): DEMO PREP
  - Rehearse 3-min demo 3 times
  - Record backup video
  - Test phone call end-to-end
  - Devpost submission + GitHub repo

Buffer (4:00-4:30): Fix whatever broke
```

### 3-Minute Demo Script

```
0:00-0:20  "I own Tesla and NVIDIA. Most people check their stocks
            once a day. But insider transactions, SEC filings, and
            market signals happen 24/7. By the time you see it on
            CNBC, it's too late."

0:20-0:40  Show the app. Enter watchlist. "Personal Stock Guardian
            watches YOUR stocks and only contacts you when something
            matters for what YOU own."

0:40-1:40  Trigger the agent live. Show it pulling insider data,
            detecting a significant sale, storing and scoring it in
            Ghost DB, matching historical patterns (Aerospike),
            generating a plain-English explanation.
            ALL AUTONOMOUS. Don't touch anything.

1:40-2:10  THE MOMENT: Phone rings. Pick up on speaker. AI explains
            the insider sale in plain English, specific to your holdings.
            "Want me to tell you more?" Say yes. It goes deeper.

2:10-2:40  Flash the observability: "5 sponsor tools working together:
            Airbyte for data, Auth0 for identity, Ghost for the agent's
            database, Aerospike for pattern matching, Bland for the call.
            The agent learns — it said 'historically' because it queried
            its own past signals in Ghost and matched patterns in Aerospike."

2:40-3:00  "Nothing calls your phone, knows your specific holdings,
            and explains what an insider sale means for you in plain
            English. Personal Stock Guardian. Your portfolio, watched."
```

---

## The Winning Architecture (6 Layers)

```
BRAIN:    Amazon Bedrock (Claude) -- multi-agent supervisor + sub-agents
SENSES:   Airbyte (SaaS data) + Tavily (web search) + Macroscope (code)
MEMORY:   Aerospike (vector search + KV state + graph)
HANDS:    Auth0 (OAuth) + Bland AI (voice) + GitHub APIs
SHIELD:   Overmind (supervision, drift detection, RL safety)
EYES:     TrueFoundry (observability, deployment, traces)
BUILD:    Kiro (agentic IDE)
STORE:    TigerData (agentic Postgres)
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
1. **"Tap into real-time data sources"** -- Airbyte connectors + Tavily search + live APIs
2. **"Make sense of what they find"** -- Multi-agent reasoning (Bedrock), code analysis (Macroscope), vector correlation (Aerospike)
3. **"Take meaningful action"** -- Auth0-authenticated PRs, Bland AI phone calls, automated deploys
4. **"Continuously learn and improve"** -- Aerospike stores outcomes; each run makes agent smarter
5. **"Alive, adaptive, real-world impact"** -- Live demo, real data, agent adapts mid-run

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
