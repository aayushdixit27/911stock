import signalsData from "@/data/signals.json";
import historicalData from "@/data/historical.json";
import type { NewsSentiment } from "./news";

// Demo signals data - used as fallback when DB is unavailable
export function getDemoSignals() {
  return signalsData.signals;
}

export function detectSignal() {
  // Return the first demo signal (SMCI) for demo mode
  return signalsData.signals[0] ?? null;
}

export function getHistoricalPattern(ticker: string) {
  return historicalData.patterns.find((p) => p.ticker === ticker) ?? null;
}

// User context for signal scoring
export type UserSignalContext = {
  positionShares: number;
  avgCost?: number;
  riskTolerance: "conservative" | "moderate" | "aggressive";
};

/**
 * Score a signal based on signal properties and user context.
 * A user with larger position gets higher urgency score than user with small position.
 */
export function scoreSignal(
  signal: {
    scheduled_10b5_1: boolean;
    role: string;
    last_transaction_months_ago: number;
    position_reduced_pct: number;
    total_value: number;
  },
  newsSentiment?: NewsSentiment | null,
  userContext?: UserSignalContext
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

  // User context adjustments
  if (userContext) {
    // Larger position = higher urgency
    if (userContext.positionShares >= 1000) score += 2;
    else if (userContext.positionShares >= 500) score += 1;
    else if (userContext.positionShares >= 100) score += 0.5;

    // Risk tolerance adjustments
    if (userContext.riskTolerance === "conservative") {
      // Conservative users get higher scores for the same signal
      score += 1;
    } else if (userContext.riskTolerance === "aggressive") {
      // Aggressive users get lower scores (they tolerate more risk)
      score -= 0.5;
    }
  }

  // Clamp score between 0 and 10
  return Math.max(0, Math.min(10, Math.round(score)));
}
