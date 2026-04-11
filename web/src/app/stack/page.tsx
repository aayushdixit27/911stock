export default function StackPage() {
  const card: React.CSSProperties = {
    background: "var(--white)",
    borderRadius: "8px",
    border: "1px solid var(--ink-08)",
    padding: "1.5rem",
  };

  const sectionLabel = (text: string) => (
    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.5rem" }}>
      {text}
    </p>
  );

  const statusBadge = (status: "working" | "partial" | "broken" | "missing" | "done" | "blocked") => {
    const colors = {
      working: { bg: "rgba(34,197,94,0.08)", text: "#15803d" },
      done: { bg: "rgba(34,197,94,0.08)", text: "#15803d" },
      partial: { bg: "rgba(217,119,6,0.08)", text: "#b45309" },
      broken: { bg: "rgba(220,38,38,0.08)", text: "#dc2626" },
      missing: { bg: "rgba(220,38,38,0.08)", text: "#dc2626" },
      blocked: { bg: "rgba(220,38,38,0.08)", text: "#dc2626" },
    };
    const c = colors[status];
    return (
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", color: c.text, background: c.bg, padding: "0.15rem 0.4rem", borderRadius: "2px", textTransform: "uppercase" }}>
        {status}
      </span>
    );
  };

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
              Technical Audit &amp; Roadmap
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", marginTop: "0.25rem" }}>
              Updated Apr 11, 2026
            </p>
          </div>
          <a href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-30)", padding: "0.5rem 0.875rem", border: "1px solid var(--ink-08)", borderRadius: "4px", textDecoration: "none", whiteSpace: "nowrap" }}>
            &larr; Dashboard
          </a>
        </header>

        {/* ═══════════════════════════════════════════ */}
        {/* EXECUTIVE SUMMARY                          */}
        {/* ═══════════════════════════════════════════ */}

        <section style={{ marginBottom: "2rem", background: "var(--ink)", borderRadius: "8px", padding: "2rem", color: "var(--white)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--orange)", background: "rgba(234,76,0,0.15)", padding: "0.25rem 0.6rem", borderRadius: "3px" }}>
              EXECUTIVE SUMMARY
            </span>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 500, fontStyle: "italic", color: "var(--white)", lineHeight: 1.3, marginBottom: "0.75rem" }}>
            The website works as a hackathon demo. It does not work as a product.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            Core flows (auth, watchlist, signal streaming, Alpaca trading, Stripe billing) function end-to-end.
            But there is no automated SEC monitoring, no real alert delivery, and the &ldquo;accuracy&rdquo; stats are always 0%.
            The product thesis &mdash; delivering alerts faster than anyone &mdash; has no implementation yet.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", borderRadius: "6px", overflow: "hidden", marginBottom: "1.5rem" }}>
            {[
              { label: "Status", value: "Hackathon demo", sub: "80% UI complete, 20% demo scaffolding" },
              { label: "Pivot", value: "Telegram-first", sub: "SMS blocked by A2P registration (~10 days)" },
              { label: "Next milestone", value: "Telegram bot MVP", sub: "Real Form 4 → real Telegram alert" },
            ].map((item) => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.05)", padding: "1rem" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: "0.375rem" }}>{item.label}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)", fontStyle: "italic", color: "var(--white)", marginBottom: "0.25rem" }}>{item.value}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.5)" }}>{item.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", borderRadius: "6px", overflow: "hidden" }}>
            {[
              { label: "Completed", items: "Landing page, alert templates, Stripe Checkout ($99/yr w/ trial), MARK design system" },
              { label: "Blocked", items: "Twilio A2P registration (~10 days), toll-free verification" },
              { label: "Next up", items: "Telegram bot, web dashboard with real data, EDGAR poller" },
              { label: "Revenue", items: "$99/year. Stripe test mode live. 14-day free trial." },
            ].map((item) => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.05)", padding: "0.75rem 1rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, color: "var(--orange)", marginRight: "0.5rem" }}>{item.label}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{item.items}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* KEY DECISIONS                              */}
        {/* ═══════════════════════════════════════════ */}

        <section style={{ ...card, marginBottom: "2rem", padding: "2rem" }}>
          {sectionLabel("Key Decisions")}
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
            What changed and why.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { decision: "Telegram-first (SMS on roadmap)", why: "Twilio requires A2P 10DLC registration for local numbers and toll-free verification — both take 10+ days. Telegram bot API is free, instant, no approval needed.", date: "Apr 11" },
              { decision: "Keep web dashboard", why: "Originally planned to rip it out. But web dashboard is 80% functional and gives us a product while Telegram bot is built.", date: "Apr 11" },
              { decision: "Drop RCS as primary channel", why: "RCS via Twilio has same registration requirements as SMS. No advantage over SMS if both are blocked.", date: "Apr 11" },
              { decision: "$99/year via Stripe (live)", why: "Stripe Checkout with 14-day trial is wired to /subscribe. Test mode keys deployed to Vercel.", date: "Apr 3" },
              { decision: "Drop Auth0", why: "Too heavyweight. Messaging handles approval. NextAuth sufficient for web.", date: "Mar 31" },
              { decision: "MARK design system", why: "Editorial/magazine aesthetic. Crimson Pro + Inter + IBM Plex Mono. One orange accent.", date: "Apr 2" },
            ].map((d) => (
              <div key={d.decision} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--ink-08)" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink)" }}>{d.decision}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--ink-30)", whiteSpace: "nowrap" }}>{d.date}</span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5, marginTop: "0.25rem" }}>{d.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* WEBSITE AUDIT                              */}
        {/* ═══════════════════════════════════════════ */}

        <section style={{ marginBottom: "2rem" }}>
          {sectionLabel("Website Audit")}
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
            What works, what&apos;s broken, what&apos;s missing.
          </p>

          {/* Pages */}
          <div style={{ ...card, marginBottom: "0.75rem", padding: "1.75rem" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--ink-30)", marginBottom: "1rem" }}>PAGES</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { page: "/", name: "Home / Dashboard", status: "working" as const, note: "Landing (unauth) shows marketing. Dashboard (auth) has watchlist + live prices from Yahoo Finance." },
                { page: "/subscribe", name: "Subscribe", status: "working" as const, note: "Landing page with Stripe Checkout. Phone input + ticker picker. 14-day trial, $99/year." },
                { page: "/dashboard", name: "Signal Pipeline", status: "partial" as const, note: "SSE streaming works but requires manual trigger. Falls back to hardcoded SMCI demo data." },
                { page: "/feed", name: "Signal Feed", status: "working" as const, note: "Paginated signals from DB. Shows empty state if no signals generated yet." },
                { page: "/settings", name: "Settings", status: "working" as const, note: "All toggles functional — notifications, risk tolerance, Stripe billing, Alpaca OAuth." },
                { page: "/resolution", name: "Trade Resolution", status: "partial" as const, note: "Displays real trade data but Overmind trace and savings estimate are hardcoded." },
                { page: "/onboarding", name: "Onboarding", status: "working" as const, note: "3-step wizard: tickers, notifications, risk tolerance. All persisted to DB." },
                { page: "/accuracy", name: "Accuracy Report", status: "broken" as const, note: "Queries signal_outcomes table which is always empty. Shows 0% accuracy." },
              ].map((p) => (
                <div key={p.page} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--ink-08)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink)", minWidth: "110px" }}>{p.page}</span>
                  {statusBadge(p.status)}
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5 }}>{p.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Pipeline */}
          <div style={{ ...card, marginBottom: "0.75rem", padding: "1.75rem" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--ink-30)", marginBottom: "1rem" }}>CORE PIPELINE</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { component: "EDGAR Parser", status: "partial" as const, note: "Fetches Form 4 XML from SEC. Only 3 hardcoded CIKs (SMCI, TSLA, NVDA). Placeholder metrics for position reduction %." },
                { component: "Signal Scoring", status: "working" as const, note: "0-10 scoring engine. Factors: 10b5-1 plan, insider role, transaction value, position reduction, news sentiment." },
                { component: "LLM Analysis", status: "working" as const, note: "Gemini via TrueFoundry generates 2-sentence plain-English context. No fallback if gateway fails." },
                { component: "Automated Polling", status: "missing" as const, note: "No cron, no scheduler. Everything is manual HTTP trigger. Need Vercel Crons, Inngest, or external scheduler." },
                { component: "Alert Delivery", status: "blocked" as const, note: "Twilio SMS blocked by A2P registration. Telegram bot not yet built. Bland AI configured but untested." },
                { component: "Accuracy Tracking", status: "broken" as const, note: "signal_outcomes table exists but never populated. /api/accuracy/check exists but needs external cron + CRON_SECRET." },
              ].map((c) => (
                <div key={c.component} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--ink-08)" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink)", minWidth: "140px" }}>{c.component}</span>
                  {statusBadge(c.status)}
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5 }}>{c.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* External Services */}
          <div style={{ ...card, padding: "1.75rem" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--ink-30)", marginBottom: "1rem" }}>EXTERNAL SERVICES</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { service: "SEC EDGAR", status: "working" as const, note: "Free, public API. No auth needed. 5 req/s rate limit respected." },
                { service: "Ghost DB (Postgres)", status: "working" as const, note: "Timescale Cloud. Auto-migration. 11 tables, all user-scoped." },
                { service: "Stripe", status: "working" as const, note: "Test mode. Checkout, webhooks, portal all functional. $99/yr price created." },
                { service: "Gemini (TrueFoundry)", status: "working" as const, note: "Signal explanation generation. API key configured." },
                { service: "Alpaca", status: "working" as const, note: "Paper trading. OAuth flow complete. Trade execution functional for premium users." },
                { service: "Twilio", status: "blocked" as const, note: "Account active, toll-free number purchased. Blocked by A2P 10DLC + toll-free verification." },
                { service: "Bland AI", status: "partial" as const, note: "API key configured. Phone call script has hardcoded fabricated content — dangerous for real use." },
                { service: "Auth0", status: "partial" as const, note: "CIBA configured but being deprecated. Keep for now, remove later." },
                { service: "Yahoo Finance", status: "working" as const, note: "Free stock quotes. Used by accuracy check and live price display." },
              ].map((s) => (
                <div key={s.service} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--ink-08)" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink)", minWidth: "140px" }}>{s.service}</span>
                  {statusBadge(s.status)}
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5 }}>{s.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* WHAT NEEDS TO HAPPEN                       */}
        {/* ═══════════════════════════════════════════ */}

        <section style={{ marginBottom: "2rem" }}>
          {sectionLabel("What Needs to Happen")}
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1rem", lineHeight: 1.4 }}>
            Ordered by impact. Ship the alert loop first.
          </p>

          {/* Phase 1 */}
          <div style={{ ...card, borderLeft: "4px solid var(--orange)", padding: "1.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--orange)", background: "rgba(234,76,0,0.08)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>PHASE 1</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>Alert Loop (Telegram)</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {[
                "Create Telegram bot via @BotFather — get token",
                "Build EDGAR poller — standalone Node script, 60s interval, filter score >= 7",
                "Expand CIK map beyond 3 tickers — dynamic lookup or DB table",
                "Wire Gemini to generate context for each qualifying signal",
                "Send Telegram message using alert templates (docs/alert-templates.md)",
                "Deploy poller as separate process (not inside Next.js)",
                "End-to-end test: real Form 4 → real Telegram message",
              ].map((task, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", padding: "0.375rem 0" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--ink-30)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.5 }}>{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2 */}
          <div style={{ ...card, borderLeft: "4px solid var(--terra)", padding: "1.75rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--terra)", background: "rgba(196,92,46,0.08)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>PHASE 2</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>Make Website Real</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {[
                "Replace NewsTimeline demo component with real signal feed from /api/feed",
                "Fix accuracy tracking — populate signal_outcomes, set up daily cron for /api/accuracy/check",
                "Remove hardcoded SMCI fallback data from dashboard SSE",
                "Make sensitivity dropdown persist to DB (currently UI-only)",
                "Wire risk tolerance to actually filter signal scoring",
                "Clean up Bland AI call script — remove fabricated DOJ content",
                "Remove dead integrations: TrueFoundry (unused), GuardianEnroll component",
              ].map((task, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", padding: "0.375rem 0" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--ink-30)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.5 }}>{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3 */}
          <div style={{ ...card, borderLeft: "4px solid var(--ink-15)", padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-30)", background: "var(--paper)", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>PHASE 3</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)" }}>SMS + Scale</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {[
                "Complete Twilio A2P 10DLC registration (submit forms, wait ~10 days)",
                "Buy local number, wire SMS as second delivery channel alongside Telegram",
                "Switch Bland AI → Retell AI for voice tier (22% cheaper, better quality)",
                "Switch to Inngest for durable background jobs with retries",
                "SnapTrade integration — connect any brokerage, not just Alpaca",
                "Launch pricing tiers: Free (Telegram alerts) / $99 (SMS + web) / $199 (voice calls)",
              ].map((task, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", padding: "0.375rem 0" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--ink-30)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.5 }}>{task}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* DATABASE                                    */}
        {/* ═══════════════════════════════════════════ */}

        <section style={{ ...card, marginBottom: "2rem", padding: "2rem" }}>
          {sectionLabel("Database")}
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontStyle: "italic", color: "var(--ink)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
            Ghost DB (Timescale Postgres) &mdash; 11 tables, auto-migration.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {[
              { table: "users", status: "working" as const, note: "Auth, tier, stripe_customer_id, onboarding status" },
              { table: "signals", status: "working" as const, note: "Insider trading signals. User-scoped, deduped by edgar_filing_id" },
              { table: "watchlist", status: "working" as const, note: "User ticker subscriptions" },
              { table: "trades", status: "working" as const, note: "Executed trades. Unique per signal_id" },
              { table: "portfolio", status: "working" as const, note: "User stock positions" },
              { table: "user_settings", status: "working" as const, note: "Risk tolerance, notification preferences" },
              { table: "alpaca_connections", status: "working" as const, note: "OAuth tokens for paper trading" },
              { table: "alerts", status: "working" as const, note: "Phone call alerts triggered by signals" },
              { table: "signal_outcomes", status: "broken" as const, note: "Never populated. Accuracy always 0%" },
              { table: "notifications", status: "missing" as const, note: "Schema exists but never written to or delivered" },
              { table: "agent_learnings", status: "missing" as const, note: "Schema exists but never written to" },
            ].map((t) => (
              <div key={t.table} style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", padding: "0.375rem 0", borderBottom: "1px solid var(--ink-08)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--ink)", minWidth: "150px" }}>{t.table}</span>
                {statusBadge(t.status)}
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>{t.note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* BOTTOM LINE                                */}
        {/* ═══════════════════════════════════════════ */}

        <section style={{ ...card, borderLeft: "4px solid var(--orange)", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--orange)", marginBottom: "0.75rem" }}>
            Bottom Line
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 500, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.4 }}>
            Telegram bot for alerts. Fix the website to show real data. SMS when registration clears.
            The agent architecture exists &mdash; it just needs a scheduler and a delivery channel.
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
