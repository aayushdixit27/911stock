"use client";

import { useEffect, useState } from "react";

export default function Settings() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guardian-enroll")
      .then((r) => r.json())
      .then((data) => {
        if (data.ticketUrl) {
          const encoded = encodeURIComponent(data.ticketUrl);
          setQrUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encoded}`
          );
        } else {
          setError(data.error ?? "Could not generate enrollment QR");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--white)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "1.25rem",
              fontStyle: "italic",
              color: "var(--orange)",
              textDecoration: "none",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            911stock
          </a>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--ink-30)",
            }}
          >
            Auth0 Guardian Setup
          </p>
        </div>

        {/* QR card */}
        <div
          className="mark-card"
          style={{ padding: "1.5rem", overflow: "hidden", textAlign: "center" }}
        >
          <div
            style={{
              height: "3px",
              background: "linear-gradient(to right, var(--orange), var(--ember))",
              margin: "-1.5rem -1.5rem 1.5rem",
            }}
          />

          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>
            Enroll Guardian
          </div>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--ink-50)",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Open the <strong style={{ color: "var(--ink)" }}>Auth0 Guardian</strong> app on your phone and scan this code to receive trade approval push notifications.
          </p>

          {loading && (
            <div
              style={{
                width: 220,
                height: 220,
                background: "var(--paper)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <span className="mark-spinner" style={{ width: 24, height: 24 }} />
            </div>
          )}

          {qrUrl && !loading && (
            <div style={{ margin: "0 auto 1.5rem", display: "inline-block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Auth0 Guardian enrollment QR code"
                width={220}
                height={220}
                style={{ borderRadius: "8px", display: "block" }}
              />
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                background: "rgba(234,76,0,0.06)",
                border: "1px solid rgba(234,76,0,0.2)",
                borderRadius: "6px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--orange)",
                  lineHeight: 1.5,
                }}
              >
                {error.includes("Forbidden") || error.includes("403")
                  ? "Management API not authorized. Go to Auth0 Dashboard → Applications → APIs → Auth0 Management API → grant create:guardian_enrollment_tickets to this app."
                  : error}
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
              color: "var(--ink-30)",
              textAlign: "left",
            }}
          >
            {["Download Auth0 Guardian from the App Store or Google Play", "Tap + in the app, then scan this code", "Once enrolled, trade approvals will push to your phone"].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "0.625rem" }}>
                <span style={{ color: "var(--orange)", fontWeight: 600, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", textDecoration: "none" }}>
            ← Back to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
