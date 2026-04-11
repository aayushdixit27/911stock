// Signal scoring engine — standalone copy for bot

import type { Signal } from "./edgar.js";

export function scoreSignal(signal: Signal): number {
  let score = 0;

  if (!signal.scheduled_10b5_1) score += 3;
  if (["CEO", "CFO", "CTO", "COO"].includes(signal.role)) score += 2;
  if (signal.last_transaction_months_ago > 12) score += 2;
  if (signal.position_reduced_pct >= 15) score += 2;
  else if (signal.position_reduced_pct >= 10) score += 1;
  if (signal.total_value >= 2_000_000) score += 1;

  return Math.max(0, Math.min(10, Math.round(score)));
}

// Historical patterns — inline for now
const PATTERNS: Record<string, { avg_30d_drop_pct: number; occurrences: { date: string; insider: string; subsequent_30d_drop_pct: number }[]; confidence: string }> = {
  SMCI: {
    avg_30d_drop_pct: 12.0,
    confidence: "high",
    occurrences: [
      { date: "2025-08-12", insider: "CFO", subsequent_30d_drop_pct: 15.2 },
      { date: "2024-11-03", insider: "CEO", subsequent_30d_drop_pct: 9.1 },
      { date: "2024-03-22", insider: "VP Sales", subsequent_30d_drop_pct: 11.8 },
    ],
  },
  NVDA: {
    avg_30d_drop_pct: 8.7,
    confidence: "medium",
    occurrences: [
      { date: "2025-06-15", insider: "CFO", subsequent_30d_drop_pct: 8.7 },
    ],
  },
};

export function getHistoricalPattern(ticker: string) {
  return PATTERNS[ticker.toUpperCase()] ?? null;
}
