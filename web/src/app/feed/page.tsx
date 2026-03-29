"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import type { DBSignal } from "@/lib/db";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

type SignalSeverity = "HIGH" | "MEDIUM" | "LOW" | "INFO";

function getSeverityFromScore(score: number): SignalSeverity {
  if (score >= 7) return "HIGH";
  if (score >= 5) return "MEDIUM";
  if (score >= 3) return "LOW";
  return "INFO";
}

const colors: Record<SignalSeverity, React.CSSProperties> = {
  HIGH: { color: "#f87171", borderColor: "#7f1d1d", backgroundColor: "rgba(127, 29, 29, 0.2)" },
  MEDIUM: { color: "#fb923c", borderColor: "#7c2d12", backgroundColor: "rgba(124, 45, 18, 0.2)" },
  LOW: { color: "#9ca3af", borderColor: "#1f2937", backgroundColor: "rgba(31, 41, 55, 0.2)" },
  INFO: { color: "#4ade80", borderColor: "#14532d", backgroundColor: "rgba(20, 83, 32, 0.2)" },
};

export default function Feed() {
  const [user, setUser] = useState<User | null>(null);
  const [signals, setSignals] = useState<DBSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<DBSignal | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: false,
  });

  useEffect(() => {
    // Fetch the current user session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Ignore errors
      });

    // Fetch signals from API
    fetchSignals(1);
  }, []);

  async function fetchSignals(page: number, append = false) {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      
      const res = await fetch(`/api/feed?page=${page}&limit=${pagination.limit}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please log in to view your signals");
          return;
        }
        throw new Error(`Failed to fetch signals: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.empty && page === 1) {
        setSignals([]);
        setEmptyMessage(data.message ?? "No signals yet. Add tickers to your watchlist to get started.");
      } else {
        if (append) {
          setSignals((prev) => [...prev, ...(data.signals ?? [])]);
        } else {
          setSignals(data.signals ?? []);
        }
        setPagination({
          page,
          limit: pagination.limit,
          hasMore: data.pagination?.hasMore ?? false,
        });
        setEmptyMessage(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load signals");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function handleLoadMore() {
    if (loadingMore || !pagination.hasMore) return;
    await fetchSignals(pagination.page + 1, true);
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatCurrency(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  // Detail view modal
  if (selectedSignal) {
    const severity = getSeverityFromScore(selectedSignal.score);
    const style = colors[severity];
    
    return (
      <main style={{ minHeight: "100vh", background: "var(--white)" }}>
        {user && <Nav user={user} />}

        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "5rem 5vw 5rem" }}>
          <button
            onClick={() => setSelectedSignal(null)}
            style={{
              marginBottom: "1.5rem",
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "1px solid var(--ink-30)",
              borderRadius: "6px",
              color: "var(--ink)",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            ← Back to Feed
          </button>

          <div
            style={{
              padding: "2rem",
              background: style.backgroundColor,
              border: `2px solid ${style.borderColor}`,
              borderRadius: "12px",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600, color: style.color }}>
                {selectedSignal.ticker}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  padding: "0.25rem 0.75rem",
                  background: style.borderColor,
                  color: style.color,
                  borderRadius: "9999px",
                }}
              >
                Score: {selectedSignal.score}/10
              </span>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--ink)" }}>
                {selectedSignal.insider} ({selectedSignal.role})
              </h2>
              <p style={{ fontSize: "1rem", color: "var(--ink-70)" }}>
                {selectedSignal.action === "SELL" ? "Sold" : "Bought"} {selectedSignal.shares.toLocaleString()} shares
                worth {formatCurrency(Number(selectedSignal.total_value))}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-50)", marginBottom: "0.25rem" }}>Date</p>
                <p style={{ fontSize: "0.875rem", color: "var(--ink)" }}>{formatDate(selectedSignal.date)}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-50)", marginBottom: "0.25rem" }}>Price per Share</p>
                <p style={{ fontSize: "0.875rem", color: "var(--ink)" }}>${Number(selectedSignal.price_per_share).toFixed(2)}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-50)", marginBottom: "0.25rem" }}>Position Reduced</p>
                <p style={{ fontSize: "0.875rem", color: "var(--ink)" }}>{selectedSignal.position_reduced_pct}%</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-50)", marginBottom: "0.25rem" }}>Last Transaction</p>
                <p style={{ fontSize: "0.875rem", color: "var(--ink)" }}>{selectedSignal.last_transaction_months_ago} months ago</p>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--ink-50)", marginBottom: "0.25rem" }}>Scheduled 10b5-1 Plan</p>
              <p style={{ fontSize: "0.875rem", color: "var(--ink)" }}>
                {selectedSignal.scheduled_10b5_1 ? "Yes — routine planned sale" : "No — discretionary sale"}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              background: "var(--paper)",
              border: "1px solid var(--ink-20)",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--ink)" }}>
              AI Explanation
            </h3>
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink-80)" }}>
              {selectedSignal.explanation ?? "No explanation available."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Main feed view
  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {user && <Nav user={user} />}

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "5rem 5vw 5rem" }}>
        <div className="mark-eyebrow" style={{ marginBottom: "1.5rem" }}>
          Alert Feed
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--ink-50)" }}>
            Loading signals...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(127, 29, 29, 0.1)",
              border: "1px solid #7f1d1d",
              borderRadius: "8px",
              color: "#f87171",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && signals.length === 0 && (
          <div
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              background: "var(--paper)",
              border: "1px dashed var(--ink-30)",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📡</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--ink)" }}>
              No Signals Yet
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--ink-60)", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
              {emptyMessage ?? "Add tickers to your watchlist and run the detection pipeline to see insider trading signals here."}
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                background: "var(--orange)",
                color: "white",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Go to Home to Add Tickers
            </Link>
          </div>
        )}

        {!loading && !error && signals.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {signals.map((signal) => {
              const severity = getSeverityFromScore(signal.score);
              const style = colors[severity];
              return (
                <div
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal)}
                  style={{
                    padding: "1.25rem 1.5rem",
                    background: style.backgroundColor,
                    border: `1px solid ${style.borderColor}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 500, color: style.color }}>
                      {signal.ticker}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-xs)",
                          padding: "0.125rem 0.5rem",
                          background: style.borderColor,
                          color: style.color,
                          borderRadius: "4px",
                        }}
                      >
                        Score: {signal.score}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>
                        {formatDate(signal.date)}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: 500, marginBottom: "0.25rem", color: "var(--ink)" }}>
                    {signal.insider} ({signal.role}) {signal.action === "SELL" ? "sold" : "bought"} {formatCurrency(Number(signal.total_value))}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5 }}>
                    {signal.explanation?.slice(0, 120)}...
                    <span style={{ color: "var(--orange)", marginLeft: "0.25rem" }}>Click for details →</span>
                  </p>
                </div>
              );
            })}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: "0.75rem 2rem",
                    background: loadingMore ? "var(--ink-30)" : "var(--orange)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    transition: "background 0.15s, transform 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.background = "#d94300";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = loadingMore ? "var(--ink-30)" : "var(--orange)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}

            {!pagination.hasMore && signals.length >= pagination.limit && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "var(--ink-40)",
                  marginTop: "1.5rem",
                  paddingBottom: "1rem",
                }}
              >
                You&apos;ve reached the end
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
