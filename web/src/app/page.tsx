"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WatchlistCard } from "@/components/WatchlistCard";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTrigger() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Agent pipeline failed");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-12">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-red-500 text-3xl">🚨</span>
          <h1 className="text-4xl font-bold tracking-tight">911Stock</h1>
        </div>
        <p className="text-zinc-400 text-lg">Your portfolio, watched.</p>
      </div>

      {/* Watchlist */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs text-zinc-600 uppercase tracking-widest">Monitoring</p>
        <div className="flex gap-4">
          {["SMCI", "TSLA", "NVDA"].map((ticker) => (
            <WatchlistCard key={ticker} ticker={ticker} />
          ))}
        </div>
      </div>

      {/* Trigger Button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleTrigger}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg px-10 py-4 rounded-full transition-all active:scale-95 shadow-lg shadow-red-900/40"
        >
          {loading ? "Agent activating..." : "🔴 TRIGGER AGENT — Scan for signals"}
        </button>
        {error && (
          <p className="text-red-400 text-sm text-center max-w-sm">{error}</p>
        )}
        <p className="text-zinc-600 text-xs">
          Alert level: Major events only
        </p>
      </div>

      {/* Footer */}
      <p className="text-zinc-700 text-xs text-center max-w-xs">
        911Stock monitors SEC filings, insider transactions, and market signals 24/7.
        It calls you when something matters.
      </p>
    </main>
  );
}
