import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecentSignals, getSignalById, getUserTier, type DBSignal } from "@/lib/db";

// Seed data only shown for demo when explicitly requested
const SEED: DBSignal[] = [
  {
    id: "demo-smci-ceo-sell-20260319",
    user_id: "demo",
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
      "SMCI's CEO just sold $2.1M — first sale in 14 months, outside his scheduled plan. Historical pattern: avg −12% over 30 days.",
    alerted: false,
  },
  {
    id: "demo-nvda-cfo-sell-20260321",
    user_id: "demo",
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

export async function GET(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
  const offset = (page - 1) * limit;
  const signalId = searchParams.get("id");

  // Get user tier for signal timing badges
  const userTier = await getUserTier(userId);
  const isPremium = userTier === "premium";

  // If signalId is provided, return single signal detail
  if (signalId) {
    const signal = await getSignalById(userId, signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }
    return NextResponse.json({ 
      signal,
      tier: userTier,
      isPremium,
      signalTiming: isPremium ? "realtime" : "delayed",
    });
  }

  // Get user-scoped signals from DB with pagination
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const signals = await getRecentSignals(userId, limit, offset);
      
      // Check if there are more signals for pagination
      const totalCheck = await getRecentSignals(userId, limit + 1, offset);
      const hasMore = totalCheck.length > limit;
      
      if (signals.length > 0 || offset > 0) {
        return NextResponse.json({ 
          signals, 
          source: "db",
          tier: userTier,
          isPremium,
          signalTiming: isPremium ? "realtime" : "delayed",
          pagination: {
            page,
            limit,
            count: signals.length,
            hasMore,
            nextPage: hasMore ? page + 1 : null,
          }
        });
      }
    } catch (err) {
      console.error("Feed: DB unavailable, falling back to seed data", err);
    }
  }

  // Empty state - no signals yet
  return NextResponse.json({ 
    signals: [], 
    source: "db",
    tier: userTier,
    isPremium,
    signalTiming: isPremium ? "realtime" : "delayed",
    pagination: {
      page,
      limit,
      count: 0,
      hasMore: false,
    },
    empty: true,
    message: "No signals yet. Add tickers to your watchlist and run the detection pipeline to see signals here."
  });
}
