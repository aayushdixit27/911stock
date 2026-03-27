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

  // Poll for CIBA approval once phone call step is active
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
                ? { ...s, status: "done", detail: "Approved via Auth0 Guardian ✓" }
                : s
            )
          );
          // Short delay for visual confirmation before redirect
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

        // After 10s, assume call connected — start polling for CIBA approval
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
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center gap-2">
        <span className="text-red-500 text-xl">🚨</span>
        <h1 className="text-xl font-bold">911Stock — Agent Active</h1>
        <div className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      </div>

      {/* Pipeline steps */}
      <div className="w-full border border-zinc-800 rounded-lg divide-y divide-zinc-800">
        {steps.map((step) => (
          <div key={step.key} className="px-4">
            <StatusStep label={step.label} status={step.status} detail={step.detail} />
          </div>
        ))}
      </div>

      {/* Explanation card */}
      {explanation && (
        <div className="w-full border border-zinc-700 rounded-lg p-4 bg-zinc-900">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Agent analysis</p>
          <p className="text-sm text-zinc-100 leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Phone ringing */}
      {callActive && <PhoneRinging />}

      {/* Waiting for Guardian approval */}
      {awaitingApproval && (
        <div className="w-full border border-yellow-700 rounded-lg p-4 bg-yellow-950/20 flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mt-1.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 text-sm font-medium">
              Waiting for your approval
            </p>
            <p className="text-zinc-400 text-xs mt-1">
              Auth0 Guardian sent a push notification to your phone.
              Open the Guardian app and tap <strong>Approve</strong>.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
