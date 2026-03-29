"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AccuracyStats {
  totalSignals: number;
  tracked7d: number;
  tracked30d: number;
  correct7d: number;
  correct30d: number;
  accuracy7d: number;
  accuracy30d: number;
  perTicker: Array<{
    ticker: string;
    total: number;
    accuracy7d: number;
    accuracy30d: number;
  }>;
}

export default function AccuracyPage() {
  const [stats, setStats] = useState<AccuracyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccuracyStats();
  }, []);

  async function fetchAccuracyStats() {
    try {
      const res = await fetch("/api/accuracy");
      if (!res.ok) throw new Error("Failed to fetch accuracy stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || "Failed to fetch stats");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--white)" }}>
        <div style={{ padding: "2rem 5vw", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "var(--ink-50)" }}>Loading accuracy stats...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--white)" }}>
        <div style={{ padding: "2rem 5vw", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "var(--terra)" }}>Error: {error}</p>
            <button
              onClick={fetchAccuracyStats}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                background: "var(--orange)",
                color: "var(--white)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--white)" }}>
        <div style={{ padding: "2rem 5vw", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p style={{ color: "var(--ink-50)" }}>No accuracy data available yet.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Header */}
      <header
        style={{
          padding: "1.5rem 5vw",
          background: "var(--paper)",
          borderBottom: "1px solid var(--ink-08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontStyle: "italic",
            color: "var(--orange)",
            textDecoration: "none",
          }}
        >
          911stock
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              color: "var(--ink-70)",
              textDecoration: "none",
              fontSize: "var(--text-sm)",
            }}
          >
            Home
          </Link>
          <Link
            href="/auth/login"
            style={{
              background: "var(--orange)",
              color: "var(--white)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "4rem 5vw",
          background: "linear-gradient(135deg, var(--ink) 0%, var(--ink-90) 100%)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontStyle: "italic",
            color: "var(--white)",
            marginBottom: "1rem",
          }}
        >
          Our AI Accuracy
        </h1>
        <p
          style={{
            fontSize: "var(--text-lg)",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "600px",
            margin: "0 auto 2rem",
          }}
        >
          We track every prediction to continuously improve our models.
          Here&apos;s how our AI has performed.
        </p>

        {/* Overall Accuracy Card */}
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            background: "var(--white)",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--ink-50)",
                marginBottom: "0.5rem",
              }}
            >
              Total Signals Tracked
            </div>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              {stats.totalSignals.toLocaleString()}
            </div>
          </div>

          <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
            <div>
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--ink-50)",
                  marginBottom: "0.25rem",
                }}
              >
                7-Day Accuracy
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: stats.accuracy7d >= 60 ? "#22c55e" : stats.accuracy7d >= 40 ? "var(--orange)" : "var(--terra)",
                }}
              >
                {stats.accuracy7d}%
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-40)" }}>
                {stats.tracked7d} checked
              </div>
            </div>

            <div style={{ borderLeft: "1px solid var(--ink-08)", paddingLeft: "2rem" }}>
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--ink-50)",
                  marginBottom: "0.25rem",
                }}
              >
                30-Day Accuracy
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: stats.accuracy30d >= 60 ? "#22c55e" : stats.accuracy30d >= 40 ? "var(--orange)" : "var(--terra)",
                }}
              >
                {stats.accuracy30d}%
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-40)" }}>
                {stats.tracked30d} checked
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Per-Ticker Breakdown */}
      {stats.perTicker.length > 0 && (
        <section style={{ padding: "4rem 5vw", maxWidth: "1000px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontStyle: "italic",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Accuracy by Ticker
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {stats.perTicker.map((ticker) => (
              <div
                key={ticker.ticker}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--ink-08)",
                  borderRadius: "8px",
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "1.25rem",
                      color: "var(--ink)",
                    }}
                  >
                    {ticker.ticker}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--ink-50)",
                    }}
                  >
                    {ticker.total} signals
                  </span>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--ink-40)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      7-Day
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color:
                          ticker.accuracy7d >= 60
                            ? "#22c55e"
                            : ticker.accuracy7d >= 40
                            ? "var(--orange)"
                            : "var(--terra)",
                      }}
                    >
                      {ticker.accuracy7d}%
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--ink-40)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      30-Day
                    </div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color:
                          ticker.accuracy30d >= 60
                            ? "#22c55e"
                            : ticker.accuracy30d >= 40
                            ? "var(--orange)"
                            : "var(--terra)",
                      }}
                    >
                      {ticker.accuracy30d}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section
        style={{
          padding: "4rem 5vw",
          background: "var(--paper)",
          borderTop: "1px solid var(--ink-08)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontStyle: "italic",
              marginBottom: "1.5rem",
            }}
          >
            How We Measure Accuracy
          </h2>
          <p
            style={{
              fontSize: "var(--text-base)",
              color: "var(--ink-70)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            When our AI detects an insider trading signal, it predicts the likely direction
            of the stock price based on the signal characteristics. We then track the actual
            price movement over 7 and 30 days to determine if the prediction was correct.
            This data helps us continuously improve our models.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 200,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--orange)",
                  color: "var(--white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  fontWeight: 600,
                }}
              >
                1
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}>
                AI detects insider signal
              </p>
            </div>

            <div
              style={{
                width: 200,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--terra)",
                  color: "var(--white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  fontWeight: 600,
                }}
              >
                2
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}>
                Price direction predicted
              </p>
            </div>

            <div
              style={{
                width: 200,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--ink)",
                  color: "var(--white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  fontWeight: 600,
                }}
              >
                3
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}>
                Actual results tracked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "4rem 5vw",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontStyle: "italic",
            marginBottom: "1rem",
          }}
        >
          Ready to get these insights?
        </h2>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: "var(--ink-70)",
            marginBottom: "2rem",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Join thousands of investors using AI-powered insider trading alerts.
        </p>
        <Link
          href="/auth/register"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "var(--text-base)",
            color: "var(--white)",
            background: "var(--orange)",
            padding: "1rem 2rem",
            borderRadius: "6px",
            textDecoration: "none",
            transition: "transform 0.15s",
          }}
        >
          Start for free
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 5vw",
          background: "var(--ink)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          911stock
        </span>
        <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.2)" }}>
          Built for the Deep Agents Hackathon 2026
        </p>
      </footer>
    </main>
  );
}
