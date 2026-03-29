"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NewsTimeline } from "@/components/NewsTimeline";
import Nav from "@/components/Nav";

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

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function PageClient({ user }: { user: User }) {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchItem[]>([
    { ticker: "SMCI", sensitivity: "major_only" },
    { ticker: "TSLA", sensitivity: "major_only" },
    { ticker: "NVDA", sensitivity: "all_news" },
  ]);
  const [input, setInput] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(SEED_SIGNALS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalDetected, setSignalDetected] = useState(false);
  const [livePrices, setLivePrices] = useState(DEFAULT_PRICES);

  const handlePriceUpdate = useCallback((prices: Record<string, { price: number; change: number; changePct: number }>) => {
    setLivePrices((prev) => ({ ...prev, ...prices }));
  }, []);

  // Fetch prices for all watchlist tickers when day changes
  const handleDayChange = useCallback(async (dayIndex: number) => {
    // Fetch prices for all tickers in watchlist
    const tickers = watchlist.map((w) => w.ticker);
    const results = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const res = await fetch(`/api/stock-quote?ticker=${ticker}`);
          if (res.ok) {
            const data = await res.json();
            if (data.price) {
              return {
                ticker,
                price: data.price,
                change: data.change,
                changePct: data.changePct,
              };
            }
          }
        } catch (err) {
          console.error(`Failed to fetch price for ${ticker}:`, err);
        }
        return null;
      })
    );

    // Update prices for successfully fetched tickers
    const newPrices: Record<string, { price: number; change: number; changePct: number }> = {};
    for (const result of results) {
      if (result) {
        newPrices[result.ticker] = {
          price: result.price,
          change: result.change,
          changePct: result.changePct,
        };
      }
    }
    setLivePrices((prev) => ({ ...prev, ...newPrices }));
  }, [watchlist]);

  const handleSignalDetected = useCallback(async () => {
    setSignalDetected(true);
    setSelectedSignal(SEED_SIGNALS[0]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
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

  async function addTicker() {
    const t = input.trim().toUpperCase();
    if (t && !watchlist.find((w) => w.ticker === t)) {
      setWatchlist([...watchlist, { ticker: t, sensitivity: "major_only" }]);
      setInput("");
      
      // Fetch price for the new ticker
      try {
        const res = await fetch(`/api/stock-quote?ticker=${t}`);
        if (res.ok) {
          const data = await res.json();
          if (data.price) {
            setLivePrices((prev) => ({
              ...prev,
              [t]: {
                price: data.price,
                change: data.change,
                changePct: data.changePct,
              },
            }));
          }
        }
      } catch (err) {
        console.error(`Failed to fetch price for ${t}:`, err);
      }
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
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
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

  const sigColor: Record<Signal["significance"], string> = {
    high: "var(--orange)",
    medium: "var(--terra)",
    low: "var(--ink-30)",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* ── NAV ── */}
      <Nav user={user} />

      {/* ── DASHBOARD BODY ── */}
      <div style={{ padding: "5rem 5vw 2.5rem" }}>
        {/* ── TOP ROW: Watchlist + Signal Feed ── */}
        <div
          className="mark-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "var(--ink-08)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* LEFT: Watchlist */}
          <div style={{ background: "var(--white)", padding: "1.5rem" }}>
            <div className="mark-eyebrow" style={{ marginBottom: "1.25rem" }}>
              Watchlist
            </div>

            {/* Ticker rows */}
            <div style={{ marginBottom: "1rem" }}>
              {watchlist.map((w, i) => {
                const p = livePrices[w.ticker];
                return (
                  <div key={w.ticker}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.75rem 0",
                      }}
                    >
                      {/* Ticker name */}
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.375rem",
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                          color: "var(--ink)",
                          minWidth: "4rem",
                        }}
                      >
                        {w.ticker}
                      </span>

                      {/* Price */}
                      {p && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "var(--text-sm)",
                            fontWeight: 500,
                            color: p.changePct >= 0 ? "var(--ink-50)" : "var(--orange)",
                            minWidth: "7rem",
                            transition: "color 0.3s",
                          }}
                        >
                          ${p.price.toFixed(2)}{" "}
                          <span style={{ 
                            fontSize: "var(--text-xs)", 
                            color: p.changePct >= 0 ? "var(--ink-30)" : "var(--orange)",
                            marginLeft: "0.25rem"
                          }}>
                            {p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(1)}%
                          </span>
                        </span>
                      )}

                      {/* Sensitivity dropdown */}
                      <select
                        value={w.sensitivity}
                        onChange={(e) => setSensitivity(w.ticker, e.target.value as Sensitivity)}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 500,
                          color: "var(--ink-50)",
                          background: "var(--paper)",
                          border: "1px solid var(--ink-08)",
                          borderRadius: "4px",
                          padding: "0.375rem 0.625rem",
                          cursor: "pointer",
                          marginLeft: "auto",
                        }}
                      >
                        <option value="major_only">{SENSITIVITY_LABELS.major_only}</option>
                        <option value="all_news">{SENSITIVITY_LABELS.all_news}</option>
                        <option value="act_auto">{SENSITIVITY_LABELS.act_auto}</option>
                      </select>

                      {/* Remove */}
                      <button
                        onClick={() => removeTicker(w.ticker)}
                        aria-label={`Remove ${w.ticker}`}
                        style={{
                          background: "none",
                          border: "1px solid var(--ink-08)",
                          borderRadius: "4px",
                          width: "1.75rem",
                          height: "1.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "var(--ink-30)",
                          fontSize: "1rem",
                          transition: "color 0.15s, border-color 0.15s, background 0.15s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--orange)";
                          e.currentTarget.style.borderColor = "var(--orange-lt)";
                          e.currentTarget.style.background = "rgba(234,76,0,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--ink-30)";
                          e.currentTarget.style.borderColor = "var(--ink-08)";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        ×
                      </button>
                    </div>
                    {i < watchlist.length - 1 && (
                      <div style={{ height: "1px", background: "var(--ink-08)" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add ticker */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && addTicker()}
                placeholder="AAPL"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase" as const,
                  color: "var(--ink)",
                  background: "var(--paper)",
                  border: "1px solid var(--ink-08)",
                  borderRadius: "4px",
                  padding: "0.5rem 0.75rem",
                  flex: 1,
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--terra)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(196,92,46,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--ink-08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={addTicker}
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "var(--text-xs)",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase" as const,
                  color: "var(--white)",
                  background: "var(--ink)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--ink-70)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--ink)";
                }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* RIGHT: News Timeline */}
          <div style={{ background: "var(--paper)", padding: "1.5rem" }}>
            <div className="mark-eyebrow" style={{ marginBottom: "1.25rem" }}>
              News Timeline
            </div>
            <NewsTimeline onSignalDetected={handleSignalDetected} onPriceUpdate={handlePriceUpdate} onDayChange={handleDayChange} />
          </div>
        </div>

        {/* ── CALL AI BUTTON — full width fire field ── */}
        <div style={{ marginTop: "1px" }}>
          <button
            onClick={handleCallAI}
            disabled={loading || !signalDetected}
            className="mark-fire"
            style={{
              width: "100%",
              border: "none",
              color: "var(--white)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              letterSpacing: "0.04em",
              padding: "1.25rem 0",
              borderRadius: "0 0 8px 8px",
              cursor: loading || !signalDetected ? "not-allowed" : "pointer",
              opacity: loading || !signalDetected ? 0.6 : 1,
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            {loading ? (
              <>
                <span className="mark-spinner" />
                Signal detected — calling you now...
              </>
            ) : signalDetected && selectedSignal ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Signal detected — {selectedSignal.ticker}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Play timeline to detect signals
              </>
            )}
          </button>
          {error && (
            <p
              style={{
                textAlign: "center",
                color: "var(--orange)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                padding: "1rem 0",
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
              gap: "1px",
              background: "var(--ink-08)",
              borderRadius: "8px",
              overflow: "hidden",
              marginTop: "1.5rem",
            }}
          >
            {/* LEFT: Reasons for Call */}
            <div style={{ background: "var(--white)", padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div className="mark-eyebrow" style={{ marginBottom: 0 }}>
                  Reasons for Call
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: sigColor[selectedSignal.significance],
                  }}
                >
                  {selectedSignal.significance}
                </span>
              </div>

              {selectedSignal.reasons.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {selectedSignal.reasons.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          color: "var(--orange)",
                          flexShrink: 0,
                          marginTop: "0.125rem",
                          minWidth: "1.25rem",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-base)",
                          lineHeight: 1.6,
                          color: "var(--ink)",
                        }}
                      >
                        {r}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>
                  No significant reasons — routine transaction.
                </p>
              )}

              {/* Signal detail */}
              <div
                style={{
                  marginTop: "1.25rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--ink-08)",
                }}
              >
                <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.7, color: "var(--ink-50)" }}>
                  {selectedSignal.detail}
                </p>
              </div>
            </div>

            {/* RIGHT: Context */}
            <div style={{ background: "var(--paper)", padding: "1.5rem" }}>
              <div className="mark-eyebrow" style={{ marginBottom: "1.25rem" }}>
                Context
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {Object.entries(selectedSignal.context).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "0.375rem 0",
                    }}
                  >
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)", textTransform: "capitalize" }}>
                      {key}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
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

      {/* ── VERIFIED SOURCES — shown when signal detected ── */}
      {signalDetected && (
        <div
          style={{
            padding: "2rem 5vw",
            background: "var(--ink)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Fire glow */}
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              top: "50%",
              right: "5%",
              transform: "translate(0, -50%)",
              background: "radial-gradient(circle, rgba(234,76,0,0.1) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "var(--terra-lt)",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.25rem",
              position: "relative",
            }}
          >
            <span style={{ display: "inline-block", width: "1.25rem", height: 2, background: "var(--terra-lt)", borderRadius: 1 }} />
            Verified Sources
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "6px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {[
              {
                type: "SEC Filing",
                title: "Form 4 — Insider Transaction",
                detail: "Filed Mar 19, 2026 at 4:30 PM EST",
                url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=SMCI&type=4",
                badge: "Primary Source",
              },
              {
                type: "DOJ Press Release",
                title: "Three Charged With Conspiring to Divert AI Technology to China",
                detail: "Office of Public Affairs · Mar 19, 2026",
                url: "https://www.justice.gov/opa/pr/three-charged-conspiring-unlawfully-divert-cutting-edge-us-artificial-intelligence",
                badge: "Government",
              },
              {
                type: "Reuters",
                title: "US charges 3 tied to Super Micro with smuggling AI chips to China",
                detail: "Kanishka Singh, Karen Freifeld · Mar 19, 2026",
                url: "https://www.reuters.com/world/us-charges-three-people-with-conspiring-divert-ai-tech-china-2026-03-19/",
                badge: "Wire Service",
              },
            ].map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "rgba(26,26,24,0.95)",
                  padding: "1.25rem",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(26,26,24,0.85)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(26,26,24,0.95)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 500,
                      color: "var(--orange)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {src.type}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.06)",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "3px",
                    }}
                  >
                    {src.badge}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--white)",
                    lineHeight: 1.4,
                  }}
                >
                  {src.title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {src.detail}
                </p>
              </a>
            ))}
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "rgba(255,255,255,0.2)",
              marginTop: "1rem",
              position: "relative",
            }}
          >
            911Stock cites its sources. Every alert is traceable to primary filings.
          </p>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "1.5rem 5vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--ink-08)",
          marginTop: "2.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontStyle: "italic",
            color: "var(--ink-30)",
          }}
        >
          911stock
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Bland AI", "Ghost DB", "Auth0 CIBA", "Overmind"].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
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
