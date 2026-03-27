"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Trade = {
  id: string;
  ticker: string;
  action: string;
  shares: number;
  price: number;
  totalValue: number;
  reason: string;
  approvedVia: string;
  executedAt: string;
  beforeShares: number;
  afterShares: number;
};

type Position = {
  ticker: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
};

const OVERMIND_TRACE = [
  "Signal detected: HIGH significance (SMCI CEO sell)",
  "Recommendation: Alert user + suggest position reduction",
  "Trade executed: SMCI −50% (user approved via CIBA)",
];

export default function Resolution() {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "done" | "error">("idle");
  const [trade, setTrade] = useState<Trade | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        setTrade(data.lastTrade);
        setPositions(data.positions);
      })
      .catch(() => {});
  }, []);

  async function handleCallMe() {
    setCalling(true);
    setCallStatus("calling");
    try {
      const res = await fetch("/api/call", { method: "POST" });
      if (!res.ok) throw new Error("Call failed");
      setCallStatus("done");
    } catch {
      setCallStatus("error");
    } finally {
      setCalling(false);
    }
  }

  const estSavings = trade
    ? (trade.shares * trade.price * 0.12).toFixed(0)
    : "2,550";

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          padding: "1rem 5vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--ink-08)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "1.25rem",
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
            fontWeight: 500,
            color: "var(--ink-30)",
          }}
        >
          Trade Executed
        </span>
      </nav>

      {/* ── INK HERO — the resolution statement ── */}
      <section
        style={{
          marginTop: "3.5rem",
          background: "var(--ink)",
          padding: "3rem 5vw",
          position: "relative",
          overflow: "hidden",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            top: "50%",
            right: "-10%",
            transform: "translate(0, -50%)",
            background: "radial-gradient(circle, rgba(234,76,0,0.1) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div className="mark-eyebrow" style={{ marginBottom: "1.5rem", color: "var(--terra-lt)" }}>
          Position Closed
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            lineHeight: 1.2,
            color: "var(--white)",
            position: "relative",
            maxWidth: "500px",
            marginBottom: "1rem",
          }}
        >
          {trade ? `${trade.ticker} position` : "SMCI position"}{" "}
          <span style={{ color: "var(--orange)" }}>reduced by 50%</span>
        </h1>

        <p
          style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(1.375rem, 3vw, 1.75rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--orange)",
            marginBottom: "0.75rem",
          }}
        >
          Est. savings: ~${estSavings}
        </p>

        <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.35)" }}>
          Based on historical 12% avg decline over 30 days
        </p>
      </section>

      {/* ── TRADE CONFIRMATION + OVERMIND ── */}
      <div
        className="mark-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1px",
          background: "var(--ink-08)",
          borderRadius: "8px",
          overflow: "hidden",
          marginTop: "1px",
        }}
      >
        {/* LEFT: Trade Confirmation */}
        <div style={{ background: "var(--white)", padding: "1.5rem" }}>
          <div className="mark-eyebrow" style={{ marginBottom: "1.25rem" }}>
            Trade Confirmation
          </div>

          {trade ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "order id", value: trade.id },
                { label: "action", value: `${trade.action} ${trade.shares} shares` },
                { label: "price", value: `$${trade.price.toFixed(2)} / share` },
                { label: "total", value: `$${trade.totalValue.toLocaleString()}`, highlight: true },
                { label: "before", value: `${trade.beforeShares} shares` },
                { label: "after", value: `${trade.afterShares} shares` },
                { label: "approval", value: trade.approvedVia === "auth0_ciba" ? "Auth0 CIBA" : trade.approvedVia },
                { label: "executed", value: new Date(trade.executedAt).toLocaleTimeString() },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "0.625rem 0",
                    }}
                  >
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)", textTransform: "capitalize" }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: row.label === "order id" ? "var(--font-mono)" : "var(--font-body)",
                        fontWeight: row.highlight ? 600 : 500,
                        fontSize: row.highlight ? "var(--text-base)" : "var(--text-sm)",
                        color: row.highlight ? "var(--orange)" : row.label === "approval" ? "var(--terra)" : "var(--ink)",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ height: "1px", background: "var(--ink-08)" }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "trigger", value: "CEO sold $2.1M (Mar 19)" },
                { label: "pattern", value: "3 similar events — avg −12%" },
                { label: "action", value: "Sold 500 shares @ $42.50" },
                { label: "approval", value: "Auth0 CIBA", highlight: true },
              ].map((item, i, arr) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.625rem 0" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)", textTransform: "capitalize" }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: item.highlight ? "var(--terra)" : "var(--ink)" }}>
                      {item.value}
                    </span>
                  </div>
                  {i < arr.length - 1 && <div style={{ height: "1px", background: "var(--ink-08)" }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Overmind Trace */}
        <div style={{ background: "var(--paper)", padding: "1.5rem" }}>
          <div className="mark-eyebrow" style={{ marginBottom: "1.25rem" }}>
            Overmind — Agent Trace
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {OVERMIND_TRACE.map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    flexShrink: 0,
                    marginTop: "0.375rem",
                  }}
                />
                <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6 }}>
                  {line}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "1rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--ink-08)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--terra)" }} />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--terra)" }}>
              3 decisions — all within policy
            </span>
          </div>
        </div>
      </div>

      {/* ── GHOST DB + STILL WATCHING ── */}
      <div
        className="mark-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1px",
          background: "var(--ink-08)",
          borderRadius: "8px",
          overflow: "hidden",
          marginTop: "1px",
        }}
      >
        {/* LEFT: Ghost DB status */}
        <div style={{ background: "var(--white)", padding: "1.5rem" }}>
          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>
            Ghost DB
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              "Signal stored in signals table",
              "Trade logged in trades table",
              "Portfolio position updated",
              "Learning logged in agent_learnings",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink)", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Still watching */}
        <div style={{ background: "var(--paper)", padding: "1.5rem" }}>
          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>
            Still Watching
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {positions
              .filter((p) => p.ticker !== "SMCI")
              .map((p) => (
                <div key={p.ticker} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--terra)",
                      animation: "joint-pulse 2.5s ease-in-out infinite",
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", color: "var(--ink)" }}>
                    {p.ticker}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", marginLeft: "auto" }}>
                    {p.shares} shares — no signals
                  </span>
                </div>
              ))}
            {positions.length === 0 && (
              <>
                {["TSLA", "NVDA"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--terra)", animation: "joint-pulse 2.5s ease-in-out infinite" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", color: "var(--ink)" }}>{t}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", marginLeft: "auto" }}>no signals</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── CALL 911STOCK ── */}
      <div style={{ padding: "2rem 5vw", background: "var(--white)", borderTop: "1px solid var(--ink-08)" }}>
        <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>
          Call 911stock
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleCallMe}
            disabled={calling || callStatus === "done"}
            className="mark-fire"
            style={{
              flex: 1,
              minWidth: "200px",
              border: "none",
              color: "var(--white)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              letterSpacing: "0.02em",
              padding: "1rem 1.5rem",
              borderRadius: "6px",
              cursor: calling || callStatus === "done" ? "not-allowed" : "pointer",
              opacity: calling || callStatus === "done" ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {callStatus === "idle" && (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Ask about your portfolio
              </>
            )}
            {callStatus === "calling" && (
              <>
                <span className="mark-spinner" />
                Calling you now...
              </>
            )}
            {callStatus === "done" && "Call initiated — pick up your phone"}
            {callStatus === "error" && "Call failed — check .env.local"}
          </button>

          <button
            onClick={() => router.push("/")}
            style={{
              background: "var(--white)",
              border: "1px solid var(--ink-08)",
              color: "var(--ink-50)",
              fontWeight: 500,
              fontSize: "var(--text-sm)",
              padding: "1rem 1.5rem",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--ink-15)";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--ink-08)";
              e.currentTarget.style.color = "var(--ink-50)";
            }}
          >
            Back to watchlist
          </button>
        </div>

        <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)", marginTop: "0.75rem" }}>
          The agent will call your phone and answer questions about your stocks.
        </p>
      </div>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "1.5rem 5vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--ink-08)",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontStyle: "italic", color: "var(--ink-30)" }}>
          911stock
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Bland AI", "Ghost DB", "Auth0 CIBA", "Overmind"].map((t) => (
            <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>
              {t}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
}
