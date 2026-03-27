import { NextResponse } from "next/server";
import { getRecentSignals, type DBSignal } from "@/lib/db";

const SEED: DBSignal[] = [
  {
    id: "smci-ceo-sell-20260319",
    ticker: "SMCI",
    company_name: "Super Micro Computer",
    insider: "Charles Liang",
    role: "CEO",
    action: "SELL",
    shares: 50000,
    price_per_share: 42.5,
    total_value: 2125000,
    date: "2026-03-19",
    filed_at: "2026-03-19T16:30:00Z",
    scheduled_10b5_1: false,
    last_transaction_months_ago: 14,
    position_reduced_pct: 18,
    score: 10,
    explanation:
      "SMCI's CEO just sold $2.1M — first sale in 14 months, outside his scheduled plan.",
    alerted: false,
  },
  {
    id: "nvda-cfo-sell-20260321",
    ticker: "NVDA",
    company_name: "NVIDIA Corporation",
    insider: "Colette Kress",
    role: "CFO",
    action: "SELL",
    shares: 6250,
    price_per_share: 142.5,
    total_value: 890625,
    date: "2026-03-21",
    filed_at: "2026-03-21T09:15:00Z",
    scheduled_10b5_1: true,
    last_transaction_months_ago: 3,
    position_reduced_pct: 2,
    score: 3,
    explanation: "Routine scheduled sale — part of her 10b5-1 plan.",
    alerted: false,
  },
];

export async function GET() {
  // Try DB first
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const signals = await getRecentSignals(20);
      if (signals.length > 0) {
        return NextResponse.json({ signals, source: "db" });
      }
    } catch (err) {
      console.error("Feed: DB unavailable, falling back to seed data", err);
    }
  }

  // Fall back to static seed data when DB is unavailable or empty
  return NextResponse.json({ signals: SEED, source: "seed" });
}
