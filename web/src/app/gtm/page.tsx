export default function GTMPage() {
  const tiers = [
    { name: "Alert", price: "Free trial → $5/mo", features: "News alerts + dashboard, no phone calls" },
    { name: "Pro", price: "$20/mo", features: "Phone call alerts + source verification + portfolio tracking" },
    { name: "Premium", price: "% of savings or $50/mo", features: "Auto-execute with human approval, buy-side signals, crypto" },
  ];

  const phases = [
    {
      title: "Phase 1 — Alert-only MVP",
      status: "NOW",
      items: [
        "Several judges said they'd pay for alerts alone",
        "Kills the \"scam\" objection — just an information service",
        "No brokerage integration needed, no SEC headaches",
      ],
    },
    {
      title: "Phase 2 — Phone call alerts",
      status: "NEXT",
      items: [
        "The killer differentiator every judge loved",
        "Address scam perception: caller ID branding, verification SMS",
        "\"It seems like a no-brainer\" — Judge",
      ],
    },
    {
      title: "Phase 3 — Trade execution",
      status: "LATER",
      items: [
        "Alpaca integration (already built by CTO)",
        "Always human-in-the-loop — judges unanimous",
        "Crypto expansion (Merrill doesn't touch it = gap)",
      ],
    },
  ];

  const quotes = [
    { text: "It seems like a no-brainer.", speaker: "Judge, on using the product" },
    { text: "You should make a product out of that. It's good.", speaker: "TrueFoundry rep" },
    { text: "It's kind of acting as a brokerage for you... somebody that's actually on the floor that knows their shit.", speaker: "Judge on value prop" },
    { text: "I could see this for retail investors that don't have enough money to have the services of a large investment bank.", speaker: "Merrill Lynch client" },
    { text: "I'd rather proactively know that information than doom scroll Twitter.", speaker: "Judge" },
    { text: "Every second counts, right? And that's how quickly the market moves.", speaker: "UK-based judge" },
    { text: "I seem to always find out after it's fallen quite a bit.", speaker: "Judge, validating the core problem" },
    { text: "Oh, I love it.", speaker: "Auth0 rep, reacting to the pitch" },
  ];

  const objections = [
    { issue: "Sounds like a scam", fix: "Source verification on every alert, caller ID branding, Auth0 human-in-the-loop" },
    { issue: "Trust / social proof", fix: "Free trial, YouTube content, backtesting results, 3-4 year trust cycle" },
    { issue: "SEC compliance", fix: "Check SEC rules, never auto-execute, display compliance prominently" },
    { issue: "AI hallucination risk", fix: "Always cite sources (SEC filings, DOJ, Reuters), human approval required" },
    { issue: "Execution speed / round-trip", fix: "Alpaca direct integration, measure and display latency" },
    { issue: "Security of credentials", fix: "Auth0 OAuth vault, never store brokerage passwords" },
  ];

  const sectionTitle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "1.15rem",
    fontWeight: 700,
    fontStyle: "italic",
    color: "var(--ink)",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "2px solid var(--orange)",
  };

  const card: React.CSSProperties = {
    background: "var(--white)",
    borderRadius: "8px",
    border: "1px solid var(--ink-08)",
    padding: "1.25rem",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--paper)", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "1.5rem",
                  fontStyle: "italic",
                  color: "var(--orange)",
                }}
              >
                911stock
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--white)",
                  background: "var(--ink)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "3px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                INTERNAL
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>
              Go-to-Market Strategy — from 27 judge conversations
            </p>
          </div>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--ink-30)",
              padding: "0.375rem 0.75rem",
              border: "1px solid var(--ink-08)",
              borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </a>
        </div>

        {/* ICP */}
        <div style={{ ...card, marginBottom: "1.5rem", borderLeft: "4px solid var(--orange)" }}>
          <h2 style={sectionTitle}>ICP — Ideal Customer Profile</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--ink)", lineHeight: 1.7, marginBottom: "0.75rem" }}>
            <strong>Retail investors with individual stock positions, sub-$100K portfolios, who don&apos;t have institutional-grade coverage.</strong>
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6 }}>
            NOT the customer: passive index fund / buy-and-hold investors. Multiple judges self-selected out.
            Active traders and day traders are high-intent. Crypto holders are underserved — Merrill refuses to participate.
          </p>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ ...sectionTitle, marginBottom: "1rem" }}>Pricing — Three Tiers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: "var(--ink-08)", borderRadius: "8px", overflow: "hidden" }}>
            {tiers.map((tier) => (
              <div key={tier.name} style={{ background: "var(--white)", padding: "1.25rem" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: tier.name === "Pro" ? "var(--orange)" : "var(--ink-30)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {tier.name}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, fontStyle: "italic", color: "var(--ink)", marginBottom: "0.5rem" }}>
                  {tier.price}
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5 }}>
                  {tier.features}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", marginTop: "0.5rem" }}>
            Judges validated: free trial required, $20/mo is the anchor, % revenue share for high-rollers
          </p>
        </div>

        {/* Launch Sequence */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={sectionTitle}>Launch Sequence</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {phases.map((phase) => (
              <div key={phase.title} style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: phase.status === "NOW" ? "var(--orange)" : "var(--ink-30)",
                      background: phase.status === "NOW" ? "rgba(217,119,6,0.1)" : "var(--paper)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "3px",
                    }}
                  >
                    {phase.status}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>
                    {phase.title}
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {phase.items.map((item, i) => (
                    <li key={i} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.7 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Positioning */}
        <div style={{ ...card, marginBottom: "1.5rem" }}>
          <h2 style={sectionTitle}>Competitive Positioning</h2>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-base)", color: "var(--ink-50)", marginBottom: "1rem" }}>
            &ldquo;By the time CNBC covers it, it&apos;s too late.&rdquo;
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--ink-08)", borderRadius: "6px", overflow: "hidden" }}>
            {[
              ["Merrill alerts (reactive, $100K+ only)", "Proactive phone call for anyone"],
              ["Twitter/X doomscrolling", "Distilled, verified, personal"],
              ["Bloomberg Terminal ($24K/yr)", "$20/mo with plain English"],
            ].map(([them, us], i) => (
              <div key={i} style={{ display: "contents" }}>
                <div style={{ background: "var(--white)", padding: "0.75rem 1rem", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-30)" }}>{them}</div>
                <div style={{ background: "var(--white)", padding: "0.75rem 1rem", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink)", fontWeight: 600 }}>{us}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", marginTop: "0.75rem" }}>
            No direct competitor does AI phone call alerts for stock signals.
          </p>
        </div>

        {/* Objections & Fixes */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={sectionTitle}>Objections & How We Fix Them</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {objections.map((o) => (
              <div key={o.issue} style={{ ...card, padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", minWidth: "180px" }}>
                    {o.issue}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>
                    {o.fix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Judge Quotes */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={sectionTitle}>What Judges Said</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {quotes.map((q, i) => (
              <div key={i} style={{ ...card, padding: "1rem 1.25rem" }}>
                <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-sm)", color: "var(--ink)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                  &ldquo;{q.text}&rdquo;
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--ink-30)", letterSpacing: "0.03em" }}>
                  — {q.speaker}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expansion */}
        <div style={{ ...card, borderLeft: "4px solid var(--terra)" }}>
          <h2 style={sectionTitle}>Expansion Opportunities</h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.8 }}>
              <strong>Buy-side signals</strong> — &ldquo;tell me what to buy&rdquo; was a repeated ask from judges
            </li>
            <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.8 }}>
              <strong>Crypto</strong> — traditional brokerages won&apos;t touch it, wide-open niche
            </li>
            <li style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.8 }}>
              <strong>Foreign securities</strong> — another underserved asset class
            </li>
          </ul>
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>
            Internal only — synthesized from 27 judge conversations at Deep Agents Hackathon, Mar 27 2026
          </p>
        </div>
      </div>
    </main>
  );
}
