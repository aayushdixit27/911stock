"use client";

import { useState } from "react";

const POPULAR_TICKERS = [
  "AAPL", "TSLA", "NVDA", "SMCI", "GOOGL", "AMZN", "META", "MSFT",
];

export default function SubscribePage() {
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleTicker(ticker: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else if (next.size < 5) {
        next.add(ticker);
      }
      return next;
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        maxWidth: 540,
        margin: "0 auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "1.25rem",
          color: "var(--orange)",
          marginBottom: "2.5rem",
        }}
      >
        911stock
      </div>

      {/* Headline */}
      <h1
        className="mark-display"
        style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)",
          textAlign: "center",
          marginBottom: "0.75rem",
        }}
      >
        Know when insiders sell,
        <br />
        before your portfolio drops.
      </h1>

      {/* Subline */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-lg)",
          color: "var(--ink-50)",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
          maxWidth: 420,
        }}
      >
        SEC Form 4 alerts with plain-English context, delivered to your phone
        within minutes. No app to download.
      </p>

      {/* Example Alert Card */}
      <div
        style={{
          width: "100%",
          background: "var(--white)",
          border: "1px solid var(--ink-08)",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "0.75rem",
          position: "relative",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Orange top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "var(--orange)",
            borderRadius: "12px 12px 0 0",
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--ember)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              letterSpacing: "0.03em",
            }}
          >
            SMCI
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "var(--orange)",
              background: "rgba(234,76,0,0.08)",
              padding: "0.15rem 0.45rem",
              borderRadius: 3,
              textTransform: "uppercase",
            }}
          >
            HIGH
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "1.25rem",
            lineHeight: 1.3,
            marginBottom: "0.625rem",
          }}
        >
          CEO sold $2.1M in stock
        </div>

        {/* Context */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "var(--ink-50)",
            lineHeight: 1.6,
            marginBottom: "1rem",
          }}
        >
          First unscheduled sale in 14 months. Last 3 times this pattern
          occurred, stock dropped 12% avg in 30 days. Outside his 10b5-1 plan.
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.03em",
              padding: "0.5rem 0.875rem",
              borderRadius: 4,
              border: "1px solid var(--ink)",
              background: "var(--ink)",
              color: "var(--white)",
              cursor: "pointer",
            }}
          >
            See SEC Filing
          </button>
          <button
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.03em",
              padding: "0.5rem 0.875rem",
              borderRadius: 4,
              border: "1px solid var(--ink-08)",
              background: "var(--white)",
              color: "var(--ink-50)",
              cursor: "pointer",
            }}
          >
            Details
          </button>
          <button
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.03em",
              padding: "0.5rem 0.875rem",
              borderRadius: 4,
              border: "1px solid var(--ink-08)",
              background: "var(--white)",
              color: "var(--ink-50)",
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Alert label */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          color: "var(--ink-30)",
          textAlign: "center",
          marginBottom: "2.5rem",
          letterSpacing: "0.02em",
        }}
      >
        Example alert. Delivered via RCS or SMS.
      </p>

      {/* Form */}
      <div style={{ width: "100%", marginBottom: "2rem" }}>
        <label
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-30)",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Phone number
        </label>
        <input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            padding: "0.875rem 1rem",
            border: "1px solid var(--ink-15)",
            borderRadius: 6,
            background: "var(--white)",
            color: "var(--ink)",
            outline: "none",
            marginBottom: "1.25rem",
          }}
        />

        <label
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-30)",
            marginBottom: "0.5rem",
            display: "block",
          }}
        >
          Watch up to 5 tickers
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {POPULAR_TICKERS.map((ticker) => {
            const isSelected = selected.has(ticker);
            return (
              <button
                key={ticker}
                onClick={() => toggleTicker(ticker)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 4,
                  border: `1px solid ${isSelected ? "var(--ink)" : "var(--ink-08)"}`,
                  background: isSelected ? "var(--ink)" : "var(--white)",
                  color: isSelected ? "var(--white)" : "var(--ink-50)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {ticker}
              </button>
            );
          })}
        </div>

        <button
          style={{
            width: "100%",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "1rem",
            letterSpacing: "0.02em",
            padding: "1rem",
            border: "none",
            borderRadius: 6,
            background: "var(--orange)",
            color: "var(--white)",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(234,76,0,0.25)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
        >
          Start free trial
        </button>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--ink-30)",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          Free for 2 weeks. Then $99/year.
        </p>
      </div>

      {/* Social proof */}
      <div
        style={{
          textAlign: "center",
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--ink-08)",
          maxWidth: 400,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "1rem",
            color: "var(--ink-50)",
            lineHeight: 1.5,
            marginBottom: "0.5rem",
          }}
        >
          &ldquo;It seems like a no-brainer.&rdquo;
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: "var(--ink-30)",
            letterSpacing: "0.02em",
          }}
        >
          Deep Agents Hackathon judge
        </p>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "0.875rem",
            color: "var(--ink-15)",
          }}
        >
          911stock
        </span>
      </div>
    </main>
  );
}
