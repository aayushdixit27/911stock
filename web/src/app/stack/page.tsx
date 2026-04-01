export default function StackPage() {
  const card: React.CSSProperties = {
    background: "var(--white)",
    borderRadius: "8px",
    border: "1px solid var(--ink-08)",
    padding: "1.5rem",
  };

  const taskItem = (owner: string, task: string, i: number) => (
    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.5rem 0" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: owner === "CTO" ? "var(--orange)" : owner === "CEO" ? "var(--terra)" : "var(--ink-50)", background: owner === "CTO" ? "rgba(234,76,0,0.08)" : owner === "CEO" ? "rgba(196,92,46,0.08)" : "var(--paper)", padding: "0.15rem 0.4rem", borderRadius: "2px", whiteSpace: "nowrap" }}>
        {owner}
      </span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.6 }}>
        {task}
      </span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--paper)", padding: "3rem 2rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "2.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-3xl)", fontStyle: "italic", color: "var(--orange)", lineHeight: 1 }}>
                911stock
              </h1>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, color: "var(--white)", background: "var(--ink)", padding: "0.15rem 0.45rem", borderRadius: "2px", letterSpacing: "0.1em", textTransform: "uppercase", position: "relative", top: "-2px" }}>
                Internal
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontStyle: "italic", color: "var(--ink-50)", fontWeight: 400 }}>
              Stack &amp; Roadmap
            </p>
          </div>
          <a href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", padding: "0.5rem 0.875rem", border: "1px solid var(--ink-08)", borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" }}>
            &larr; Dashboard
          </a>
        </header>

        {/* Action Items */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.5rem" }}>
            Action Items
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1rem", lineHeight: 1.4 }}>
            RCS-first via Twilio. No app install. 82% US reach. Ship fast.
          </p>

          {/* Week 1 */}
          <div style={{ ...card, borderLeft: "4px solid var(--orange)", padding: "1.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--orange)", background: "rgba(234,76,0,0.08)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>WEEK 1</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>RCS Bot MVP</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { o: "CTO", t: "Set up Twilio RCS + SMS fallback, carrier approval for verified sender" },
                { o: "CTO", t: "Port signal scoring engine + EDGAR monitor to standalone Python service" },
                { o: "CTO", t: "RCS rich cards with action buttons for trade approval (Sell 50% / Hold / Details)" },
                { o: "CTO", t: "Connect Alpaca trade execution to RCS reply callback" },
                { o: "CEO", t: "Write alert copy \u2014 rich card format, confirmation messages, welcome message" },
                { o: "CEO", t: "Set up Stripe Checkout landing page (911stock.com/subscribe) \u2014 keep 97%" },
              ].map((item, i) => taskItem(item.o, item.t, i))}
            </div>
          </div>

          {/* Week 2 */}
          <div style={{ ...card, borderLeft: "4px solid var(--terra)", padding: "1.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--terra)", background: "rgba(196,92,46,0.08)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>WEEK 2</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>Agent Swarm + Payments</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { o: "CTO", t: "Multi-source agent swarm \u2014 EDGAR, news APIs, social sentiment in parallel" },
                { o: "CTO", t: "Per-user notification agents \u2014 spawn per watchlist, filter by sensitivity" },
                { o: "CTO", t: "Ghost DB \u2014 store signals, trades, agent learnings for pattern matching" },
                { o: "CEO", t: "Stripe webhook \u2192 activation flow (payment \u2192 onboarding link)" },
                { o: "CEO", t: "Onboarding: user adds tickers, sets sensitivity, connects Alpaca" },
                { o: "CEO", t: "Record demo video of full loop: RCS alert \u2192 approve \u2192 trade confirmed" },
              ].map((item, i) => taskItem(item.o, item.t, i))}
            </div>
          </div>

          {/* Week 3-4 */}
          <div style={{ ...card, borderLeft: "4px solid var(--ink-15)", padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-30)", background: "var(--paper)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>WEEK 3-4</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>Scale + Monetize</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { o: "CTO", t: "Switch Bland AI \u2192 Retell AI for optional voice call tier (22% cheaper, better voice)" },
                { o: "CTO", t: "Switch node-cron \u2192 Inngest for durable background jobs with retries" },
                { o: "CTO", t: "SnapTrade integration \u2014 connect any brokerage, not just Alpaca" },
                { o: "CEO", t: "Launch pricing tiers: Free (alerts only) / $20 (full RCS bot) / $50 (voice calls)" },
                { o: "CEO", t: "Seed 50 beta users from hackathon contacts + judge referrals" },
                { o: "BOTH", t: "Rip out web dashboard, Auth0, Vercel \u2014 RCS is the product" },
              ].map((item, i) => taskItem(item.o, item.t, i))}
            </div>
          </div>
        </section>

        {/* Why RCS */}
        <section style={{ ...card, marginBottom: "2rem", padding: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "0.75rem" }}>
            Why RCS over Telegram / iMessage
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
            No app install. Rich buttons. Works on iPhone + Android. 82% US reach.
          </p>
          <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--ink-08)", marginBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 0.7fr 0.7fr 1fr", background: "var(--paper)", padding: "0.5rem 1rem" }}>
              {["Channel", "US reach", "App install", "Rich buttons", "Cost/msg"].map((h) => (
                <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-30)" }}>{h}</span>
              ))}
            </div>
            {[
              { ch: "RCS (Twilio)", reach: "82%", install: "No", buttons: "Yes", cost: "$0.01\u2013$0.02", best: true },
              { ch: "Telegram", reach: "9%", install: "Yes", buttons: "Yes", cost: "Free", best: false },
              { ch: "iMessage (BlueBubbles)", reach: "60%", install: "No", buttons: "No", cost: "Free + Mac", best: false },
              { ch: "SMS fallback", reach: "100%", install: "No", buttons: "No", cost: "$0.0079", best: false },
            ].map((row) => (
              <div key={row.ch} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 0.7fr 0.7fr 1fr", padding: "0.625rem 1rem", background: "var(--white)", borderTop: "1px solid var(--ink-08)" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: row.best ? 600 : 400, color: row.best ? "var(--ink)" : "var(--ink-30)" }}>
                  {row.ch}
                  {row.best && <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, color: "var(--orange)", marginLeft: "0.5rem" }}>REC</span>}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: row.best ? 600 : 400, color: row.best ? "var(--orange)" : "var(--ink-30)" }}>{row.reach}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: row.install === "No" ? "var(--ink-50)" : "var(--ink-30)" }}>{row.install}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: row.buttons === "Yes" ? "var(--ink-50)" : "var(--ink-30)" }}>{row.buttons}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-30)" }}>{row.cost}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--ink-30)" }}>
            iMessage bots use unofficial Apple APIs &mdash; account ban risk. Telegram only 9% US penetration.
            RCS is the only option with rich UX, zero friction, and legal safety.
          </p>
        </section>

        {/* Payment Methods */}
        <section style={{ ...card, marginBottom: "2rem", padding: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "0.75rem" }}>
            Payment Methods
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
            How we collect $20/mo &mdash; and how much we keep.
          </p>
          <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--ink-08)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.8fr 1.5fr", background: "var(--paper)", padding: "0.625rem 1rem" }}>
              {["Method", "You keep", "Fee", "How it works"].map((h) => (
                <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-30)" }}>{h}</span>
              ))}
            </div>
            {[
              { method: "Stripe Checkout", keep: "~97%", keepAmt: "$19.42", fee: "2.9% + $0.30", how: "Landing page \u2192 Subscribe \u2192 Stripe bills \u2192 bot activates", best: true },
              { method: "Crypto (TON/USDC)", keep: "~100%", keepAmt: "$20.00", fee: "Gas only", how: "Wallet payment, one-tap", best: false },
              { method: "Lemon Squeezy", keep: "~95%", keepAmt: "$19.00", fee: "5%", how: "They handle global sales tax/VAT", best: false },
            ].map((row) => (
              <div key={row.method} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.8fr 1.5fr", padding: "0.75rem 1rem", background: "var(--white)", borderTop: "1px solid var(--ink-08)", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, color: row.best ? "var(--ink)" : "var(--ink-50)" }}>
                  {row.method}
                  {row.best && <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, color: "var(--orange)", marginLeft: "0.5rem" }}>REC</span>}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, color: row.best ? "var(--orange)" : "var(--ink-30)" }}>
                  {row.keep} <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", fontWeight: 400 }}>({row.keepAmt})</span>
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink-30)" }}>{row.fee}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5 }}>{row.how}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--ink-30)", marginTop: "0.75rem" }}>
            Sell on your own site to avoid app store cuts. User pays &rarr; gets activation link.
          </p>
        </section>

        {/* Tech Swaps */}
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-30)", marginBottom: "0.5rem" }}>
            Tech Swaps
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              {
                title: "Auth0 \u2192 Drop entirely",
                priority: "DONE" as const,
                reason: "RCS handles approval via rich card buttons. No CIBA, no Guardian, no middleware.",
              },
              {
                title: "Voice: Bland AI \u2192 Retell AI",
                priority: "HIGH" as const,
                reason: "22% cheaper ($0.07 vs $0.09/min), 33% faster (500ms vs 800ms), natural voice. Fixes \u201Csounds like a scam\u201D feedback.",
              },
              {
                title: "Background Jobs: node-cron \u2192 Inngest",
                priority: "HIGH" as const,
                reason: "Durable workflows with retries + dead-letter queues. node-cron is in-memory \u2014 jobs vanish on restart.",
              },
              {
                title: "LLM: Gemini \u2192 Claude",
                priority: "MEDIUM" as const,
                reason: "83% accuracy on financial modeling. Never trains on user data. Config change via TrueFoundry gateway.",
              },
            ].map((s) => (
              <div key={s.title} style={{ ...card, padding: "1rem 1.5rem", borderLeft: s.priority === "DONE" ? "4px solid var(--ink)" : s.priority === "HIGH" ? "4px solid var(--orange)" : "4px solid var(--terra)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: s.priority === "DONE" ? "var(--ink-50)" : s.priority === "HIGH" ? "var(--orange)" : "var(--terra)", background: s.priority === "DONE" ? "var(--paper)" : s.priority === "HIGH" ? "rgba(234,76,0,0.08)" : "rgba(196,92,46,0.08)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>
                    {s.priority}
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>
                    {s.title}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", marginTop: "0.375rem", lineHeight: 1.6 }}>
                  {s.reason}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Line */}
        <section style={{ ...card, borderLeft: "4px solid var(--orange)", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.75rem" }}>
            Bottom Line
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.4 }}>
            RCS via Twilio. Stripe for payments. The agent architecture is the product.
            Ship the bot in Week 1, monetize in Week 2, scale in Week 3.
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
