export default function GTMPage() {
  const tiers = [
    { name: "Alert", price: "Free → $5", sub: "/month", features: "News alerts + dashboard, no phone calls" },
    { name: "Pro", price: "$20", sub: "/month", features: "Phone call alerts + source verification + portfolio tracking" },
    { name: "Premium", price: "% rev", sub: "or $50/mo", features: "Auto-execute with human approval, buy-side signals, crypto" },
  ];

  const phases = [
    {
      title: "Alert-only MVP",
      status: "NOW",
      items: [
        "Several judges said they'd pay for alerts alone",
        "Kills the \"scam\" objection — just an information service",
        "No brokerage integration needed, no SEC headaches",
      ],
    },
    {
      title: "Phone call alerts",
      status: "NEXT",
      items: [
        "The killer differentiator every judge loved",
        "Address scam perception: caller ID branding, verification SMS",
        "\"It seems like a no-brainer\" — Judge",
      ],
    },
    {
      title: "Trade execution",
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
    { issue: "Execution speed", fix: "Alpaca direct integration, measure and display latency" },
    { issue: "Credential security", fix: "Auth0 OAuth vault, never store brokerage passwords" },
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
              Go-to-Market Strategy
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", marginTop: "0.25rem", letterSpacing: "0.02em" }}>
              Synthesized from 27 judge conversations &middot; Deep Agents Hackathon &middot; Mar 27, 2026
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

        {/* ICP */}
        <section style={{ ...card, marginBottom: "2rem", borderLeft: "4px solid var(--orange)", padding: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.75rem" }}>
            Ideal Customer Profile
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.4, marginBottom: "1rem" }}>
            Retail investors with individual stock positions, sub-$100K portfolios, who don&apos;t have institutional-grade coverage.
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.7 }}>
            NOT the customer: passive index fund / buy-and-hold investors. Multiple judges self-selected out.
            Active traders and day traders are high-intent. Crypto holders are underserved&nbsp;&mdash; Merrill refuses to participate.
          </p>
        </section>

        {/* Pricing */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "1rem" }}>
            Pricing
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: "var(--ink-08)", borderRadius: "8px", overflow: "hidden" }}>
            {tiers.map((tier) => (
              <div key={tier.name} style={{ background: "var(--white)", padding: "1.5rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: tier.name === "Pro" ? "var(--orange)" : "var(--ink-30)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {tier.name}
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.1 }}>
                  {tier.price}
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", marginBottom: "0.75rem" }}>
                  {tier.sub}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.55 }}>
                  {tier.features}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--ink-30)", marginTop: "0.75rem" }}>
            Judges validated: free trial required, $20/mo is the anchor, % revenue share for high-rollers.
          </p>
        </section>

        {/* Launch Sequence */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "1rem" }}>
            Launch Sequence
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {phases.map((phase, idx) => (
              <div key={phase.title} style={{ ...card, padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.625rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: phase.status === "NOW" ? "var(--orange)" : "var(--ink-30)",
                      background: phase.status === "NOW" ? "rgba(234,76,0,0.08)" : "var(--paper)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "3px",
                    }}
                  >
                    {phase.status}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                    {idx + 1}. {phase.title}
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                  {phase.items.map((item, i) => (
                    <li key={i} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.8 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Competitive Positioning */}
        <section style={{ ...card, marginBottom: "2rem", padding: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "1rem" }}>
            Competitive Positioning
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-xl)", color: "var(--ink)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
            &ldquo;By the time CNBC covers it, it&apos;s too late.&rdquo;
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--ink-08)", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ background: "var(--paper)", padding: "0.625rem 1rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-30)" }}>Them</p>
            </div>
            <div style={{ background: "var(--paper)", padding: "0.625rem 1rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--orange)" }}>Us</p>
            </div>
            {[
              ["Merrill alerts (reactive, $100K+ only)", "Proactive phone call for anyone"],
              ["Twitter/X doomscrolling", "Distilled, verified, personal"],
              ["Bloomberg Terminal ($24K/yr)", "$20/mo with plain English"],
            ].map(([them, us], i) => (
              <div key={i} style={{ display: "contents" }}>
                <div style={{ background: "var(--white)", padding: "0.75rem 1rem", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-30)", lineHeight: 1.5 }}>{them}</div>
                <div style={{ background: "var(--white)", padding: "0.75rem 1rem", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink)", fontWeight: 600, lineHeight: 1.5 }}>{us}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--ink-30)", marginTop: "1rem" }}>
            No direct competitor does AI phone call alerts for stock signals.
          </p>
        </section>

        {/* Objections & Fixes */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "1rem" }}>
            Objections &amp; Fixes
          </p>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {objections.map((o, i) => (
              <div
                key={o.issue}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: "1.5rem",
                  padding: "1rem 1.5rem",
                  borderTop: i > 0 ? "1px solid var(--ink-08)" : "none",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                  {o.issue}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6 }}>
                  {o.fix}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Judge Quotes */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "1rem" }}>
            What Judges Said
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {quotes.map((q, i) => (
              <div key={i} style={{ ...card, padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "var(--text-base)", fontWeight: 400, color: "var(--ink)", lineHeight: 1.55, marginBottom: "0.75rem" }}>
                  &ldquo;{q.text}&rdquo;
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", letterSpacing: "0.02em" }}>
                  &mdash; {q.speaker}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Expansion */}
        <section style={{ ...card, borderLeft: "4px solid var(--terra)", padding: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--terra)", marginBottom: "1rem" }}>
            Expansion Opportunities
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", listStyle: "none" }}>
            {[
              {
                label: "Buy-side signals",
                desc: "Multiple judges asked \u201Ctell me what to buy.\u201D Flip the product from defensive (sell alerts) to offensive (buy opportunities). When insider buying spikes or an overreaction creates a dip, call the user with a buy thesis. Expands TAM beyond anxious holders to opportunistic traders.",
                quote: "\u201CIf it provided me a tip on a stock dropping and it would be a good buy opportunity, I would use it for that.\u201D",
              },
              {
                label: "Crypto & digital assets",
                desc: "Merrill Lynch and traditional brokerages refuse to touch crypto. That\u2019s a massive underserved gap. Whale wallet monitoring, exchange flow alerts, and on-chain insider moves are all unserved by existing tools. No SEC filing infrastructure needed \u2014 blockchain data is public.",
                quote: "\u201CAsset classes not tracked by index funds. Merrill doesn\u2019t do anything with crypto.\u201D \u2014 Merrill client",
              },
              {
                label: "Foreign securities",
                desc: "International markets trade on different hours and in different languages. A US-based retail investor holding Toyota or ASML has almost zero coverage from domestic brokerages. Real-time translation of foreign filings + phone call in English is a strong wedge.",
                quote: null,
              },
              {
                label: "Trend distillation",
                desc: "Judges wanted more than single-stock alerts \u2014 they want macro signal synthesis. \u201CWhich companies are likely to lay off and do well because of AI efficiency?\u201D Package thematic intelligence (AI winners, tariff losers, rate-sensitive plays) as a premium weekly call.",
                quote: "\u201CIf I could distill down what are the super hot trends... I know a lot of people that would buy that.\u201D",
              },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: "1.25rem", paddingLeft: "0" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)", display: "block", marginBottom: "0.375rem" }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.7, display: "block" }}>
                  {item.desc}
                </span>
                {item.quote && (
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--ink-30)", display: "block", marginTop: "0.375rem" }}>
                    {item.quote}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <footer style={{ textAlign: "center", marginTop: "2.5rem", paddingBottom: "1rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-15)", letterSpacing: "0.02em" }}>
            Internal use only &middot; remove before public launch
          </p>
        </footer>
      </div>
    </main>
  );
}
