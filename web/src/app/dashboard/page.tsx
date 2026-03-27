"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusStep } from "@/components/StatusStep";
import { PhoneRinging } from "@/components/PhoneRinging";

type Step = {
  key: string;
  label: string;
  status: "pending" | "active" | "done";
  detail?: string;
};

type PipelineEvent = {
  step: string;
  status: string;
  data?: Record<string, unknown>;
  text?: string;
};

const INITIAL_STEPS: Step[] = [
  { key: "scanning", label: "Scanning SEC filings...", status: "active" },
  { key: "signal_detected", label: "Signal detected", status: "pending" },
  { key: "cross_referencing", label: "Cross-referencing historical patterns...", status: "pending" },
  { key: "scoring", label: "Scoring significance", status: "pending" },
  { key: "explanation_ready", label: "Generating plain-English explanation...", status: "pending" },
  { key: "calling", label: "Calling your phone...", status: "pending" },
  { key: "awaiting_ciba", label: "Awaiting Auth0 Guardian approval", status: "pending" },
];

export default function Dashboard() {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  function startCIBAPolling() {
    setAwaitingApproval(true);
    setSteps((prev) =>
      prev.map((s) => (s.key === "awaiting_ciba" ? { ...s, status: "active" } : s))
    );

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/ciba-status");
        const data = await res.json();

        if (data.status === "approved") {
          clearInterval(pollRef.current!);
          setSteps((prev) =>
            prev.map((s) =>
              s.key === "awaiting_ciba"
                ? { ...s, status: "done", detail: "Approved via Auth0 Guardian" }
                : s
            )
          );
          setTimeout(() => router.push("/resolution"), 1200);
        } else if (data.status === "denied") {
          clearInterval(pollRef.current!);
          setAwaitingApproval(false);
          setSteps((prev) =>
            prev.map((s) =>
              s.key === "awaiting_ciba"
                ? { ...s, status: "done", detail: "Denied by user" }
                : s
            )
          );
        }
      } catch {
        // ignore poll errors, keep trying
      }
    }, 3000);
  }

  useEffect(() => {
    const es = new EventSource("/api/signal");

    es.onmessage = (e) => {
      const event: PipelineEvent = JSON.parse(e.data);

      setSteps((prev) =>
        prev.map((s) => {
          if (s.key === event.step) {
            let detail = s.detail;
            if (event.step === "signal_detected" && event.data) {
              const d = event.data as { ticker: string; insider: string; role: string; total_value: number };
              detail = `${d.ticker}: ${d.role} ${d.insider} sold $${((d.total_value ?? 0) / 1_000_000).toFixed(1)}M`;
            }
            if (event.step === "scoring" && event.data) {
              const d = event.data as { significance: string };
              detail = `Significance: ${d.significance}`;
            }
            return { ...s, status: "done", detail };
          }
          if (event.step === "calling" && s.key === "calling") {
            return { ...s, status: "active" };
          }
          return s;
        })
      );

      if (event.step === "explanation_ready" && event.text) {
        setExplanation(event.text);
      }

      if (event.step === "calling") {
        setCallActive(true);
        setSteps((prev) =>
          prev.map((s) => (s.key === "calling" ? { ...s, status: "active" } : s))
        );

        setTimeout(() => {
          setCallActive(false);
          setSteps((prev) =>
            prev.map((s) =>
              s.key === "calling" ? { ...s, status: "done", detail: "Connected — awaiting response" } : s
            )
          );
          startCIBAPolling();
        }, 10000);
      }
    };

    es.onerror = () => es.close();
    return () => {
      es.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            letterSpacing: "0.25em",
            textTransform: "uppercase" as const,
            color: "var(--orange)",
          }}
        >
          911stock
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--orange)",
              animation: "joint-pulse 1.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.25em",
              textTransform: "lowercase" as const,
              color: "var(--orange)",
            }}
          >
            agent active
          </span>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "90px 7vw 80px" }}>
        <div className="mark-eyebrow" style={{ marginBottom: 40 }}>
          pipeline
        </div>

        {/* Pipeline steps */}
        <div
          className="mark-card"
          style={{ padding: "8px 28px", marginBottom: 40 }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(to right, var(--orange), var(--ember))",
            }}
          />
          {steps.map((step, i) => (
            <div key={step.key}>
              <StatusStep label={step.label} status={step.status} detail={step.detail} />
              {i < steps.length - 1 && (
                <div style={{ height: 1, background: "var(--ink-10)" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── AGENT ANALYSIS — ink takeover ── */}
        {explanation && (
          <div
            style={{
              margin: "0 -7vw 40px",
              padding: "56px 7vw",
              background: "var(--ink)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 400,
                height: 400,
                borderRadius: "50%",
                top: "40%",
                right: "-5%",
                transform: "translate(0, -50%)",
                background: "radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 65%)",
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
              agent analysis
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(22px, 3.5vw, 34px)",
                lineHeight: 1.4,
                letterSpacing: "-0.02em",
                color: "var(--white)",
                position: "relative",
                maxWidth: 540,
              }}
            >
              {explanation}
            </p>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 24,
                alignItems: "center",
                position: "relative",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)" }}>
                ghost db: 3 pattern matches
              </span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--terra)", display: "inline-block" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)" }}>
                significance: high
              </span>
            </div>
          </div>
        )}

        {/* Phone ringing */}
        {callActive && <PhoneRinging />}

        {/* Auth0 Guardian — waiting for approval */}
        {awaitingApproval && (
          <div style={{ marginBottom: 40 }}>
            <div className="mark-eyebrow" style={{ marginBottom: 24 }}>
              auth0 guardian — awaiting approval
            </div>
            <div className="mark-card" style={{ padding: "28px 28px" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "linear-gradient(to right, var(--terra), var(--terra-lt))",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--terra)",
                    animation: "joint-pulse 1.5s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: 15,
                    color: "var(--ink)",
                  }}
                >
                  Waiting for your approval
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: 14,
                  color: "var(--ink-60)",
                  lineHeight: 1.8,
                  paddingLeft: 20,
                }}
              >
                Auth0 Guardian sent a push notification to your phone.
                Open the Guardian app and tap Approve.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
