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

type Signal = {
  id: string;
  ticker: string;
  companyName: string;
  insider: string;
  role: string;
  action: string;
  shares: number;
  pricePerShare: number;
  totalValue: number;
  score: number;
  explanation: string | null;
  positionReducedPct: number;
  scheduled10b51: boolean;
  lastTransactionMonthsAgo: number;
};

type Position = {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
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
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<{ tradeId: string } | null>(null);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [alpacaConnected, setAlpacaConnected] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user tier and Alpaca connection status
  useEffect(() => {
    async function fetchUserStatus() {
      try {
        // Fetch user settings to check tier
        const settingsRes = await fetch("/api/user/settings");
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setIsPremium(settings.tier === "premium");
        }

        // Fetch Alpaca connection status
        const alpacaRes = await fetch("/api/alpaca/status");
        if (alpacaRes.ok) {
          const alpaca = await alpacaRes.json();
          setAlpacaConnected(alpaca.connected);
        }
      } catch {
        // Non-fatal, use defaults
      }
    }
    fetchUserStatus();
  }, []);

  // Fetch portfolio position for current signal ticker
  useEffect(() => {
    async function fetchPosition() {
      if (!currentSignal) return;
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          const position = data.positions.find((p: Position) => p.ticker === currentSignal.ticker);
          if (position) {
            setUserPosition(position);
          }
        }
      } catch {
        // Non-fatal
      }
    }
    fetchPosition();
  }, [currentSignal]);

  async function startCIBAPolling() {
    setAwaitingApproval(true);
    setSteps((prev) =>
      prev.map((s) => (s.key === "awaiting_ciba" ? { ...s, status: "active" } : s))
    );

    try {
      await fetch("/api/initiate-ciba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: currentSignal?.ticker || "SMCI" }),
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

  async function handleApproveTrade(reductionPct: number = 50) {
    if (!currentSignal) {
      setTradeError("No signal available to trade");
      return;
    }

    setApproving(true);
    setTradeError(null);

    try {
      const res = await fetch("/api/execute-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalId: currentSignal.id,
          ticker: currentSignal.ticker,
          reductionPct,
          pricePerShare: currentSignal.pricePerShare,
          approvalMethod: "web_button",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTradeError(data.message || data.error || "Trade failed");
        return;
      }

      setTradeSuccess({ tradeId: data.trade.id });
      setApproved(true);
      setAwaitingApproval(false);
      setSteps((prev) =>
        prev.map((s) =>
          s.key === "awaiting_ciba"
            ? { ...s, status: "done", detail: "Approved via web" }
            : s
        )
      );
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setApproving(false);
    }
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

              // Store signal info when detected
              setCurrentSignal({
                id: (event.data as { id?: string }).id || `sig-${Date.now()}`,
                ticker: d.ticker,
                companyName: (event.data as { companyName?: string }).companyName || d.ticker,
                insider: d.insider,
                role: d.role,
                action: "SELL",
                shares: (event.data as { shares?: number }).shares || 0,
                pricePerShare: (event.data as { pricePerShare?: number }).pricePerShare || 0,
                totalValue: d.total_value,
                score: (event.data as { score?: number }).score || 0,
                explanation: null,
                positionReducedPct: (event.data as { positionReducedPct?: number }).positionReducedPct || 0,
                scheduled10b51: (event.data as { scheduled10b51?: boolean }).scheduled10b51 || false,
                lastTransactionMonthsAgo: (event.data as { lastTransactionMonthsAgo?: number }).lastTransactionMonthsAgo || 0,
              });
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
        // Update signal with explanation
        setCurrentSignal((prev) => prev ? { ...prev, explanation: event.text || null } : null);
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

  // Show trade recommendation for high-score signals
  const showRecommendation = currentSignal && currentSignal.score >= 7;
  const recommendationShares = userPosition
    ? Math.floor(userPosition.shares * 0.5)
    : 500;
  const recommendationValue = recommendationShares * (currentSignal?.pricePerShare || 42.5);

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

        {/* Trade Recommendation Card */}
        {showRecommendation && (
          <div style={{ marginBottom: "2rem" }}>
            <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Trade Recommendation</div>
            <div className="mark-card" style={{ overflow: "hidden" }}>
              <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))" }} />
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--ink-08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500, color: "var(--ink)" }}>{currentSignal.ticker}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)", marginLeft: "0.5rem" }}>Score: {currentSignal.score}/10</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", animation: "joint-pulse 1.5s ease-in-out infinite" }} />
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--orange)", fontWeight: 500 }}>High Significance</span>
                  </div>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)", lineHeight: 1.5 }}>
                  {currentSignal.explanation || `Detected ${currentSignal.role} ${currentSignal.insider} insider sale. Based on historical patterns, this type of unscheduled sale precedes an average 12% decline over 30 days.`}
                </p>
              </div>

              <div style={{ padding: "1.25rem 1.5rem", background: "var(--paper)", borderBottom: "1px solid var(--ink-08)" }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>Recommended Action</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.25rem 0" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>Action</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--orange)" }}>Reduce {currentSignal.ticker} by 50%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.25rem 0" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>Shares</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--ink)" }}>Sell {recommendationShares.toLocaleString()} @ ${currentSignal.pricePerShare.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.25rem 0" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>Current Position</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--ink)" }}>{userPosition ? `${userPosition.shares} shares @ $${userPosition.avgCost.toFixed(2)} avg` : "Fetching from Alpaca..."}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.25rem 0" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>Est. Proceeds</span>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--ink)" }}>${recommendationValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Approval Section */}
              <div style={{ padding: "1rem 1.5rem" }}>
                {tradeSuccess ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", flex: 1 }}>Trade approved and executed.</span>
                    <button onClick={() => router.push("/resolution")} style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--white)", background: "var(--ink)", border: "none", borderRadius: "4px", padding: "0.5rem 1rem", cursor: "pointer" }}>View result →</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", flex: 1 }}>
                      {!isPremium ? "Premium feature — upgrade to execute trades" :
                       !alpacaConnected ? "Connect Alpaca to execute trades" :
                       "Approve this trade to execute on Alpaca"}
                    </span>
                    {isPremium && alpacaConnected ? (
                      <button
                        disabled={approving}
                        onClick={() => handleApproveTrade(50)}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 700,
                          fontSize: "var(--text-xs)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase" as const,
                          color: "var(--white)",
                          background: approving ? "var(--ink-30)" : "var(--orange)",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.625rem 1.25rem",
                          cursor: approving ? "not-allowed" : "pointer",
                          flexShrink: 0,
                          transition: "background 0.15s",
                        }}
                      >
                        {approving ? "Approving..." : "Approve Trade"}
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(isPremium ? "/settings" : "/settings")}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          fontSize: "var(--text-xs)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase" as const,
                          color: "var(--white)",
                          background: "var(--ink-30)",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.625rem 1.25rem",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {!isPremium ? "Upgrade" : "Connect Alpaca"}
                      </button>
                    )}
                  </div>
                )}

                {tradeError && (
                  <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(239,68,68,0.08)", borderRadius: "4px" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "#ef4444" }}>{tradeError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(awaitingApproval || approved) && !showRecommendation && (
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
                    <button disabled={approving} onClick={async () => { setApproving(true); try { await fetch("/api/execute-trade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signalId: currentSignal?.id || `sig-${Date.now()}`, ticker: currentSignal?.ticker || "SMCI", reductionPct: 50, pricePerShare: currentSignal?.pricePerShare || 42.50, approvalMethod: "web_button" }) }); setApproved(true); setAwaitingApproval(false); if (pollRef.current) clearInterval(pollRef.current); setSteps((prev) => prev.map((s) => s.key === "awaiting_ciba" ? { ...s, status: "done", detail: "Approved via web" } : s)); } finally { setApproving(false); } }} style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--white)", background: approving ? "var(--ink-30)" : "var(--orange)", border: "none", borderRadius: "4px", padding: "0.625rem 1.25rem", cursor: approving ? "not-allowed" : "pointer", flexShrink: 0, transition: "background 0.15s" }}>{approving ? "Approving..." : "Approve"}</button>
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
