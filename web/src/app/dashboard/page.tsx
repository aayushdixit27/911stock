"use client";

import { useEffect, useState } from "react";
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
  { key: "calling", label: "Calling your phone", status: "pending" },
];

export default function Dashboard() {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [showApproval, setShowApproval] = useState(false);

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
          // Activate next pending step
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
        // Show approval after 8s (simulates call completing)
        setTimeout(() => {
          setCallActive(false);
          setShowApproval(true);
          setSteps((prev) =>
            prev.map((s) => (s.key === "calling" ? { ...s, status: "done", detail: "Connected" } : s))
          );
        }, 8000);
      }
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, []);

  function handleApprove() {
    router.push("/resolution");
  }

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
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
            Agent analysis
          </p>
          <p className="text-sm text-zinc-100 leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Phone ringing */}
      {callActive && <PhoneRinging />}

      {/* Auth0 approval */}
      {showApproval && (
        <div className="w-full border border-yellow-700 rounded-lg p-4 bg-yellow-950/30">
          <p className="text-xs text-yellow-500 uppercase tracking-widest mb-2">
            Auth0 CIBA — Trade approval required
          </p>
          <p className="text-sm text-zinc-300 mb-4">
            Agent is requesting to reduce your SMCI position by 50%.
            Your approval is required before any action is taken.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              ✓ Approve via Auth0
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 border border-zinc-700 text-zinc-400 text-sm py-2 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Deny
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
