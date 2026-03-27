# 5 Winning Ideas -- Deep Agents Hackathon RSAC 2026

## The Challenge: Context Engineering

> **Build agents that don't just think -- they act.** Build infrastructure for autonomous, self-improving AI agents that tap into real-time data sources, make sense of what they find, and take meaningful action without human intervention. Showcase how they **continuously learn and improve** as they operate -- solutions that feel **alive, adaptive, and built for real-world impact**.

> Strategy: Each idea integrates 4+ sponsor tools, targets multiple prize tracks, demonstrates **context engineering** (data -> understanding -> action), shows **self-improvement** (agents that learn from each run), and is scoped to be buildable in 5.5 hours.

---

## CHOSEN BUILD: "Personal Stock Guardian" -- Your Portfolio, Watched

### The Pitch
An autonomous agent that monitors SEC filings, news, and sentiment for YOUR specific portfolio. When it detects something significant, it writes a plain-English analysis, publishes it to your personal feed, and **calls your phone** to explain what it means for YOU.

> "Hey, I'm watching NVIDIA for you. The CFO just sold $12 million in stock — that's unusual because she hasn't sold anything in 22 months and this wasn't part of her scheduled plan. Historically when NVIDIA insiders do this, the stock drops an average of 9% over the next 30 days."

### Why This Is The One

- **Every judge gets it instantly.** They all trade stocks or know someone who does. Zero explanation needed.
- **Hero Moment Test: PASSED.** Phone rings live. AI explains an insider sale specific to YOUR holdings. That's not "cool" — that's "holy fuck."
- **ONE problem:** "Critical signals about YOUR stocks get buried in noise and nobody explains what they mean for you."
- **ONE persona:** Anyone with a brokerage account.
- **ONE hero moment:** The phone rings. The AI knows your portfolio. It explains in plain English.
- **The plain-English sentence IS the product.** Everything else is infrastructure to deliver it.

### Sponsor Integration (5 tools, all load-bearing)

| Sponsor | Role | Why It Matters |
|---|---|---|
| **Airbyte** | Pull SEC filings, news feeds, sentiment | The eyes — real-time data pipeline |
| **Auth0** | User signup, portfolio watchlist, phone # | The front door — identity tied to YOUR holdings |
| **Aerospike** | Signal dedup, historical patterns, agent memory | The memory — "last time this happened, stock dropped 9%" |
| **Ghost** | Agent's persistent Postgres DB — watchlists, signals, learnings | The brain's storage — fork before risky ops, query past signals |
| **Bland AI** | Phone call with personalized explanation | The hero moment — phone rings, AI explains |

### Context Engineering Pipeline

```
REAL-TIME DATA (Airbyte)
  SEC Form 4 filings, earnings, news, sentiment
       │
IDENTITY (Auth0)
  User's watchlist: AAPL, TSLA, NVDA
  Alert sensitivity: "only call for major events"
       │
DETECTION + SCORING (Bedrock/Claude)
  "Is this significant? Does it affect THIS user's stocks?"
  Score against historical patterns in Aerospike
       │
PLAIN-ENGLISH GENERATION (Claude) ← THIS IS THE PRODUCT
  "The CFO just sold $12M — her first sale in 2 years..."
       │
STORE + FORK (Ghost DB)
  Agent stores signal, analysis, score in its own Postgres DB
  Forks DB before experimental analysis, keeps if successful
       │
PATTERN MATCH (Aerospike)
  Vector similarity: "this matches 3 past insider sales"
  Dedup: don't alert on the same signal twice
       │
CALL (Bland AI)
  Phone rings. AI explains. User asks questions.
       │
LEARN (Ghost DB + Aerospike)
  Store outcome. Fork DB to try new scoring weights.
  Next time: "historically, this leads to..."
  Agent gets smarter with every signal.
```

### Prize Tracks: up to $6,398+
- Ghost ($1,998 cash + $500/member Visa gift card)
- Auth0 ($1,750)
- Airbyte ($1,000/$500/$250 + job interview)
- Auth0 ($1,750)
- Aerospike ($650)
- Bland ($500 "Most Ab-Norm-al")

### Build Plan (5.5 hours)

```
Hour 1: Foundation + sponsor conversations
Hour 2: Core agent + scoring engine + plain-English generator
Hour 3: Output pipeline (Ghost + Bland + Auth0 flow)
Hour 4: Self-improvement loop + polish + Wizard of Oz
Hour 5: Demo prep (rehearse 3x, backup video, Devpost)
```

### Demo Script (3 min)
```
0:00-0:20  Problem: "I own Tesla and NVIDIA. Insider transactions
            happen 24/7. By the time I see it on CNBC, it's too late."
0:20-0:40  Solution: Show app. Enter watchlist. "Personal Stock Guardian
            watches YOUR stocks, calls you when something matters."
0:40-1:40  AUTONOMY: Agent pulls SEC data, detects insider sale, scores it,
            generates plain-English explanation, publishes to Ghost feed.
            ALL AUTONOMOUS. Don't touch anything.
1:40-2:10  HERO MOMENT: Phone rings. AI explains the sale. "Want to know
            more?" Say yes. It goes deeper. Jaws drop.
2:10-2:40  DEPTH: "5 sponsors: Airbyte for data, Auth0 for identity,
            Aerospike for patterns, Ghost for the agent's database, Bland for the call.
            The agent learns — it said 'historically' because it remembers."
2:40-3:00  CLOSE: "Nothing calls your phone, knows your holdings, and
            explains in plain English. Personal Stock Guardian."
```

---

## Previous Ideas (for reference)

## Idea 1: "VulnHunter" -- Autonomous Security Vulnerability Response Agent

### The Pitch
An autonomous agent that monitors your codebase for security vulnerabilities, researches each one across CVE databases and exploit feeds, triages by severity using real-time threat intelligence, then generates and submits verified patches -- all without human intervention. **Perfect for RSAC (the world's biggest security conference).**

### Why This Wins
- **RSAC alignment** -- This is a security conference hackathon. A security agent will resonate with every judge in the room.
- **Deep autonomy** -- The agent runs a full loop: detect -> research -> triage -> patch -> verify -> PR. No hand-holding.
- **Real-world pain** -- Every company drowns in CVEs. This solves a $10B+ problem.

### Architecture
```
[Macroscope] --AST analysis--> Vulnerability Detection
       |
[Tavily Search API] --CVE/NVD research--> Threat Intel Enrichment
       |
[Aerospike] --vector store--> Vulnerability Knowledge Base + Agent Memory
       |
[Amazon Bedrock] --multi-agent--> Triage Agent + Patch Agent + Verification Agent
       |
[Auth0 Token Vault] --OAuth--> GitHub API (create branches, submit PRs)
       |
[Kiro] --spec-driven--> Patch Generation & Test Writing
       |
[TrueFoundry] --observability--> Agent Trace Dashboard
       |
[Overmind] --supervision--> Safety Rails (prevent dangerous patches)
```

### Sponsor Integration (7 tools)
| Sponsor | Usage |
|---|---|
| **Macroscope** | AST-based code scanning to identify vulnerability patterns and dependency relationships |
| **Amazon Bedrock** | Multi-agent orchestration: supervisor coordinates triage, research, and patch agents |
| **Aerospike** | Vector store for CVE embeddings + agent memory for tracking remediation state |
| **Auth0** | Token Vault for GitHub OAuth (reading repos, creating PRs) |
| **TrueFoundry** | Deploy agents with full observability tracing |
| **Overmind** | Supervision layer ensuring patches don't introduce new vulnerabilities |
| **Kiro** | Use as the IDE for building, with agent hooks for auto-testing patches |

### Prize Tracks Targeted
- Macroscope ($1,000)
- Aerospike ($650)
- Overmind ($651 + mystery)
- TrueFoundry ($600)
- Kiro (42K credits)

### Demo Script (3 min)
1. (0:00-0:30) "Every day, new CVEs drop and security teams are overwhelmed. VulnHunter autonomously hunts, triages, and patches vulnerabilities."
2. (0:30-1:30) Live demo: Point agent at a repo with known vulnerabilities. Show it detecting issues via Macroscope, researching CVEs via web search, storing findings in Aerospike.
3. (1:30-2:30) Show multi-agent collaboration: triage agent prioritizes critical vulns, patch agent generates fixes, verification agent runs tests. Overmind dashboard shows supervision in real-time.
4. (2:30-3:00) Show the auto-generated PR on GitHub (via Auth0 Token Vault) with full context, test results, and CVE references. "What took a team days now takes minutes."

---

## Idea 2: "DealFlow" -- Autonomous Sales Intelligence & Outreach Agent

### The Pitch
An agent that autonomously monitors your CRM, identifies at-risk deals and high-potential leads, researches prospects across the web, drafts personalized outreach, and makes actual phone calls to schedule meetings -- closing the loop from data to conversation with zero human effort.

### Why This Wins
- **Massive market** -- Sales automation is a proven billion-dollar category. Rakesh Kumar (GTM specialist judge) will immediately see the business value.
- **Full-stack autonomy** -- Data ingestion -> analysis -> research -> written outreach -> voice calls. Touches every modality.
- **Voice differentiator** -- Most hackathon projects are text-only. Having an agent that actually picks up the phone and calls people is a showstopper demo moment.

### Architecture
```
[Airbyte Agent Connectors] --real-time--> Pull from Salesforce/HubSpot CRM
       |
[Aerospike] --state store--> Deal tracking + prospect embeddings + agent memory
       |
[Amazon Bedrock] --reasoning--> Deal scoring, risk analysis, prospect research
       |
[Tavily Search API] --web research--> Company news, LinkedIn, funding rounds
       |
[Auth0 Token Vault] --OAuth--> CRM write-back, Gmail/Slack for outreach
       |
[Bland AI] --voice agent--> Automated prospect calls with live context injection
       |
[TrueFoundry] --observability--> Pipeline monitoring dashboard
```

### Sponsor Integration (6 tools)
| Sponsor | Usage |
|---|---|
| **Airbyte** | Agent connectors pull real-time CRM data (Salesforce/HubSpot) |
| **Aerospike** | Vector search for similar past deals + agent state tracking |
| **Amazon Bedrock** | Multi-step reasoning for deal scoring and prospect analysis |
| **Auth0** | Token Vault for CRM OAuth + Gmail for email outreach |
| **Bland AI** | Voice agent makes actual phone calls to prospects with context |
| **TrueFoundry** | Deployment and monitoring of the full pipeline |

### Prize Tracks Targeted
- Airbyte ($1,000/$500/$250 + job interview)
- Auth0 ($1,750)
- Bland ($500)
- Aerospike ($650)
- TrueFoundry ($600)

### Demo Script (3 min)
1. (0:00-0:30) "Your sales team spends 70% of their time on research and admin, not selling. DealFlow is an autonomous sales agent that goes from data to phone call."
2. (0:30-1:00) Show Airbyte pulling live CRM data, agent identifying a stale deal and a hot lead. Aerospike storing deal embeddings.
3. (1:00-1:45) Agent researches the prospect via web search, finds their company just raised funding, drafts personalized outreach, sends email via Auth0-authenticated Gmail.
4. (1:45-2:30) THE SHOWSTOPPER: Agent triggers Bland AI to call the prospect's phone. Play audio of the AI having a natural conversation, injecting live context about the deal. Agent books a meeting.
5. (2:30-3:00) Dashboard shows full pipeline observability via TrueFoundry. "From data to booked meeting, zero human touch."

---

## Idea 3: "ComplianceOps" -- Autonomous Regulatory Compliance Agent for Fintech

### The Pitch
An agent that continuously monitors regulatory feeds, maps new requirements to your existing codebase and data infrastructure, identifies compliance gaps, generates implementation plans, and auto-remediates -- turning weeks of compliance work into hours. **Built for the fintech/payments reality that RSAC attendees live in.**

### Why This Wins
- **Judge alignment** -- Divyarani Raghupatruni (ex-Block/Square, fintech) will champion this. Tyler Edwards (MI5/MI6 background) understands compliance. Rakesh Kumar (finance background) gets the business case.
- **RSAC context** -- Compliance is THE pain point for security professionals at RSAC.
- **Deeply autonomous** -- Multi-step: monitor regs -> interpret requirements -> scan code -> identify gaps -> generate remediation -> verify compliance.
- **Enterprise-grade credibility** -- Uses Overmind for safety (agents modifying compliance-critical code need supervision).

### Architecture
```
[Tavily Research API] --deep research--> Monitor regulatory feeds (SEC, PCI-DSS, SOX, GDPR)
       |
[Amazon Bedrock] --multi-agent--> Regulatory Interpreter + Gap Analyst + Remediation Agent
       |
[Macroscope] --AST analysis--> Map requirements to codebase implementation
       |
[Airbyte] --connectors--> Pull data from Jira/Confluence for existing compliance docs
       |
[Aerospike] --vector + KV--> Regulatory knowledge base + compliance state tracking
       |
[Auth0 FGA] --fine-grained auth--> Ensure only authorized roles can approve changes
       |
[Overmind] --supervision--> Prevent unauthorized compliance-critical modifications
       |
[TrueFoundry] --deploy + observe--> Production monitoring with audit trail
```

### Sponsor Integration (7 tools)
| Sponsor | Usage |
|---|---|
| **Amazon Bedrock** | Multi-agent system: interpreter, gap analyst, remediator |
| **Macroscope** | AST-based code analysis to map regulations to implementations |
| **Airbyte** | Pull existing compliance docs from Jira/Confluence |
| **Aerospike** | Vector store for regulatory embeddings + compliance state |
| **Auth0** | FGA ensuring only authorized approvals + Token Vault for integrations |
| **Overmind** | Supervision ensuring agents don't make unauthorized compliance changes |
| **TrueFoundry** | Deployment with full audit trail observability |

### Prize Tracks Targeted
- Auth0 ($1,750)
- Airbyte ($1,000/$500/$250 + job interview)
- Macroscope ($1,000)
- Overmind ($651 + mystery)
- Aerospike ($650)
- TrueFoundry ($600)

### Demo Script (3 min)
1. (0:00-0:30) "New regulations drop every week. Compliance teams spend months mapping them to code. ComplianceOps does it autonomously."
2. (0:30-1:15) Show agent detecting a new PCI-DSS requirement via research. It interprets the regulation, then uses Macroscope to scan the codebase for affected areas.
3. (1:15-2:00) Agent identifies 3 compliance gaps, pulls existing docs from Jira via Airbyte, cross-references with regulatory knowledge in Aerospike. Generates remediation plan.
4. (2:00-2:30) Show Auth0 FGA blocking an unauthorized approval attempt. Then authorized user approves, Overmind supervision dashboard shows safe execution.
5. (2:30-3:00) Full audit trail in TrueFoundry. "From regulation to remediation, fully autonomous, fully auditable."

---

## Idea 4: "Incident Commander" -- Autonomous On-Call Incident Response Agent

### The Pitch
An agent that detects production incidents, investigates root causes across logs/metrics/code, pages the right people via voice call, coordinates the response in Slack, generates and deploys hotfixes, and writes the postmortem -- turning a 2AM scramble into an autonomous resolution pipeline.

### Why This Wins
- **Universal pain** -- Every engineer has been woken up at 2AM. This is viscerally relatable to every technical judge.
- **Full autonomy loop** -- Detect -> investigate -> page -> coordinate -> fix -> document. The most end-to-end autonomous agent possible.
- **Voice + text multimodal** -- Using Bland AI to actually call the on-call engineer with context is an unforgettable demo moment.
- **Technical depth** -- Sahil Sachdeva (LinkedIn SWE, distributed systems) will appreciate the system design.

### Architecture
```
[Airbyte Agent Connectors] --real-time--> Pull from PagerDuty, Datadog, Slack
       |
[Amazon Bedrock] --multi-agent--> Detection Agent + Investigation Agent + Remediation Agent
       |
[Macroscope] --AST + Q&A--> "What changed recently?" Code archaeology for root cause
       |
[Aerospike] --vector + KV--> Past incident embeddings + runbook retrieval + agent state
       |
[Bland AI] --voice calls--> Page on-call engineer with full incident context
       |
[Auth0] --Token Vault--> OAuth into GitHub (deploy fix), Slack (coordinate), PagerDuty
       |
[Overmind] --supervision--> Prevent agent from deploying dangerous hotfixes
       |
[TrueFoundry] --observability--> Full incident response trace
```

### Sponsor Integration (7 tools)
| Sponsor | Usage |
|---|---|
| **Amazon Bedrock** | Multi-agent: detection, investigation, remediation with supervisor |
| **Airbyte** | Real-time connectors to PagerDuty, Datadog, Slack |
| **Macroscope** | Code archaeology -- "what recent changes could have caused this?" |
| **Aerospike** | Vector search over past incidents + runbook retrieval |
| **Bland AI** | Voice calls to on-call with synthesized incident briefing |
| **Auth0** | Token Vault for GitHub, Slack, PagerDuty OAuth |
| **Overmind** | Safety rails preventing dangerous automated deployments |

### Prize Tracks Targeted
- Auth0 ($1,750)
- Airbyte ($1,000/$500/$250 + job interview)
- Bland ($500)
- Macroscope ($1,000)
- Aerospike ($650)
- Overmind ($651 + mystery)

### Demo Script (3 min)
1. (0:00-0:30) "It's 2AM. Your API is down. Incident Commander is already on it."
2. (0:30-1:15) Simulate an incident. Agent detects anomaly via Airbyte + monitoring data, investigates by querying Aerospike for similar past incidents, uses Macroscope to find the recent code change that caused it.
3. (1:15-2:00) THE MOMENT: Agent calls the on-call engineer via Bland AI. Play the audio: "Hi, this is Incident Commander. We've detected a P1 in the payments service. Root cause appears to be commit abc123 from yesterday. I've drafted a hotfix and I'm coordinating in Slack. Do you want me to proceed?" Engineer says yes.
4. (2:00-2:30) Agent deploys hotfix via GitHub (Auth0 Token Vault), updates Slack channel, resolves PagerDuty. Overmind dashboard shows supervised execution.
5. (2:30-3:00) Auto-generated postmortem with timeline, root cause, and remediation. "From alert to resolution, fully autonomous."

---

## Idea 5: "Votal" -- Autonomous Threat Intelligence & Attack Surface Monitor

### The Pitch
An agent that continuously maps your organization's attack surface, monitors dark web/threat feeds for mentions of your assets, cross-references with your codebase for exploitable patterns, generates risk scores backed by real evidence, and autonomously hardens your defenses -- an always-on red team that actually fixes what it finds. **The quintessential RSAC project.**

### Why This Wins
- **RSAC is a SECURITY conference** -- This is THE most on-theme project possible. Every attendee, sponsor, and judge lives in the security world.
- **Deepest autonomy** -- The agent doesn't just alert; it researches, correlates, triages, and remediates. It's a "10 layers deep" research agent (exactly what the hackathon description asks for).
- **Novel combination** -- Threat intel + code analysis + auto-remediation hasn't been done well by anyone. This is frontier.
- **Tyler Edwards (Overmind CEO, ex-MI5/MI6/GCHQ)** will be personally invested in this project's success.

### Architecture
```
[Tavily Research API] --deep research--> Dark web monitoring, threat feeds, CVE databases, OSINT
       |
[Amazon Bedrock] --multi-agent-->
  ├── Reconnaissance Agent: Maps attack surface
  ├── Threat Intel Agent: Correlates threats to assets
  ├── Code Analysis Agent: Finds exploitable patterns
  └── Hardening Agent: Generates and applies fixes
       |
[Macroscope] --AST analysis--> Deep code scanning for vulnerability patterns, dependency graphs
       |
[Aerospike] --vector + graph-->
  ├── Threat intel embeddings for similarity search
  ├── Asset graph for attack surface mapping
  └── Agent memory for continuous learning
       |
[Airbyte] --connectors--> Pull from Jira (security tickets), Slack (security channels)
       |
[Auth0] --FGA + Token Vault-->
  ├── Fine-grained authorization for sensitive security operations
  └── OAuth for GitHub, Slack, Jira integrations
       |
[Overmind] --supervision-->
  ├── Prevent agent from exposing sensitive findings
  ├── Ensure remediation doesn't break production
  └── RL optimization of threat detection accuracy
       |
[TrueFoundry] --deploy + observe--> Full security audit trail with compliance logging
       |
[Bland AI] --voice alerts--> Call security team for critical P0 threats
```

### Sponsor Integration (8 tools -- MAXIMUM coverage)
| Sponsor | Usage |
|---|---|
| **Amazon Bedrock** | 4-agent system with supervisor: recon, threat intel, code analysis, hardening |
| **Macroscope** | AST-based vulnerability scanning + dependency graph analysis |
| **Aerospike** | Vector store for threat intel + graph for attack surface + agent memory |
| **Airbyte** | Real-time connectors to Jira, Slack for security context |
| **Auth0** | FGA for sensitive ops + Token Vault for all integrations |
| **Overmind** | Full supervision layer + RL optimization of detection |
| **TrueFoundry** | Production deployment with compliance-grade observability |
| **Bland AI** | Voice alerts for critical threats |

### Prize Tracks Targeted (EVERY major track)
- Auth0 ($1,750)
- Airbyte ($1,000/$500/$250 + job interview)
- Macroscope ($1,000)
- Overmind ($651 + mystery)
- Aerospike ($650)
- TrueFoundry ($600)
- Bland ($500)
- Kiro (42K credits)

### Demo Script (3 min)
1. (0:00-0:30) "Your attack surface is growing faster than your security team. Votal is an autonomous threat intelligence agent that finds, researches, and fixes vulnerabilities before attackers can exploit them."
2. (0:30-1:15) Point agent at a target repo. Show recon agent mapping the attack surface. Threat intel agent finds a relevant CVE trending on exploit feeds (via Tavily). Code analysis agent uses Macroscope to find the exact vulnerable code path.
3. (1:15-2:00) Agent correlates with Aerospike vector store: "This pattern matches 3 past exploits." Risk score generated. Airbyte pulls related Jira security tickets showing this was flagged but never fixed.
4. (2:00-2:30) Hardening agent generates a fix. Overmind supervision ensures the fix is safe. Auth0 FGA requires senior engineer approval (CIBA push notification). Phone rings via Bland AI: "Critical P0 threat detected in payments service. Patch ready for approval."
5. (2:30-3:00) Fix deployed. Full audit trail in TrueFoundry. Aerospike memory updated so agent learns. "Always watching. Always learning. Always hardening."

---

## Recommendation: Which Idea to Build

**Remember the challenge: Context Engineering -- agents that are alive, adaptive, self-improving.**

| Criteria | VulnHunter | DealFlow | ComplianceOps | Incident Commander | Votal |
|---|---|---|---|---|---|
| RSAC Alignment | High | Low | High | Medium | **Highest** |
| Context Engineering | High | High | High | **Highest** | **Highest** |
| Self-Improvement | Medium | High | Medium | High | **Highest** |
| Autonomy on Real-Time Data | High | **Highest** | High | **Highest** | **Highest** |
| Demo Impact | Good | **Great** (voice) | Good | **Great** (voice) | **Great** (voice + security) |
| Sponsor Coverage | 7 tools | 6 tools | 7 tools | 7 tools | **8 tools** |
| Prize Tracks | 5 | 5 | 6 | 6 | **8** |
| Build Feasibility (5.5h) | Medium | Medium | Hard | Medium | Hard |
| Judge Appeal | High | Medium | High | High | **Highest** |

### Top Pick: **Idea 5 "Votal"** or **Idea 4 "Incident Commander"**

**Go with Votal** if you want maximum RSAC alignment, maximum sponsor coverage, and maximum prize track eligibility. It's the hardest to build but the highest ceiling. The self-improving threat intel loop (each scan makes the next one smarter via Aerospike memory) is the strongest "context engineering" story.

**Go with Incident Commander** if you want the most demo-able, universally relatable agent with a guaranteed "wow" moment (the phone call). Slightly easier to build, still hits 7 tools and 6 prize tracks. The context engineering angle: agent learns from each incident to resolve the next one faster.

**Fallback: Idea 1 "VulnHunter"** is the safest bet -- clear scope, clear demo, strong security theme, easier to build in 5.5 hours.

### The Winning Formula (Context Engineering + Product Design)

**From the Challenge:**
1. **"Tap into real-time data sources"** -- Airbyte connectors, Tavily search, live APIs feeding the agent
2. **"Make sense of what they find"** -- Multi-agent reasoning via Bedrock, Macroscope code analysis, Aerospike vector correlation
3. **"Take meaningful action"** -- Auth0-authenticated PRs, Bland AI phone calls, automated deployments
4. **"Continuously learn and improve"** -- Aerospike stores outcomes; each run makes the agent smarter. Show a before/after in the demo.
5. **"Alive, adaptive, built for real-world impact"** -- Live demo, not slides. Real data, not mocks. The agent adapts mid-run.

**From the Product Design Playbook (CRITICAL):**
6. **ONE problem, ONE persona, ONE hero moment.** The #1 feedback from every mentor/judge: "You're mixing too many problems." Don't let 8 sponsor tools dilute your story into 8 shallow features. Every tool serves the ONE moment.
7. **The Hero Moment Test:** "If it's not FUCK YES, it's FUCK NO." Your demo needs ONE moment where judges lean forward -- the phone ringing, the PR appearing, the threat score dropping to zero. If judges say "that's cool" with no follow-up, you failed. If they ask "is this on GitHub?", you won.
8. **Three Screens, Not Thirty.** Build 3 screens: (1) the problem/hook, (2) the agent acting, (3) the resolution/value. Not a dashboard with six tabs.
9. **Wizard of Oz the hard parts.** You have 5.5 hours. Fake what you can't build. Polish the demo experience. "AI with Claude Code Wizard-of-Oz's things so well -- fake databases, live data, animations. WAY more valuable than building the real thing."
10. **Benefits, not mechanisms.** Lead with "your security team sleeps through the night," not "we use Bedrock multi-agent orchestration with HNSW vector indexes." Save the architecture trace for the last 30 seconds.
11. **Talk to sponsors first.** Biggest insights come from conversations, not code. Talk to 1-2 judges in the first hour. Adapt before you build.
