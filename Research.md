# Deep Agents Hackathon - RSAC 2026: Full Research Briefing

## Event Logistics

- **Date:** March 27, 2026, 9:30 AM - 7:30 PM PT
- **Location:** AWS Builder Loft, 525 Market St, San Francisco, CA 94105
- **Organizer:** tokens& (AI/tech community hub)
- **Total Prizes:** $17,850+
- **Devpost:** deep-agents-hackathon.devpost.com
- **Coding Window:** 11:00 AM - 4:30 PM PT (5.5 hours)
- **Team Size:** Max 4 people
- **Theme:** Build agents that plan, reason, and execute across complex multi-step tasks autonomously

---

## The Challenge: CONTEXT ENGINEERING

> **Build agents that don't just think -- they act.**
>
> Build infrastructure for autonomous, self-improving AI agents that can tap into real-time data sources, make sense of what they find, and take meaningful action without human intervention.
>
> Your challenge is to showcase your agent's skills and how they **continuously learn and improve** as they operate -- creating solutions that feel **alive, adaptive, and built for real-world impact**.

This framing is critical. The judges aren't just looking for a clever agent -- they want to see **context engineering**: agents that pull in the right data at the right time, build understanding from it, and act on that understanding. The "self-improving" and "continuously learn" language means **memory and adaptation are not optional** -- they're core to what wins.

---

## Judging Criteria

| Criterion | Official Description | What It Really Means |
|---|---|---|
| **Autonomy** | How well does the agent act on real-time data without manual intervention? | Agent pulls live data, reasons over it, and takes action -- all without a human in the loop. The more steps it chains autonomously, the higher you score. |
| **Idea** | Does the solution have the potential to solve a meaningful problem or demonstrate real-world value? | Real problem, real impact. Not a toy demo. Judges include PMs and GTM people -- they want business value. |
| **Technical Implementation** | How well was the solution implemented? | Clean architecture, good code, observable traces. Show the work, not just the result. |
| **Tool Use** | Did the solution effectively use at least 3 sponsor tools? | Minimum 3 sponsor tools, but "effectively" is key -- each tool must serve a clear purpose, not just be imported. |
| **Presentation (Demo)** | Demonstration of the solution in 3 minutes. | 3 minutes. Live demo preferred. Clear narrative arc: problem -> solution -> live agent -> wow moment -> impact. |

**Submission Requirements:** 3-min demo video, public GitHub repo, skill on shipables.dev, full Devpost details. No pre-existing projects.

---

## Prize Tracks

| Track | Prize | Sponsor |
|---|---|---|
| Auth0 for AI Agents | $1,750 (3 winners) | Auth0 |
| Airbyte: Conquer with Context | $1,000 / $500 / $250 (1st/2nd/3rd) + job interview for 1st | Airbyte |
| Macroscope | $1,000 (1-2 winners) | Macroscope |
| Kiro | 42K subscription credits (3 winners) | AWS/Kiro |
| Senso.ai | $3,000 in credits (3 winners) | Senso.ai |
| Aerospike APIs | $650 (3 winners) | Aerospike |
| Ghost | $1,998 (1 team) | Ghost |
| Overmind Builders | $651 + mystery prize (2 winners) | Overmind |
| TrueFoundry AI Gateway | $600 (1 winner) | TrueFoundry |
| Bland (Most Ab-Norm-al) | $500 (1 winner) | Bland AI |

---

## Sponsors: Deep Dive

### AWS / Amazon Bedrock / Kiro

**Amazon Bedrock** is the foundation model platform with built-in agent orchestration:
- Multi-step task automation with tool use / action groups
- Code interpretation in secure sandboxes
- Memory across interactions for personalized multi-step tasks
- Knowledge Bases (RAG) for grounded responses
- Multi-Agent Collaboration with supervisor agents
- Guardrails for content filtering, PII handling, safety

**Amazon Bedrock AgentCore** (production platform):
- Full session isolation, low latency, long-running workloads up to 8 hours
- Gateway that converts existing APIs into MCP-compatible tools
- Episodic memory -- agents learn from past experiences
- Natural-language policy definitions auto-converted to Cedar
- 13 built-in evaluators + custom scoring
- Browser tool for web interactions
- Code interpreter sandbox
- End-to-end observability via CloudWatch + OTEL

**Kiro** -- AWS's Agentic IDE (VS Code fork):
- Spec-Driven Development: prompts -> structured requirements -> architecture -> implementation tasks
- Agent Steering: project-wide config files for coding standards and context
- Agent Hooks: automated triggers on file save/create/delete
- Autonomous Agent (Preview): works asynchronously, writes code across repos, creates PRs
- Native MCP integration
- Uses Claude Sonnet 4.5 for coding/reasoning
- Multimodal input (images for UI mockups)
- CLI mode for terminal access

---

### Auth0 (by Okta) -- Identity & Auth for AI Agents

**Product: "Auth0 for AI Agents"** (GA)

Four core capabilities:
1. **User Authentication** -- Agents identify users via secure login flows, access first-party APIs with scoped permissions
2. **Token Vault** -- Manages OAuth flows with **30+ pre-integrated apps** (GitHub, Slack, Google Workspace, Salesforce, Spotify, etc.). Auto-pauses agent execution for authorization, stores tokens, resumes agent. Handles full token lifecycle.
3. **Asynchronous Authorization** -- CIBA-based human-in-the-loop approval via email or push notifications for sensitive actions
4. **Fine-Grained Authorization (FGA) for RAG** -- Users only see documents they have permission to access

**Supported frameworks:** LangChain, LlamaIndex, Cloudflare AI, Firebase Genkit, Vercel AI SDK

**Hackathon play:** If your agent acts on behalf of users in third-party services, Token Vault handles all OAuth complexity. Free tier = 2 connected apps.

**Speaker/Judge: Fred Patton** -- Senior Developer Advocate. Talks on "Ambient Agents on Next.js: Seven Levers for Token Efficiency."

---

### Bland AI -- Voice AI Phone Agents

Platform that automates phone calls with human-sounding AI. Three-model architecture: transcription -> language model -> TTS. Under 2 seconds latency.

**API capabilities:**
- Send a call in ~10 lines of code
- Live context injection into inbound calls
- Function calling during conversations (schedule meetings, send texts, update DBs mid-call)
- Call transcripts returned after each call
- Voice clones and custom voices
- Batch operations via CSV for mass outbound
- Pathways builder for complex branching conversations
- Memory across multiple calls with same contact
- Webhooks + integrations (Slack, HubSpot)
- SIP and Twilio support

**Install & Access:**
- **MCP Server:** `claude mcp add bland-ai --transport http https://docs.bland.ai/mcp` (INSTALLED)
- **CLI:** `npm install -g bland-cli` -> use `bland` command (v0.2.5 INSTALLED)
- **Shipable Skill:** `npx skills add spencerjsmall/bland-ai`
- **Docs:** docs.bland.ai
- **API:** `POST https://api.bland.ai/v1/calls` (needs `BLAND_API_KEY`)

**Speaker/Judge: Spencer Small** -- Head of Engineering. Brown CS grad. Previously at Respell and Analogue.

---

### Airbyte -- Data Pipelines & Agent Connectors

**Agent Connectors (key feature):** 50+ standalone Python SDK packages that let AI agents call third-party APIs with typed, documented tools. Run inside your agent loop, return results in real-time (not batch).

**Available connectors:** Salesforce, HubSpot, Linear, Google Ads, Facebook Marketing, Slack, Gmail, Twilio, Intercom, Asana, Notion, Jira, Confluence, Amplitude, Google Analytics, Shopify, Stripe, Zendesk, and many more.

**MCP Integration:**
- Airbyte Knowledge MCP -- semantic search over Airbyte docs
- PyAirbyte MCP Server -- manage connectors locally, generate pipelines from prompt
- Agent Engine (public beta) -- 600+ connectors, unified data handling, auto embeddings

**Install the skill:** `npx skills add airbytehq/airbyte-agent-connectors`
**Agent Connectors Repo:** github.com/airbytehq/airbyte-agent-connectors
**Docs:** docs.airbyte.com/ai-agents
**Platform:** app.airbyte.ai (free trial available)

**Prize: "Conquer with Context"**
- 1st place: $1,000 (Visa Gift Card) + **job interview**
- 2nd place: $500 (Visa Gift Card)
- 3rd place: $250 (Visa Gift Card)

**Speaker/Judge: Pedro Lopez** -- Senior Software Engineer. Previously at Grouparoo (acquired by Airbyte).

---

### Aerospike -- Real-Time Database for AI

Multi-model (key-value, document, graph, vector) database with sub-millisecond latency at massive scale.

**Key for agents:**
- **Vector Search (AVS):** HNSW indexes for RAG, semantic search, recommendations, memory retrieval. Self-healing live index.
- **Agent state:** Store step-by-step outputs, chain reasoning, resume workflows, avoid re-fetching
- **Performance:** Millions of ops/sec, sub-ms latency, scales to petabytes, 99.999% availability
- **SDKs:** Python, C, C#, Go, Java, Node.js, PHP, Rust. LangChain extension.
- **Distributed ACID transactions** (Aerospike 8)

**Judges:** Lucas Beeler (Solutions Architect, also Speaker), Harin Avvari (Software Developer), Jagrut Nemade (Software Engineer)

---

### TrueFoundry -- Ship & Observe Agents in Production

Kubernetes-native enterprise AI platform. Recognized in 2025 Gartner Market Guide for AI Gateways.

- **Agent deployment:** Containerizes agents from LangGraph, CrewAI, AutoGen, or custom frameworks
- **AI Agent Gateway:** Unified control plane for memory, tool usage, action planning, routing, rate limiting
- **Observability:** Framework-agnostic tracing of every step. OpenTelemetry -> Grafana, Datadog, Prometheus
- **GPU orchestration:** Fractional sharing, real-time autoscaling
- **MCP Gateway:** Recently launched for secure enterprise AI
- **Governance:** RBAC, audit logging, SOC 2/HIPAA/GDPR

**Speaker/Judge: Sai Krishna** -- Dev Rel @ TrueFoundry

---

### Overmind -- Continuous Agent Optimization

London-based startup, exited stealth February 2026 with 2M GBP seed. Founded by former intelligence community engineers.

- **Real-time agent supervision:** Monitors behavior, detects drift, intervenes before issues escalate
- **RL optimization:** Blocks unsafe actions while iteratively improving agent performance
- **Pattern-of-life analysis:** Translates real-world agent behavior into continuous improvement signals
- **Built for non-deterministic AI:** Unlike traditional security tools built for deterministic software

**Speaker/Judge: Tyler Edwards** -- CEO. 8 years building AI for MI5, MI6, GCHQ.
**Judge: Akhat Rakishev** -- CTO. Previously led ML infra at Monzo and Lyst.

---

### Macroscope -- Understanding Engine for Code

AI-powered code understanding and review platform. Founded by Kayvon Beykpour (ex-Twitter head of product). $40M total funding ($30M Series A, Lightspeed).

- **Deep code understanding via AST:** Traverses Abstract Syntax Tree, builds relationship/dependency graphs
- **AI code review:** Beats CodeRabbit, Cursor, Greptile, Graphite at bug detection
- **AI Agent (Q&A):** Natural language questions about codebases via Slack, GitHub, or API
- **Integrations:** GitHub, Slack, Jira, Linear, BigQuery, PostHog, LaunchDarkly
- **SOC 2 Type II**, no training on user source code

**Speaker/Judge: Rob Bishop** -- Co-founder. Sold Magic Pony Technology to Twitter in 2016.
**Judges:** Ikshita Puri (Software Engineer), Zhuolun Li (AI Engineer)

---

### TigerData (formerly Timescale)

Rebranded from Timescale in 2025. $180M raised, 3M+ active databases. Customers: Mistral, HuggingFace, Nvidia, Toyota, Tesla, NASA, JP Morgan Chase.

**"Agentic Postgres" features:**
- **Instant Database Forks:** Copy-on-write storage lets agents spin up isolated full-copy environments in seconds
- **MCP Server:** Structured database access with built-in expertise for schema design, query tuning, migrations
- **Native Search:** Combined BM25 full-text + semantic search (pgvectorscale) within Postgres
- **Tiger Lake:** Bridge between Postgres and the lakehouse

**Judges:** Justin Murray (Software Engineer), Isabel Macaulay (Marketing)

---

### Ghost (by TigerData/Timescale) -- The First Database Designed for Agents

**Website:** https://ghost.build
**GitHub:** https://github.com/timescale/ghost
**Twitter:** @ghostdotbuild
**Prize:** $1,998 cash for 1 team ($500 Visa gift card per team member)
**Parent Company:** TigerData (formerly Timescale) -- same company listed above

**What Ghost IS:** Ghost is a managed Postgres database platform built specifically for AI agents. It is NOT Ghost CMS (the blogging platform). Ghost provides "Spaces" -- bounded environments where agents can create unlimited Postgres databases and forks without usage-based billing or surprise costs. The key insight: agents need to create, fork, experiment with, and discard databases freely, like git branches for data.

**Tagline:** "Postgres databases for agents. Unlimited forks. Hard caps. No surprise bills."

**Key Features:**
- **Unlimited Databases:** Create as many Postgres databases as needed, instantly
- **Unlimited Forks:** Copy-on-write database forking (schema + data) in seconds -- agents can fork before risky operations, experiment on the fork, discard if it fails
- **Hard Spending Caps:** No surprise bills, no usage-based pricing anxiety
- **CLI & MCP Only:** No web dashboard, no UI, no console -- designed for agents and developers, not humans clicking around
- **Free Tier:** 100 compute hours/month, 1TB storage, unlimited databases and forks

**CLI Commands:**
- `ghost login` -- Authenticate via GitHub OAuth
- `ghost create` -- Create a new Postgres database (returns ID + connection string)
- `ghost fork <id>` -- Fork a database (full copy, schema + data)
- `ghost connect <id>` -- Get PostgreSQL connection string
- `ghost sql <id> "SQL"` -- Execute SQL directly
- `ghost schema <id>` -- Display database schema
- `ghost delete <id>` -- Delete a database
- `ghost pause <id>` / `ghost resume <id>` -- Pause/resume to save compute
- `ghost list` -- List all databases
- `ghost psql <id>` -- Interactive psql session
- `ghost mcp install` -- Install MCP server for agent integration

**MCP Integration (Critical for Hackathon):**
The Ghost MCP server gives agents full database lifecycle control without human intervention. Install with `ghost mcp install` (supports Claude Code, Cursor, Windsurf, Codex, Gemini, VS Code, Kiro).

MCP Tools exposed:
- `ghost_create` -- Create a database
- `ghost_fork` -- Fork a database
- `ghost_connect` -- Get connection string
- `ghost_sql` -- Execute SQL queries
- `ghost_schema` -- Inspect schema (LLM-optimized format)
- `ghost_list` -- List databases
- `ghost_delete` -- Delete a database
- `ghost_pause` / `ghost_resume` -- Pause/resume
- `ghost_logs` -- View logs
- `ghost_login` -- Agent self-authentication
- `ghost_password` -- Reset password
- `ghost_rename` -- Rename a database
- `search_docs` -- Search Ghost and Postgres documentation (built-in doc proxy)
- `view_skill` -- View documentation for specific topics

**Example Agent Workflow:**
```
# Agent creates a database for a new project
ghost create -> ID: abc123

# Agent gets connection string
ghost connect abc123 -> postgresql://ghost:***@name.ghost.build/postgres

# Agent forks to test schema changes safely
ghost fork abc123 -> ID: def456

# Agent runs migrations on the fork
ghost sql def456 "CREATE TABLE events (...)"

# If successful, delete the original and keep the fork
ghost delete abc123
```

**Installation:**
```bash
curl -fsSL https://install.ghost.build | sh
```

**Why Ghost Matters for the Hackathon:**
Ghost solves a fundamental problem for autonomous agents: they need persistent storage they can create and destroy freely. Traditional databases require human setup, have billing surprises, and don't support the "fork, experiment, discard" workflow agents need. Ghost makes databases as disposable as git branches.

**Use Cases That Would Win the Ghost Prize:**
1. **Agent with persistent memory** -- Agent stores learned knowledge, conversation context, or discovered patterns in Ghost databases, forking before risky schema changes
2. **Multi-agent collaboration** -- Each agent gets its own database fork, works independently, results merged back
3. **Self-improving agent** -- Agent creates databases to store its own performance metrics, learnings, and improvements over time
4. **Data pipeline agent** -- Agent ingests data from Airbyte/Tavily into Ghost databases, runs analysis, forks for different analytical approaches
5. **Safe experimentation** -- Agent forks production data, tries risky transformations on the fork, only promotes if successful
6. **Hybrid search agent** -- Uses Ghost's native Postgres hybrid search (BM25 + semantic via pgvectorscale) for RAG

**Devpost Prize Requirements:** The Devpost listing says "Best Use of Ghost" -- $1,998 in cash, 1 winner, $500 Visa gift card for each team member. No additional specific requirements listed beyond demonstrating effective use of Ghost in your project.

---

### Tavily -- AI Search API

Leading AI search API for agents. $25M raised (Aug 2025). 1M+ monthly downloads.

- **Search API:** Configurable depth, domain filtering, time-range filtering
- **Extract API:** Clean markdown from URLs, handles JS-rendered pages
- **Research API:** Deep end-to-end web research in one API call -- outperforming OpenAI and Perplexity on DeepResearch Bench
- **Security:** SOC 2, zero data retention, AI security layer scanning for prompt injection
- **Framework support:** LangChain, LlamaIndex, MCP

**Judge: Sofia Guzowski** -- Partnerships & Community Lead

---

### Letta (formerly MemGPT)

Platform for stateful AI agents with persistent memory. $10M raised. #1 model-agnostic open-source agent on Terminal-Bench.

**LLM-as-Operating-System architecture:**
- **Core Memory (RAM):** In-context read/write memory
- **Archival Memory (Disk):** External long-term storage
- **Recall Memory:** Searchable conversation history
- Agents autonomously move data between tiers

**Recent:** Conversations API (Jan 2026), Remote Environments (Mar 2026), Letta Evals

**Judge: Devansh Jain** -- Research @ Letta, focused on agent memory and statefulness

---

## All Judges at a Glance

| Judge | Role | What They Care About |
|---|---|---|
| **Jon Turdiev** | Sr. Solutions Architect, Startups @ AWS | Architectural quality, AWS integration, production-readiness. Frequent SF hackathon judge (8+ events). |
| **Rakesh Kumar** | GTM Lead, AI for Startups @ AWS | Market potential, go-to-market viability, business value. Finance background (USC Marshall, UBS). |
| **Aidin Khosrowshahi** | Sr. Solution Architect @ AWS | Technical architecture and AWS service usage. |
| **Spencer Small** | Head of Engineering @ Bland | Voice AI creativity, technical implementation. Brown CS. |
| **Lucca Psaila** | Customer Engineer @ Bland | Voice AI integration quality and user experience. |
| **Sai Krishna** | Dev Rel @ TrueFoundry | Agent deployment, observability, production-readiness. |
| **Juhi Parekh** | AI PM @ Turing | Product sense, UX, real-world applicability. Built 0-to-1 AI at Apple, Amazon, Samsung. Kellogg MBA. Angel investor. |
| **Huitang Yang** | AI Interaction Engineer | Interaction design quality. |
| **Harin Avvari** | Software Developer @ Aerospike | Real-time database integration, data modeling. |
| **Lucas Beeler** | Solutions Architect @ Aerospike | Aerospike usage, agent memory/state patterns. |
| **Jagrut Nemade** | Software Engineer @ Aerospike | Technical implementation with Aerospike. |
| **Tyler Edwards** | CEO @ Overmind | Agent safety, supervision, RL optimization. 8 yrs MI5/MI6/GCHQ. |
| **Akhat Rakishev** | CTO @ Overmind | ML infra, agent optimization. Ex-Monzo, ex-Lyst. |
| **Rob Bishop** | Co-founder @ Macroscope | Code understanding, AST-based analysis. Sold Magic Pony to Twitter. |
| **Ikshita Puri** | Software Engineer @ Macroscope | Code understanding tech. |
| **Zhuolun Li** | AI Engineer @ Macroscope | AI engineering quality. |
| **Sofia Guzowski** | Partnerships @ Tavily | Web search/research integration quality. |
| **Justin Murray** | Software Engineer @ TigerData | Database integration, agentic Postgres. |
| **Isabel Macaulay** | Marketing @ TigerData | Storytelling, product positioning. |
| **Pedro Lopez** | Sr. Software Engineer @ Airbyte | Data pipeline integration, connector usage. |
| **Patrick Nilan** | Software Engineer @ Airbyte | Technical implementation with Airbyte. |
| **Divyarani Raghupatruni** | Sr. Director of Product @ Alacriti | Data orchestration, fintech, payments. 15+ yrs, ex-Block/Square. |
| **Sahil Sachdeva** | Sr. SWE @ LinkedIn | System design, scalability, distributed systems. USC MS CS. |
| **Devansh Jain** | Research @ Letta | Agent memory, statefulness, learning over time. |
| **Fred Patton** | Sr. Developer Advocate @ Auth0 | Identity/auth integration, token management for agents. |

---

## CHOSEN BUILD: Personal Stock Guardian

> "It watches your stocks 24/7 and calls you when something matters — explained in plain English."

**Sponsors:** Airbyte (data) + Auth0 (identity/watchlist) + Aerospike (memory/patterns) + Ghost (personal feed) + Bland AI (phone calls)
**Prize tracks:** Airbyte ($1K/$500/$250), Ghost ($1,998), Bland ($500), Aerospike ($650), Auth0 ($1,750) = up to **$5,898**
**Hero moment:** Phone rings live during demo. AI explains an insider sale specific to YOUR holdings.
**Why it wins:** Every judge trades stocks or knows someone who does. Instant relatability. Zero jargon.

---

## Strategic Insights

**The challenge is "Context Engineering" -- agents that are alive, adaptive, and self-improving.** Everything below serves that framing.

1. **Context engineering is the meta-game** -- The challenge explicitly says "tap into real-time data sources, make sense of what they find, and take meaningful action." Your agent must demonstrate a clear data -> understanding -> action pipeline. This is the throughline judges will evaluate.
2. **Self-improvement is not optional** -- "Continuously learn and improve as they operate" is in the challenge description. Your agent MUST show it gets better over time -- storing outcomes in Aerospike, adjusting strategy based on past results, building knowledge across runs. This is where Letta judge Devansh Jain will focus.
3. **Integrate 3+ sponsor tools effectively** -- Minimum 3, but "effectively" is the key word. Each tool must serve a clear, load-bearing purpose in the context engineering pipeline. Don't import for show.
4. **Maximize autonomy on real-time data** -- Multi-step planning, self-correction, live data ingestion, no hand-holding. The agent acts on data that wasn't available when it started.
5. **Show product sense** -- Judges like Juhi Parekh (PM at Apple/Amazon) and Rakesh Kumar (GTM) want real problems, not tech demos. "Meaningful problem" and "real-world value" are the exact words.
6. **Target multiple prize tracks** -- Structure rewards breadth. One agent touching Auth0 + Airbyte + Aerospike competes for 3 prizes.
7. **Nail the 3-minute demo** -- Live demo > slides. Clear narrative: problem -> solution -> live agent running autonomously -> wow moment -> impact. Show the agent learning/adapting in real-time if possible.

### Product Design Principles (from PRODUCT-DESIGN-PLAYBOOK.md)

8. **ONE problem, ONE persona, ONE hero moment** -- The #1 critique from every mentor/judge: "You're mixing too many problems and solutions." Don't let 8 sponsor integrations create 8 shallow features. Every tool serves the ONE story.
9. **The Hero Moment Test** -- "If it's not FUCK YES, it's FUCK NO." That is the bar. Your demo needs ONE moment where judges lean forward. If they say "that's cool" with no follow-up, you missed. If they ask "is this on GitHub? can I try it?", you won.
10. **Three Screens, Not Thirty** -- Build 3 screens: (1) the hook/problem, (2) the agent acting autonomously, (3) the resolution where the user feels the value. Not a dashboard with six tabs.
11. **Wizard of Oz the hard parts** -- "If you can't build and test this with a real customer in a half day, you're not pushing hard enough on Wizard-of-Oz thinking." Fake what you can't build in 5.5 hours. Polish the demo. Judges score the experience, not the GitHub repo.
12. **Benefits, not mechanisms** -- "Users care about benefits. They don't care about how it works." Lead with impact, save architecture for the last 30 seconds of the demo.
13. **Talk to sponsors/judges first** -- The playbook says the biggest product insights come from the first 10 minutes of conversation, not from the prototype. Talk to 1-2 judges in the first hour. Adapt before you code.
