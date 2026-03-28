"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

type EnrollStatus = {
  enrollments: Array<{ id: string; status: string; type: string; name?: string; enrolled_at?: string }>;
  confirmed: boolean;
  pending: boolean;
};

export function GuardianEnroll() {
  const [status, setStatus] = useState<EnrollStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/guardian-enroll");
      const data = await res.json();
      setStatus(data);
    } catch {
      setError("Failed to check enrollment status");
    } finally {
      setLoading(false);
    }
  }

  async function generateEnrollment() {
    setGenerating(true);
    setError(null);
    setQrDataUrl(null);
    setTicketUrl(null);
    try {
      const res = await fetch("/api/guardian-enroll", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTicketUrl(data.ticketUrl);

      // Generate QR code as data URL
      const qr = await QRCode.toDataURL(data.ticketUrl, {
        width: 240,
        margin: 2,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      });
      setQrDataUrl(qr);

      // Refresh status after a short delay
      setTimeout(checkStatus, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate enrollment");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>
        Checking Guardian status...
      </p>
    );
  }

  return (
    <div>
      {/* Current status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          padding: "0.75rem 1rem",
          background: status?.confirmed ? "rgba(34,197,94,0.06)" : "rgba(234,76,0,0.06)",
          borderRadius: "6px",
          marginBottom: "1rem",
          border: `1px solid ${status?.confirmed ? "rgba(34,197,94,0.2)" : "rgba(234,76,0,0.2)"}`,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: status?.confirmed ? "#22c55e" : "var(--orange)",
            flexShrink: 0,
            ...(status?.confirmed ? {} : { animation: "joint-pulse 1.5s ease-in-out infinite" }),
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: status?.confirmed ? "#16a34a" : "var(--orange)",
          }}
        >
          {status?.confirmed
            ? "Guardian enrolled — push notifications active"
            : status?.pending
            ? "Enrollment pending — complete it below"
            : "Not enrolled — set up Guardian below"}
        </span>
      </div>

      {status?.confirmed ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6, marginBottom: "1rem" }}>
          CIBA push notifications will go to your enrolled device when a trade requires approval.
        </p>
      ) : (
        <>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6, marginBottom: "1rem" }}>
            Scan the QR code with your phone to enroll Auth0 Guardian. Download Guardian first if you haven&apos;t already.
          </p>

          {qrDataUrl ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              {/* QR Code */}
              <div
                style={{
                  background: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--ink-08)",
                  display: "inline-block",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="Guardian enrollment QR code" width={240} height={240} />
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", marginBottom: "0.5rem" }}>
                  1. Open Auth0 Guardian app
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", marginBottom: "0.5rem" }}>
                  2. Tap &quot;+&quot; to add account
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", marginBottom: "0.5rem" }}>
                  3. Scan this QR code
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-50)", marginTop: "0.75rem" }}>
                  Or open on your phone:{" "}
                  <a
                    href={ticketUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--orange)", textDecoration: "underline" }}
                  >
                    enrollment link
                  </a>
                </p>
              </div>

              <button
                onClick={checkStatus}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--ink-50)",
                  background: "var(--paper)",
                  border: "1px solid var(--ink-08)",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Refresh status
              </button>
            </div>
          ) : (
            <button
              onClick={generateEnrollment}
              disabled={generating}
              style={{
                width: "100%",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "var(--text-sm)",
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: "var(--white)",
                background: generating ? "var(--ink-30)" : "var(--ink)",
                border: "none",
                borderRadius: "4px",
                padding: "0.875rem 1rem",
                cursor: generating ? "not-allowed" : "pointer",
                marginBottom: "0.75rem",
              }}
            >
              {generating ? "Generating..." : "Generate enrollment QR code"}
            </button>
          )}
        </>
      )}

      {error && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--orange)", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
