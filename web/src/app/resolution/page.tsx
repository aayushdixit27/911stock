"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TRADE_DETAILS = [
  { label: "trigger", value: "CEO sold $2.1M (Mar 19)" },
  { label: "pattern", value: "3 similar events — avg −12%" },
  { label: "action", value: "Sold 500 shares @ $42.50" },
  { label: "approval", value: "Auth0 CIBA", highlight: true },
];

const OVERMIND_TRACE = [
  "Signal detected: HIGH significance (SMCI CEO sell)",
  "Recommendation: Alert user + suggest position reduction",
  "Trade executed: SMCI −50% (user approved via CIBA)",
];

export default function Resolution() {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "done" | "error">("idle");

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
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "lowercase" as const,
            color: "var(--ink-30)",
          }}
        >
          action taken
        </span>
      </nav>

      {/* ── INK HERO — the resolution statement ── */}
      <section
        style={{
          marginTop: 62,
          background: "var(--ink)",
          padding: "72px 7vw",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fire glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            top: "50%",
            right: "10%",
            transform: "translate(0, -50%)",
            background: "radial-gradient(circle, rgba(255,69,0,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.4em",
            textTransform: "lowercase" as const,
            color: "var(--terra-lt)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
            position: "relative",
          }}
        >
          <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--terra-lt)" }} />
          position closed
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(32px, 5vw, 56px)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--white)",
            position: "relative",
            maxWidth: 600,
            marginBottom: 20,
          }}
        >
          SMCI position{" "}
          <span style={{ color: "var(--orange)" }}>reduced by 50%</span>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(28px, 4vw, 48px)",
            letterSpacing: "-0.02em",
            color: "var(--orange)",
            position: "relative",
          }}
        >
          Est. savings: ~$2,550
        </p>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.25)",
            marginTop: 16,
            position: "relative",
          }}
        >
          based on historical 12% avg decline over 30 days
        </p>
      </section>

      {/* ── TWO-COLUMN: Trade Details + Overmind Trace ── */}
      <div
        className="mark-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: "var(--ink-10)",
        }}
      >
        {/* LEFT: Trade Details */}
        <div style={{ background: "var(--white)", padding: "36px 28px" }}>
          <div className="mark-eyebrow" style={{ marginBottom: 28 }}>
            trade details
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TRADE_DETAILS.map((item, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "14px 0",
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
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: 14,
                      color: item.highlight ? "var(--terra)" : "var(--ink)",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
                {i < TRADE_DETAILS.length - 1 && (
                  <div style={{ height: 1, background: "var(--ink-10)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Overmind Trace */}
        <div style={{ background: "var(--paper)", padding: "36px 28px" }}>
          <div className="mark-eyebrow" style={{ marginBottom: 28 }}>
            overmind — agent trace
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {OVERMIND_TRACE.map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Ink dot — done state */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: 14,
                    color: "var(--ink-60)",
                    lineHeight: 1.6,
                  }}
                >
                  {line}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid var(--ink-10)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--terra)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.15em",
                color: "var(--terra)",
              }}
            >
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
          gap: 1,
          background: "var(--ink-10)",
          borderTop: "1px solid var(--ink-10)",
        }}
      >
        {/* LEFT: Ghost DB status */}
        <div style={{ background: "var(--white)", padding: "32px 28px" }}>
          <div className="mark-eyebrow" style={{ marginBottom: 20 }}>
            ghost db
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Signal stored in signals table",
              "Learning logged in agent_learnings",
              "Alert recorded in alerts table",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--ink-60)",
                  }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Still watching */}
        <div style={{ background: "var(--paper)", padding: "32px 28px" }}>
          <div className="mark-eyebrow" style={{ marginBottom: 20 }}>
            still watching
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { ticker: "TSLA", status: "no signals" },
              { ticker: "NVDA", status: "no signals" },
            ].map((item) => (
              <div key={item.ticker} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--terra)",
                    animation: "joint-pulse 2.5s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                  }}
                >
                  {item.ticker}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--ink-30)",
                    marginLeft: "auto",
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CALL 911STOCK — full width ── */}
      <div style={{ padding: "48px 7vw", background: "var(--white)", borderTop: "1px solid var(--ink-10)" }}>
        <div className="mark-eyebrow" style={{ marginBottom: 20 }}>
          call 911stock — ask anything
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={handleCallMe}
            disabled={calling || callStatus === "done"}
            className="mark-fire"
            style={{
              flex: 1,
              border: "none",
              color: "var(--white)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              padding: "22px 0",
              borderRadius: 3,
              cursor: calling || callStatus === "done" ? "not-allowed" : "pointer",
              opacity: calling || callStatus === "done" ? 0.5 : 1,
              transition: "opacity 0.3s",
              position: "relative",
              zIndex: 1,
            }}
          >
            {callStatus === "idle" && "call 911stock — ask about your portfolio"}
            {callStatus === "calling" && (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span className="mark-spinner" />
                calling you now...
              </span>
            )}
            {callStatus === "done" && "call initiated — pick up your phone"}
            {callStatus === "error" && "call failed — check .env.local"}
          </button>

          <button
            onClick={() => router.push("/")}
            style={{
              background: "var(--white)",
              border: "1px solid var(--ink-10)",
              color: "var(--ink-30)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: "0.1em",
              padding: "22px 32px",
              borderRadius: 3,
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--ink-30)";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--ink-10)";
              e.currentTarget.style.color = "var(--ink-30)";
            }}
          >
            Back to watchlist
          </button>
        </div>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-30)",
            marginTop: 12,
          }}
        >
          The agent will call your phone and answer questions about your stocks.
        </p>
      </div>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "32px 7vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--ink-10)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.18em",
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
