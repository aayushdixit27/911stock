import signalsData from "@/data/signals.json";
import historicalData from "@/data/historical.json";
import watchlistData from "@/data/watchlist.json";
import type { NewsSentiment } from "./news";

export type Signal = (typeof signalsData.signals)[0];
export type HistoricalPattern = (typeof historicalData.patterns)[0];

export function detectSignal(): Signal | null {
  const userStocks = watchlistData.user.stocks;
  return (
    signalsData.signals.find((s) => userStocks.includes(s.ticker)) ?? null
  );
}

export function getHistoricalPattern(ticker: string): HistoricalPattern | null {
  return historicalData.patterns.find((p) => p.ticker === ticker) ?? null;
}

export function scoreSignal(
  signal: Signal,
  newsSentiment?: NewsSentiment | null
): number {
  let score = 0;

  // Discretionary sale (not scheduled) is the biggest signal
  if (!signal.scheduled_10b5_1) score += 3;

  // C-suite weight
  if (["CEO", "CFO", "CTO", "COO"].includes(signal.role)) score += 2;

  // Long time since last transaction
  if (signal.last_transaction_months_ago > 12) score += 2;

  // Large position reduction
  if (signal.position_reduced_pct >= 15) score += 2;
  else if (signal.position_reduced_pct >= 10) score += 1;

  // High value sale
  if (signal.total_value >= 2_000_000) score += 1;

  // News sentiment reinforces insider sell signal
  if (newsSentiment != null) {
    if (newsSentiment.overallScore < -0.4) score += 2;
    else if (newsSentiment.overallScore < -0.2) score += 1;
  }

  return score;
}

export function getWatchlist() {
  return watchlistData.user;
}
