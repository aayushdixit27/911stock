"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Trade = {
  id: string;
  signalId: string | null;
  ticker: string;
  action: string;
  shares: number;
  price: number;
  totalValue: number;
  reductionPct: number;
  orderId: string;
  approvedVia: string;
  executedAt: string;
  beforeShares: number;
  afterShares: number;
};

type Position = {
  ticker: string;
  companyName?: string;
  shares: number;
  avgCost?: number;
  currentPrice?: number;
};

const OVERMIND_TRACE = [
  "Signal detected: HIGH significance (SMCI CEO sell)",
  "Recommendation: Alert user + suggest position reduction",
  "Trade executed: SMCI −50% (user approved via web)",
];

const GHOST_WRITES = [
  "Signal → signals table",
  "Trade → trades table",
  "Position updated",
  "Learning → agent_learnings",
];

export default function Resolution() {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "done" | "error">("idle");
  const [trade, setTrade] = useState<Trade | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch portfolio and latest trade
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        setPositions(data.positions || []);
        if (data.lastTrade) {
          setTrade(data.lastTrade);
        }
      })
      .catch(() => {});

    // Fetch trade history from the new endpoint
    fetch("/api/trades?limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (data.trades && data.trades.length > 0) {
          setTradeHistory(data.trades);
          // If no trade from portfolio, use the latest from history
          if (!trade) {
            setTrade(data.trades[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
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

  const tradeRows = trade
    ? [
        { label: "Order ID", value: trade.orderId.slice(0, 20) + "...", mono: true },
        { label: "Trade ID", value: trade.id.slice(0, 16) + "...", mono: true },
        { label: "Action", value: `${trade.action} ${trade.shares.toLocaleString()} shares @ $${trade.price.toFixed(2)}` },
        { label: "Total", value: `$${trade.totalValue.toLocaleString()}`, highlight: true },
        { label: "Position", value: `${trade.beforeShares.toLocaleString()} → ${trade.afterShares.toLocaleString()} shares` },
        { label: "Reduction", value: `${trade.reductionPct}%` },
        { label: "Approval", value: trade.approvedVia.replace("_", " ").toUpperCase(), terra: true },
        { label: "Time", value: new Date(trade.executedAt).toLocaleString() },
      ]
    : [
        { label: "Trigger", value: "CEO sold $2.1M (Mar 19)" },
        { label: "Pattern", value: "3 similar events — avg −12%" },
        { label: "Action", value: "Sold 500 shares @ $42.50" },
        { label: "Approval", value: "Auth0 CIBA", terra: true },
      ];

  const watchingStocks = positions.length > 0
    ? positions.filter((p) => p.ticker !== trade?.ticker)
    : [{ ticker: "TSLA", shares: 200 }, { ticker: "NVDA", shares: 500 }];

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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--ink-30)" }}>
          Trade Executed
        </span>
      </nav>

      {/* ── INK HERO ── */}
      <section
        style={{
          marginTop: "3.5rem",
          background: "var(--ink)",
          padding: "2.5rem 5vw 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            top: "50%",
            right: "-5%",
            transform: "translate(0, -50%)",
            background: "radial-gradient(circle, rgba(234,76,0,0.1) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", position: "relative" }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                lineHeight: 1.2,
                color: "var(--white)",
                marginBottom: "0.5rem",
              }}
            >
              {trade ? trade.ticker : "SMCI"} position{" "}
              <span style={{ color: "var(--orange)" }}>reduced by {trade ? trade.reductionPct : 50}%</span>
            </h1>
            <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.3)" }}>
              Based on historical 12% avg decline over 30 days
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "var(--orange)",
              }}
            >
              ~${estSavings}
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.3)" }}>
              estimated savings
            </p>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT — single compact grid ── */}
      <div style={{ padding: "0 5vw" }}>
        {/* Trade + Overmind row */}
        <div
          className="mark-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "var(--ink-08)",
          }}
        >
          {/* Trade Confirmation */}
          <div style={{ background: "var(--white)", padding: "1.25rem 1.5rem" }}>
            <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Trade Confirmation</div>
            {tradeRows.map((row, i) => (
              <div key={row.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.5rem 0" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>{row.label}</span>
                  <span
                    style={{
                      fontFamily: row.mono ? "var(--font-mono)" : "var(--font-body)",
                      fontWeight: row.highlight ? 600 : 500,
                      fontSize: row.highlight ? "var(--text-base)" : "var(--text-sm)",
                      color: row.highlight ? "var(--orange)" : row.terra ? "var(--terra)" : "var(--ink)",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
                {i < tradeRows.length - 1 && <div style={{ height: "1px", background: "var(--ink-08)" }} />}
              </div>
            ))}
          </div>

          {/* Overmind + Ghost DB combined */}
          <div style={{ background: "var(--paper)", padding: "1.25rem 1.5rem" }}>
            <div className="mark-eyebrow" style={{ marginBottom: "0.875rem" }}>Overmind — Agent Trace</div>
            {OVERMIND_TRACE.map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.3rem 0" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink)", flexShrink: 0, marginTop: "0.35rem" }} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)", lineHeight: 1.5 }}>{line}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", margin: "0.5rem 0 1rem" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--terra)" }} />
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--terra)" }}>3 decisions — all within policy</span>
            </div>

            <div style={{ height: "1px", background: "var(--ink-08)", margin: "0.75rem 0" }} />

            <div className="mark-eyebrow" style={{ marginBottom: "0.875rem" }}>Ghost DB</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {GHOST_WRITES.map((w) => (
                <span
                  key={w}
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--ink-50)",
                    background: "var(--white)",
                    padding: "0.25rem 0.625rem",
                    borderRadius: "4px",
                    border: "1px solid var(--ink-08)",
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Trade History Section */}
        {!loading && tradeHistory.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Recent Trades</div>
            <div style={{ background: "var(--white)", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--ink-08)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--paper)" }}>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "var(--text-xs)", color: "var(--ink-50)", fontWeight: 500 }}>Ticker</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "var(--text-xs)", color: "var(--ink-50)", fontWeight: 500 }}>Action</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "var(--text-xs)", color: "var(--ink-50)", fontWeight: 500 }}>Shares</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "var(--text-xs)", color: "var(--ink-50)", fontWeight: 500 }}>Price</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "var(--text-xs)", color: "var(--ink-50)", fontWeight: 500 }}>Total</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "var(--text-xs)", color: "var(--ink-50)", fontWeight: 500 }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map((t, i) => (
                    <tr key={t.id} style={{ borderTop: "1px solid var(--ink-08)", background: i % 2 === 0 ? "var(--white)" : "var(--paper)" }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink)" }}>{t.ticker}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: t.action === "SELL" ? "var(--orange)" : "#22c55e" }}>{t.action}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: "var(--ink)" }}>{t.shares.toLocaleString()}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", color: "var(--ink)" }}>${t.price.toFixed(2)}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--ink)" }}>${t.totalValue.toLocaleString()}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>{new Date(t.executedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Still watching + Call — single row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 0",
            borderTop: "1px solid var(--ink-08)",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          {/* Still watching */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--ink-30)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Still watching
            </span>
            {watchingStocks.map((p) => (
              <div key={p.ticker} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--terra)", animation: "joint-pulse 2.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--ink)" }}>{p.ticker}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>{p.shares}sh</span>
              </div>
            ))}
          </div>

          {/* Call + Back buttons */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              onClick={handleCallMe}
              disabled={calling || callStatus === "done"}
              className="mark-fire"
              style={{
                border: "none",
                color: "var(--white)",
                fontWeight: 600,
                fontSize: "var(--text-xs)",
                padding: "0.625rem 1.25rem",
                borderRadius: "5px",
                cursor: calling || callStatus === "done" ? "not-allowed" : "pointer",
                opacity: calling || callStatus === "done" ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              {callStatus === "idle" && (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Call 911Stock
                </>
              )}
              {callStatus === "calling" && <><span className="mark-spinner" style={{ width: 14, height: 14 }} /> Calling...</>}
              {callStatus === "done" && "Pick up your phone"}
              {callStatus === "error" && "Call failed"}
            </button>
            <button
              onClick={() => router.push("/")}
              style={{
                background: "var(--white)",
                border: "1px solid var(--ink-08)",
                color: "var(--ink-50)",
                fontWeight: 500,
                fontSize: "var(--text-xs)",
                padding: "0.625rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "1rem 5vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--ink-08)",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.875rem", fontStyle: "italic", color: "var(--ink-30)" }}>
          911stock
        </span>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          {["Bland AI", "Ghost DB", "Auth0", "Overmind"].map((t) => (
            <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--ink-30)" }}>{t}</span>
          ))}
        </div>
      </footer>
    </main>
  );
}
