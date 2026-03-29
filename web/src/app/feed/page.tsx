"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

interface Alert {
  date: string;
  ticker: string;
  headline: string;
  detail: string;
  severity: "HIGH" | "LOW" | "INFO";
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function Feed() {
  const [user, setUser] = useState<User | null>(null);

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
  }, []);

  const alerts: Alert[] = [
    {
      date: "Mar 19, 2026",
      ticker: "SMCI",
      headline: "CEO Charles Liang sold $2.1M in stock",
      detail: "First sale in 14 months, outside scheduled plan. Historical pattern: avg −12% over 30 days.",
      severity: "HIGH",
    },
    {
      date: "Feb 28, 2026",
      ticker: "NVDA",
      headline: "CFO filed Form 4 — routine scheduled sale",
      detail: "Part of 10b5-1 plan. No anomaly detected. Monitoring continues.",
      severity: "LOW",
    },
    {
      date: "Jan 14, 2026",
      ticker: "TSLA",
      headline: "Board member purchased 50,000 shares",
      detail: "Insider buying is generally a positive signal. No action recommended.",
      severity: "INFO",
    },
  ];

  const colors: Record<string, React.CSSProperties> = {
    HIGH: { color: "#f87171", borderColor: "#7f1d1d", backgroundColor: "rgba(127, 29, 29, 0.2)" },
    LOW: { color: "#9ca3af", borderColor: "#1f2937", backgroundColor: "rgba(31, 41, 55, 0.2)" },
    INFO: { color: "#4ade80", borderColor: "#14532d", backgroundColor: "rgba(20, 83, 32, 0.2)" },
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {user && <Nav user={user} />}

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "5rem 5vw 5rem" }}>
        <div className="mark-eyebrow" style={{ marginBottom: "1.5rem" }}>
          Alert Feed
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {alerts.map((alert, i) => (
            <div
              key={i}
              style={{
                padding: "1.25rem 1.5rem",
                background: colors[alert.severity].backgroundColor,
                border: `1px solid ${colors[alert.severity].borderColor}`,
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 500, color: colors[alert.severity].color }}>
                  {alert.ticker}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>
                  {alert.date}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: 500, marginBottom: "0.25rem", color: "var(--ink)" }}>
                {alert.headline}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>
                {alert.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
