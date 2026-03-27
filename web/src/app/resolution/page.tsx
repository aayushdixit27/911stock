"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Resolution() {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "done" | "error">("idle");

  async function handleCallMe() {
    setCalling(true);
    setCallStatus("calling");
    try {
      const res = await fetch("/api/call", { method: "POST" });
      if (!res.ok) throw new Error("Call failed");
      setCallStatus("done");
    } catch {
      setCallStatus("error");
    } finally {
      setCalling(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center gap-2">
        <span className="text-red-500 text-xl">🚨</span>
        <h1 className="text-xl font-bold">911Stock — Action Taken</h1>
      </div>

      {/* Resolution card */}
      <div className="w-full border border-green-800 rounded-lg p-5 bg-green-950/20">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-green-400 text-lg">✅</span>
          <p className="text-green-400 font-semibold">SMCI position reduced by 50%</p>
        </div>
        <div className="space-y-2 text-sm text-zinc-300">
          <div className="flex justify-between">
            <span className="text-zinc-500">Trigger</span>
            <span>CEO sold $2.1M (Mar 19)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Pattern</span>
            <span>3 similar events — avg −12%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Action</span>
            <span>Sold 500 shares @ $42.50</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Approval</span>
            <span className="text-green-400">Auth0 CIBA ✓</span>
          </div>
          <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between font-semibold">
            <span className="text-zinc-400">Est. savings</span>
            <span className="text-green-400">~$2,550</span>
          </div>
        </div>
      </div>

      {/* Overmind trace */}
      <div className="w-full border border-zinc-800 rounded-lg p-4 space-y-2">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Overmind — Agent trace</p>
        {[
          "Signal detected: HIGH significance (SMCI CEO sell)",
          "Recommendation: Alert user + suggest position reduction",
          "Trade executed: SMCI −50% (user approved via CIBA)",
        ].map((line, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>{line}</span>
          </div>
        ))}
        <p className="text-xs text-zinc-600 mt-2">3 decisions — all within policy ✓</p>
      </div>

      {/* Still watching */}
      <div className="w-full border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Still watching</p>
        <div className="flex gap-3 text-sm">
          <span className="text-zinc-400">TSLA — no signals</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-400">NVDA — no signals</span>
        </div>
      </div>

      {/* Call me button */}
      <div className="w-full flex flex-col items-center gap-3">
        <button
          onClick={handleCallMe}
          disabled={calling || callStatus === "done"}
          className="w-full border border-zinc-700 hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {callStatus === "idle" && "📞 Call 911Stock — Ask about your portfolio"}
          {callStatus === "calling" && "📞 Calling you now..."}
          {callStatus === "done" && "✓ Call initiated — pick up your phone"}
          {callStatus === "error" && "⚠ Call failed — check your phone number in .env.local"}
        </button>
        <p className="text-xs text-zinc-600 text-center">
          The agent will call your phone and answer questions about your stocks
        </p>
      </div>

      <button
        onClick={() => router.push("/")}
        className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
      >
        ← Back to watchlist
      </button>
    </main>
  );
}
