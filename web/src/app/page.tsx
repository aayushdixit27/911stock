"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NewsTimeline } from "@/components/NewsTimeline";

type Sensitivity = "major_only" | "all_news" | "act_auto";

type WatchItem = {
  ticker: string;
  sensitivity: Sensitivity;
};

type Signal = {
  ticker: string;
  headline: string;
  date: string;
  detail: string;
  significance: "high" | "medium" | "low";
  reasons: string[];
  context: Record<string, string>;
};

const DEFAULT_PRICES: Record<string, { price: number; change: number; changePct: number }> = {
  SMCI: { price: 42.50, change: 1.72, changePct: 4.2 },
  TSLA: { price: 285.20, change: 2.28, changePct: 0.8 },
  NVDA: { price: 142.80, change: -0.14, changePct: -0.1 },
};

const SEED_SIGNALS: Signal[] = [
  {
    ticker: "SMCI",
    headline: "CEO sold $2.1M — unscheduled",
    date: "Mar 19",
    detail: "Charles Liang sold 50,000 shares outside 10b5-1 plan. First sale in 14 months.",
    significance: "high",
    reasons: [
      "First unscheduled sale in 14 months",
      "3 historical matches — avg 12% drop in 30 days",
      "Outside 10b5-1 scheduled plan",
    ],
    context: {
      "ghost db": "3 pattern matches",
      "avg 30-day drop": "−12%",
      "last similar event": "aug 2025",
      "your position": "1,000 shares",
      "current value": "$42,500",
      "overmind": "within policy",
    },
  },
  {
    ticker: "NVDA",
    headline: "CFO sold $890K — scheduled",
    date: "Mar 21",
    detail: "Routine 10b5-1 plan execution. No pattern deviation.",
    significance: "low",
    reasons: [],
    context: {
      "ghost db": "1 pattern match",
      "classification": "routine 10b5-1",
    },
  },
];

const SENSITIVITY_LABELS: Record<Sensitivity, string> = {
  major_only: "major only",
  all_news: "all news",
  act_auto: "act auto",
};

export default function Home() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchItem[]>([
    { ticker: "SMCI", sensitivity: "major_only" },
    { ticker: "TSLA", sensitivity: "major_only" },
    { ticker: "NVDA", sensitivity: "all_news" },
  ]);
  const [input, setInput] = useState("");
  const [signals] = useState<Signal[]>(SEED_SIGNALS);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(SEED_SIGNALS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalDetected, setSignalDetected] = useState(false);
  const [livePrices, setLivePrices] = useState(DEFAULT_PRICES);

  const handlePriceUpdate = useCallback((prices: Record<string, { price: number; change: number; changePct: number }>) => {
    setLivePrices((prev) => ({ ...prev, ...prices }));
  }, []);

  const handleSignalDetected = useCallback(async () => {
    setSignalDetected(true);
    setSelectedSignal(SEED_SIGNALS[0]);
    // Auto-trigger the pipeline — no button click needed
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Agent pipeline failed");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [router]);

  function addTicker() {
    const t = input.trim().toUpperCase();
    if (t && !watchlist.find((w) => w.ticker === t)) {
      setWatchlist([...watchlist, { ticker: t, sensitivity: "major_only" }]);
      setInput("");
    }
  }

  function removeTicker(ticker: string) {
    setWatchlist(watchlist.filter((w) => w.ticker !== ticker));
  }

  function setSensitivity(ticker: string, s: Sensitivity) {
    setWatchlist(watchlist.map((w) => (w.ticker === ticker ? { ...w, sensitivity: s } : w)));
  }

  async function handleCallAI() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Agent pipeline failed");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const sigColor: Record<string, string> = {
    high: "var(--orange)",
    medium: "var(--terra)",
    low: "var(--ink-30)",
  };

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
          padding: "18px 7vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--ink-10)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            color: "var(--orange)",
          }}
        >
          911stock
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--ink-30)",
            border: "1px solid var(--ink-10)",
            padding: "5px 14px",
          }}
        >
          deep agents hackathon 2026
        </span>
      </nav>

      {/* ── DASHBOARD BODY ── */}
      <div style={{ padding: "90px 7vw 40px" }}>
        {/* ── TOP ROW: Watchlist + Signal Feed ── */}
        <div
          className="mark-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: "var(--ink-10)",
            marginBottom: 1,
          }}
        >
          {/* LEFT: Watchlist */}
          <div style={{ background: "var(--white)", padding: "32px 28px" }}>
            <div className="mark-eyebrow" style={{ marginBottom: 28 }}>
              watchlist
            </div>

            {/* Ticker rows */}
            <div style={{ marginBottom: 24 }}>
              {watchlist.map((w, i) => {
                const p = livePrices[w.ticker];
                return (
                  <div key={w.ticker}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "14px 0",
                      }}
                    >
                      {/* Ticker name */}
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 22,
                          letterSpacing: "-0.02em",
                          color: "var(--ink)",
                          minWidth: 70,
                        }}
                      >
                        {w.ticker}
                      </span>

                      {/* Price */}
                      {p && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 13,
                            color: p.changePct >= 0 ? "var(--ink-60)" : "var(--orange)",
                            minWidth: 120,
                            transition: "color 0.3s",
                          }}
                        >
                          ${p.price.toFixed(2)}{" "}
                          <span style={{ color: p.changePct >= 0 ? "var(--ink-30)" : "var(--orange)" }}>
                            {p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(1)}%
                          </span>
                        </span>
                      )}

                      {/* Sensitivity dropdown */}
                      <select
                        value={w.sensitivity}
                        onChange={(e) => setSensitivity(w.ticker, e.target.value as Sensitivity)}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          letterSpacing: "0.15em",
                          color: "var(--ink-60)",
                          background: "var(--paper)",
                          border: "1px solid var(--ink-10)",
                          borderRadius: 3,
                          padding: "6px 10px",
                          cursor: "pointer",
                          marginLeft: "auto",
                          appearance: "auto" as const,
                        }}
                      >
                        <option value="major_only">{SENSITIVITY_LABELS.major_only}</option>
                        <option value="all_news">{SENSITIVITY_LABELS.all_news}</option>
                        <option value="act_auto">{SENSITIVITY_LABELS.act_auto}</option>
                      </select>

                      {/* Remove */}
                      <button
                        onClick={() => removeTicker(w.ticker)}
                        style={{
                          background: "none",
                          border: "1px solid var(--ink-10)",
                          borderRadius: 3,
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "var(--ink-30)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 14,
                          transition: "color 0.2s, border-color 0.2s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--orange)";
                          e.currentTarget.style.borderColor = "var(--orange)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--ink-30)";
                          e.currentTarget.style.borderColor = "var(--ink-10)";
                        }}
                      >
                        &times;
                      </button>
                    </div>
                    {i < watchlist.length - 1 && (
                      <div style={{ height: 1, background: "var(--ink-10)" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add ticker */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && addTicker()}
                placeholder="AAPL"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  color: "var(--ink)",
                  background: "var(--paper)",
                  border: "1px solid var(--ink-10)",
                  borderRadius: 3,
                  padding: "10px 14px",
                  flex: 1,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--terra)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ink-10)")}
              />
              <button
                onClick={addTicker}
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  color: "var(--white)",
                  background: "var(--ink)",
                  border: "none",
                  borderRadius: 3,
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
              >
                + add
              </button>
            </div>
          </div>

          {/* RIGHT: News Timeline */}
          <div style={{ background: "var(--paper)", padding: "32px 28px" }}>
            <div className="mark-eyebrow" style={{ marginBottom: 28 }}>
              news timeline
            </div>
            <NewsTimeline onSignalDetected={handleSignalDetected} onPriceUpdate={handlePriceUpdate} />
          </div>
        </div>

        {/* ── CALL AI BUTTON — full width fire field ── */}
        <div style={{ marginBottom: 1 }}>
          <button
            onClick={handleCallAI}
            disabled={loading || !signalDetected}
            className="mark-fire"
            style={{
              width: "100%",
              border: "none",
              color: "var(--white)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              padding: "28px 0",
              borderRadius: 0,
              cursor: loading || !signalDetected ? "not-allowed" : "pointer",
              opacity: loading || !signalDetected ? 0.5 : 1,
              transition: "opacity 0.3s",
              position: "relative",
              zIndex: 1,
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span className="mark-spinner" />
                signal detected — calling you now...
              </span>
            ) : signalDetected && selectedSignal
              ? `signal detected — ${selectedSignal.ticker}`
              : "play timeline to detect signals"}
          </button>
          {error && (
            <p
              style={{
                textAlign: "center",
                color: "var(--orange)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "12px 0",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* ── BOTTOM ROW: Reasons + Context ── */}
        {selectedSignal && (
          <div
            className="mark-grid-2"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              background: "var(--ink-10)",
            }}
          >
            {/* LEFT: Reasons for Call */}
            <div style={{ background: "var(--white)", padding: "32px 28px" }}>
              <div className="mark-eyebrow" style={{ marginBottom: 24 }}>
                reasons for call
              </div>

              {selectedSignal.reasons.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {selectedSignal.reasons.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--orange)",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                          fontSize: 15,
                          color: "var(--ink)",
                          lineHeight: 1.7,
                        }}
                      >
                        {r}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--ink-30)",
                  }}
                >
                  No significant reasons — routine transaction.
                </p>
              )}

              {/* Signal detail */}
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: "1px solid var(--ink-10)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: 14,
                    color: "var(--ink-60)",
                    lineHeight: 1.8,
                  }}
                >
                  {selectedSignal.detail}
                </p>
              </div>
            </div>

            {/* RIGHT: Context */}
            <div style={{ background: "var(--paper)", padding: "32px 28px" }}>
              <div className="mark-eyebrow" style={{ marginBottom: 24 }}>
                context
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(selectedSignal.context).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        letterSpacing: "0.15em",
                        color: "var(--ink-30)",
                      }}
                    >
                      {key}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: key === "overmind" ? "var(--terra)" : "var(--ink)",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "32px 7vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--ink-10)",
          marginTop: 40,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            color: "var(--ink-30)",
          }}
        >
          911stock
        </span>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["bland ai", "ghost db", "auth0 ciba", "overmind"].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "var(--ink-30)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
}
