"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusStep } from "@/components/StatusStep";
import { PhoneRinging } from "@/components/PhoneRinging";
import Nav from "@/components/Nav";

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
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  async function startCIBAPolling() {
    setAwaitingApproval(true);
    setSteps((prev) =>
      prev.map((s) => (s.key === "awaiting_ciba" ? { ...s, status: "active" } : s))
    );

    try {
      await fetch("/api/initiate-ciba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: "SMCI" }),
      });
    } catch {
      // non-fatal, polling will still run
    }

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
          setAwaitingApproval(false);
          setApproved(true);
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
      const raw = e.data?.trim();
      if (!raw) return;
      let event: PipelineEvent;
      try {
        event = JSON.parse(raw) as PipelineEvent;
      } catch {
        return;
      }

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
  }, []);

  const mockUser = {
    id: "mock",
    name: "User",
    email: "user@example.com",
    image: null,
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      <Nav user={mockUser} />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "5rem 5vw 5rem" }}>
        <div className="mark-eyebrow" style={{ marginBottom: "1.5rem" }}>
          Pipeline
        </div>

        <div className="mark-card" style={{ padding: "0.5rem 0", marginBottom: "2rem" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", borderRadius: "3px 3px 0 0" }} />
          {steps.map((step, i) => (
            <div key={step.key} style={{ padding: "0 1.5rem" }}>
              <StatusStep label={step.label} status={step.status} detail={step.detail} />
              {i < steps.length - 1 && <div style={{ height: "1px", background: "var(--ink-08)" }} />}
            </div>
          ))}
        </div>

        {explanation && (
          <div style={{ margin: "0 -5vw 2rem", padding: "3rem 5vw", background: "var(--ink)", position: "relative", overflow: "hidden", borderRadius: "8px" }}>
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", top: "50%", right: "0", transform: "translate(30%, -50%)", background: "radial-gradient(circle, rgba(234,76,0,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div className="mark-eyebrow" style={{ marginBottom: "1.25rem", color: "var(--terra-lt)" }}>Agent Analysis</div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(1.375rem, 3vw, 1.75rem)", lineHeight: 1.5, color: "var(--white)", position: "relative", maxWidth: "600px" }}>
              {explanation}
            </p>
          </div>
        )}

        {callActive && <PhoneRinging />}

        {(awaitingApproval || approved) && (
          <div style={{ marginBottom: "2rem" }}>
            <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Auth0 CIBA — Trade Approval</div>
            <div className="mark-card" style={{ overflow: "hidden" }}>
              <div style={{ height: "3px", background: approved ? "linear-gradient(to right, #22c55e, #16a34a)" : "linear-gradient(to right, var(--terra), var(--terra-lt))" }} />
              <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--ink-08)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: approved ? "#22c55e" : "var(--terra)", flexShrink: 0, ...(approved ? {} : { animation: "joint-pulse 1.5s ease-in-out infinite" }) }} />
                <span style={{ fontWeight: 600, fontSize: "var(--text-base)", color: "var(--ink)" }}>{approved ? "Trade approved" : "Agent is requesting authorization"}</span>
              </div>
              <div style={{ padding: "1.25rem 1.5rem", background: "var(--paper)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {[{ label: "Action", value: "Reduce SMCI position by 50%" }, { label: "Shares", value: "Sell 500 shares @ $42.50" }, { label: "Reason", value: "CEO unscheduled sale — HIGH significance" }, { label: "Method", value: "Auth0 CIBA backchannel request" }].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.25rem 0" }}>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)", textTransform: "capitalize" }}>{row.label}</span>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--ink)" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {approved ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5 }}>Approved via Auth0 Guardian. Executing trade.</span>
                    <button onClick={() => router.push("/resolution")} style={{ marginLeft: "auto", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--white)", background: "var(--ink)", border: "none", borderRadius: "4px", padding: "0.5rem 1rem", cursor: "pointer", flexShrink: 0 }}>View result →</button>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.5, flex: 1 }}>Push sent via Auth0 Guardian — or approve here:</span>
                    <button disabled={approving} onClick={async () => { setApproving(true); try { await fetch("/api/execute-trade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticker: "SMCI", reductionPct: 50, reason: "CEO unscheduled insider sale — HIGH significance", approvedVia: "web_button" }) }); setApproved(true); setAwaitingApproval(false); if (pollRef.current) clearInterval(pollRef.current); setSteps((prev) => prev.map((s) => s.key === "awaiting_ciba" ? { ...s, status: "done", detail: "Approved via web" } : s)); } finally { setApproving(false); } }} style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--white)", background: approving ? "var(--ink-30)" : "var(--orange)", border: "none", borderRadius: "4px", padding: "0.625rem 1.25rem", cursor: approving ? "not-allowed" : "pointer", flexShrink: 0, transition: "background 0.15s" }}>{approving ? "Approving..." : "Approve"}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
