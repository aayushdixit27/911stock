export default function StackPage() {
  const keep = [
    { layer: "Frontend", current: "Next.js 16 + React 19 + Tailwind 4", verdict: "Best full-stack framework, largest ecosystem. No reason to switch." },
    { layer: "Database", current: "PostgreSQL via Ghost", verdict: "Agent-native workflow, unlimited forks, hard cost caps. Solid." },
    { layer: "Auth", current: "SMS Approval (replacing Auth0)", verdict: "Simpler, faster, no Guardian enrollment friction. See decision below." },
    { layer: "SEC Data", current: "EDGAR API + Alpha Vantage", verdict: "EDGAR is the authoritative source. Current Form 4 parser is well-built." },
    { layer: "Trading", current: "Alpaca Paper Trading", verdict: "Commission-free, excellent dev experience. Right choice for MVP." },
    { layer: "Deployment", current: "Vercel", verdict: "World-class for Next.js, instant previews. Keep for frontend." },
  ];

  const changes = [
    {
      title: "Voice: Bland AI \u2192 Retell AI",
      priority: "HIGH",
      reason: "Judges flagged the voice \u201Csounds like a scam.\u201D This directly fixes the #1 objection.",
      rows: [
        { dim: "Cost", from: "$0.09/min", to: "$0.07/min (\u221222%)" },
        { dim: "Latency", from: "~800ms", to: "500\u2013600ms (\u221233%)" },
        { dim: "Phone #s", from: "$15/mo", to: "$2/mo" },
        { dim: "Voice quality", from: "Robotic, long pauses", to: "Natural, latest LLM integration" },
      ],
    },
    {
      title: "Background Jobs: node-cron \u2192 Inngest",
      priority: "HIGH",
      reason: "node-cron runs in-memory \u2014 if the server restarts, scheduled jobs vanish. Dangerous for financial operations.",
      rows: [
        { dim: "Persistence", from: "None (in-memory)", to: "Durable, step-based" },
        { dim: "Retries", from: "None", to: "Automatic per-step" },
        { dim: "Dead-letter queue", from: "No", to: "Yes" },
        { dim: "Free tier", from: "N/A", to: "50,000 runs/mo" },
      ],
    },
    {
      title: "LLM: Gemini \u2192 Claude",
      priority: "MEDIUM",
      reason: "TrueFoundry gateway abstracts the model \u2014 nearly a config change. Superior financial reasoning and data privacy.",
      rows: [
        { dim: "Financial reasoning", from: "Good", to: "83% accuracy on complex modeling" },
        { dim: "Data privacy", from: "Google policies", to: "Never trains on user data" },
        { dim: "Switching cost", from: "\u2014", to: "Change model ID in gateway" },
      ],
    },
  ];

  const later = [
    {
      label: "SnapTrade",
      desc: "Single API to connect 125M+ accounts across Robinhood, Schwab, Fidelity, IBKR. Changes the product from \u201Cconnect your Alpaca\u201D to \u201Cconnect ANY brokerage.\u201D Evaluate for Phase 3 trade execution.",
    },
    {
      label: "Vercel + Railway hybrid",
      desc: "Overclaw Python agent runs on localhost:8001. For production, Railway ($8\u201315/mo) hosts it as a persistent container alongside background workers. Vercel stays on frontend.",
    },
  ];

  const card: React.CSSProperties = {
    background: "var(--white)",
    borderRadius: "8px",
    border: "1px solid var(--ink-08)",
    padding: "1.5rem",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--paper)", padding: "3rem 2rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "3rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "var(--text-3xl)",
                  fontStyle: "italic",
                  color: "var(--orange)",
                  lineHeight: 1,
                }}
              >
                911stock
              </h1>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--white)",
                  background: "var(--ink)",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "2px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  position: "relative",
                  top: "-2px",
                }}
              >
                Internal
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontStyle: "italic", color: "var(--ink-50)", fontWeight: 400 }}>
              Stack Confirm
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", marginTop: "0.25rem", letterSpacing: "0.02em" }}>
              Audit of current stack vs. alternatives &middot; 3 targeted swaps recommended
            </p>
          </div>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--ink-30)",
              padding: "0.5rem 0.875rem",
              border: "1px solid var(--ink-08)",
              borderRadius: "4px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            &larr; Dashboard
          </a>
        </header>

        {/* Auth0 Drop Decision */}
        <section style={{ marginBottom: "2rem", background: "var(--ink)", borderRadius: "8px", padding: "2rem", color: "var(--white)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "var(--orange)",
                background: "rgba(234,76,0,0.15)",
                padding: "0.25rem 0.6rem",
                borderRadius: "3px",
              }}
            >
              ACTION REQUIRED
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
              Pending CTO approval
            </span>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 500, fontStyle: "italic", color: "var(--white)", lineHeight: 1.3, marginBottom: "1rem" }}>
            Drop Auth0. Replace with SMS approval.
          </h2>

          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            Auth0 CIBA + Guardian is heavyweight for a simple &ldquo;approve this trade?&rdquo; flow.
            Guardian enrollment adds friction. Edge middleware incompatibilities caused repeated Vercel deploy failures.
            SMS does the same job with zero setup for users.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", borderRadius: "6px", overflow: "hidden", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.25rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
                MVP &mdash; SMS APPROVAL
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontStyle: "italic", color: "var(--white)", marginBottom: "0.5rem" }}>
                Twilio SMS
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                  Bland calls &rarr; user says yes &rarr; SMS: &ldquo;Reply YES to sell 500 SMCI&rdquo;
                </li>
                <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                  $0.0079/SMS &middot; build time: hours
                </li>
                <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                  Zero user setup &mdash; everyone has SMS
                </li>
              </ul>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.25rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
                LATER &mdash; CUSTOM APP
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontStyle: "italic", color: "var(--white)", marginBottom: "0.5rem" }}>
                Push Notifications
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                  911Stock mobile app with approve/deny buttons
                </li>
                <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                  Firebase Cloud Messaging or APNs
                </li>
                <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                  Build time: weeks (React Native / Expo)
                </li>
              </ul>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "1.25rem" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--orange)", marginBottom: "0.75rem" }}>
              WHAT GETS REMOVED
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 2rem" }}>
              {[
                "@auth0/nextjs-auth0, @auth0/ai, @auth0/ai-vercel",
                "/lib/auth0.ts, /lib/auth0-ciba.ts",
                "/api/ciba-status/, /api/initiate-ciba/",
                "/api/guardian-enroll/, /auth/[auth0]/",
                "GuardianEnroll.tsx component",
                "/settings page (Guardian enrollment)",
                "Middleware auth checks",
                "All AUTH0_* env vars",
              ].map((item) => (
                <p key={item} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Keep Section */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "0.5rem" }}>
            Keep &mdash; CTO nailed these
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1rem", lineHeight: 1.4 }}>
            Strong architectural choices. No switching cost justified.
          </p>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {keep.map((row, i) => (
              <div
                key={row.layer}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1.5fr",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderTop: i > 0 ? "1px solid var(--ink-08)" : "none",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--orange)" }}>
                  {row.layer}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                  {row.current}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6 }}>
                  {row.verdict}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Changes Section */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "0.5rem" }}>
            3 Changes Worth Making
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1rem", lineHeight: 1.4 }}>
            Targeted swaps with measurable gains. Not a rewrite.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {changes.map((change) => (
              <div key={change.title} style={{ ...card, borderLeft: change.priority === "HIGH" ? "4px solid var(--orange)" : "4px solid var(--terra)", padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: change.priority === "HIGH" ? "var(--orange)" : "var(--terra)",
                      background: change.priority === "HIGH" ? "rgba(234,76,0,0.08)" : "rgba(196,92,46,0.08)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "3px",
                    }}
                  >
                    {change.priority}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                    {change.title}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6, marginBottom: "1rem" }}>
                  {change.reason}
                </p>
                <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--ink-08)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", background: "var(--paper)", padding: "0.5rem 1rem" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-30)" }}>&nbsp;</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-30)" }}>Current</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--orange)" }}>Proposed</span>
                  </div>
                  {change.rows.map((row, i) => (
                    <div
                      key={row.dim}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "140px 1fr 1fr",
                        padding: "0.625rem 1rem",
                        background: "var(--white)",
                        borderTop: "1px solid var(--ink-08)",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink)" }}>{row.dim}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-30)" }}>{row.from}</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink)", fontWeight: 600 }}>{row.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evaluate Later */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "0.5rem" }}>
            Evaluate Later
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1rem", lineHeight: 1.4 }}>
            Strategic additions when the product matures.
          </p>
          <div style={{ ...card, borderLeft: "4px solid var(--terra)", padding: "2rem" }}>
            <ul style={{ margin: 0, paddingLeft: "0", listStyle: "none" }}>
              {later.map((item) => (
                <li key={item.label} style={{ marginBottom: "1.25rem" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)", display: "block", marginBottom: "0.375rem" }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.7, display: "block" }}>
                    {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Action Items */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.5rem" }}>
            Action Items
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1rem", lineHeight: 1.4 }}>
            Pivot to Telegram-first. Ship fast.
          </p>

          {/* Phase 1 */}
          <div style={{ ...card, borderLeft: "4px solid var(--orange)", padding: "1.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--orange)", background: "rgba(234,76,0,0.08)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>
                WEEK 1
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                Telegram Bot MVP
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { owner: "CTO", task: "Set up Telegram bot via BotFather, basic /start and /watchlist commands" },
                { owner: "CTO", task: "Port signal scoring engine + EDGAR monitor to standalone Python service" },
                { owner: "CTO", task: "Inline keyboard buttons for trade approval (YES / NO / DETAILS)" },
                { owner: "CTO", task: "Connect Alpaca trade execution to Telegram approval callback" },
                { owner: "CEO", task: "Write bot copy \u2014 welcome message, alert format, confirmation messages" },
                { owner: "CEO", task: "Set up Stripe Checkout landing page (911stock.com/subscribe) \u2014 keep 97%" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.5rem 0" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: item.owner === "CTO" ? "var(--orange)" : "var(--terra)", background: item.owner === "CTO" ? "rgba(234,76,0,0.08)" : "rgba(196,92,46,0.08)", padding: "0.15rem 0.4rem", borderRadius: "2px", whiteSpace: "nowrap" }}>
                    {item.owner}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.6 }}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2 */}
          <div style={{ ...card, borderLeft: "4px solid var(--terra)", padding: "1.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--terra)", background: "rgba(196,92,46,0.08)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>
                WEEK 2
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                Agent Swarm + Payments
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { owner: "CTO", task: "Multi-source agent swarm \u2014 EDGAR, news APIs, social sentiment running in parallel" },
                { owner: "CTO", task: "Per-user notification agents \u2014 system spawns agent per watchlist, filters by sensitivity" },
                { owner: "CTO", task: "Ghost DB integration \u2014 store signals, trades, agent learnings for pattern matching" },
                { owner: "CEO", task: "Stripe webhook \u2192 bot activation flow (payment confirmed \u2192 /activate link in email)" },
                { owner: "CEO", task: "Onboarding sequence \u2014 user adds tickers, sets sensitivity, connects Alpaca via OAuth" },
                { owner: "CEO", task: "Record demo video of full loop: alert \u2192 approve \u2192 trade confirmed in Telegram" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.5rem 0" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: item.owner === "CTO" ? "var(--orange)" : "var(--terra)", background: item.owner === "CTO" ? "rgba(234,76,0,0.08)" : "rgba(196,92,46,0.08)", padding: "0.15rem 0.4rem", borderRadius: "2px", whiteSpace: "nowrap" }}>
                    {item.owner}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.6 }}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3 */}
          <div style={{ ...card, borderLeft: "4px solid var(--ink-15)", padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-30)", background: "var(--paper)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>
                WEEK 3-4
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                Scale + Monetize
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { owner: "CTO", task: "Switch Bland AI \u2192 Retell AI for optional voice call tier (better voice, 22% cheaper)" },
                { owner: "CTO", task: "Switch node-cron \u2192 Inngest for durable background jobs with retries" },
                { owner: "CTO", task: "SnapTrade integration \u2014 connect any brokerage, not just Alpaca" },
                { owner: "CEO", task: "Launch landing page + pricing tiers: Free (alerts only) / $20 (full bot) / $50 (voice calls)" },
                { owner: "CEO", task: "Seed 50 beta users from hackathon contacts + judge referrals" },
                { owner: "BOTH", task: "Rip out web dashboard, Auth0, Vercel \u2014 Telegram is the product" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.5rem 0" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: item.owner === "CTO" ? "var(--orange)" : item.owner === "CEO" ? "var(--terra)" : "var(--ink-50)", background: item.owner === "CTO" ? "rgba(234,76,0,0.08)" : item.owner === "CEO" ? "rgba(196,92,46,0.08)" : "var(--paper)", padding: "0.15rem 0.4rem", borderRadius: "2px", whiteSpace: "nowrap" }}>
                    {item.owner}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.6 }}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cost Comparison */}
        <section style={{ ...card, marginBottom: "2rem", padding: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "0.75rem" }}>
            Why Telegram
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
            Alerts are free. Approval buttons are free. Push notifications are free.
          </p>
          <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--ink-08)", marginBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "var(--paper)", padding: "0.5rem 1rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-30)" }}>Channel</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-30)" }}>Per alert</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-30)" }}>10K alerts/day</span>
            </div>
            {[
              { channel: "Telegram Bot", per: "$0.00", daily: "$0/day", highlight: true },
              { channel: "Twilio SMS", per: "$0.0079", daily: "$79/day", highlight: false },
              { channel: "Bland AI calls", per: "$0.09/min", daily: "$900/day", highlight: false },
            ].map((row, i) => (
              <div key={row.channel} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "0.625rem 1rem", background: "var(--white)", borderTop: "1px solid var(--ink-08)" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: row.highlight ? 600 : 400, color: row.highlight ? "var(--ink)" : "var(--ink-30)" }}>{row.channel}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: row.highlight ? 600 : 400, color: row.highlight ? "var(--orange)" : "var(--ink-30)" }}>{row.per}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: row.highlight ? 600 : 400, color: row.highlight ? "var(--orange)" : "var(--ink-30)" }}>{row.daily}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.7 }}>
            Subscription revenue via Stripe Checkout on your own landing page &mdash; you keep 97% ($19.42 of $20).
            Telegram Stars only required for in-app digital goods (65% kept). Avoid by selling on your site.
          </p>
        </section>

        {/* Bottom Line */}
        <section style={{ ...card, borderLeft: "4px solid var(--orange)", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.75rem" }}>
            Bottom Line
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.4 }}>
            Telegram-first. Stripe for payments. The agent architecture is the product &mdash; not the web dashboard. Ship the bot in Week 1, monetize in Week 2, scale in Week 3.
          </p>
        </section>

        <footer style={{ textAlign: "center", paddingBottom: "1rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-15)", letterSpacing: "0.02em" }}>
            Internal use only &middot; remove before public launch
          </p>
        </footer>
      </div>
    </main>
  );
}
