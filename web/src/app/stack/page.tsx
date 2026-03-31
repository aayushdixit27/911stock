export default function StackPage() {
  const keep = [
    { layer: "Frontend", current: "Next.js 16 + React 19 + Tailwind 4", verdict: "Best full-stack framework, largest ecosystem. No reason to switch." },
    { layer: "Database", current: "PostgreSQL via Ghost", verdict: "Agent-native workflow, unlimited forks, hard cost caps. Solid." },
    { layer: "Auth", current: "Auth0 + CIBA + Guardian", verdict: "Enterprise compliance (SOC 2, HIPAA), push-notification trade approvals. Nothing else does CIBA this well." },
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

        {/* Bottom Line */}
        <section style={{ ...card, borderLeft: "4px solid var(--orange)", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.75rem" }}>
            Bottom Line
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.4 }}>
            The CTO made strong architectural choices. Only 3 targeted swaps are worth the switching cost&nbsp;&mdash; and the biggest one (Retell&nbsp;AI) directly fixes the &ldquo;sounds like a scam&rdquo; feedback that judges hammered.
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
