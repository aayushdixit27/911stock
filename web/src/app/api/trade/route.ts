import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLastSignal } from "@/lib/state";
import { getHistoricalPattern } from "@/lib/signals";
import {
  insertLearning,
  getLearningCount,
  markSignalAlerted,
  newId,
} from "@/lib/db";

type TradeAction = "reduce_50" | "hold";

interface TradeRequestBody {
  signalId?: string;
  ticker?: string;
  action: TradeAction;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: TradeRequestBody;
  try {
    body = (await req.json()) as TradeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action } = body;
  if (action !== "reduce_50" && action !== "hold") {
    return NextResponse.json(
      { error: 'action must be "reduce_50" or "hold"' },
      { status: 400 }
    );
  }

  // 1. Get last signal from in-memory state
  const signal = getLastSignal();
  if (!signal) {
    return NextResponse.json({ error: "No active signal found" }, { status: 404 });
  }

  const ticker = body.ticker ?? signal.ticker;
  const signalId = body.signalId ?? signal.id;

  // 2. Get historical pattern
  const pattern = getHistoricalPattern(ticker);

  // 3 & 4. Count prior learnings and build note
  let count = 0;
  let dbError = false;

  try {
    count = await getLearningCount(userId, ticker);
  } catch {
    dbError = true;
  }

  const learningNote =
    count > 0
      ? `Agent has seen ${count} prior ${ticker} signals. Combining with historical analysis.`
      : `First ${ticker} signal processed.`;

  // 5. Insert learning record
  try {
    await insertLearning({
      id: newId(),
      signal_id: signalId,
      ticker,
      pattern_match_count: pattern?.occurrences.length ?? 0,
      avg_historical_drop: pattern?.avg_30d_drop_pct ?? 0,
      action_taken: action,
      user_approved: action !== "hold",
      notes: learningNote,
    }, userId);
  } catch {
    dbError = true;
  }

  // 6. Mark signal as alerted
  try {
    await markSignalAlerted(userId, signalId);
  } catch {
    dbError = true;
  }

  // 7. Return trade result
  const responseBody: Record<string, unknown> = {
    success: true,
    trade: {
      ticker: signal.ticker,
      action: "SELL",
      shares: Math.floor(signal.shares * 0.5),
      price: signal.price_per_share,
      total: Math.floor(signal.total_value * 0.5),
      estimatedSavings: Math.floor(
        signal.total_value * 0.5 * (pattern?.avg_30d_drop_pct ?? 12) / 100
      ),
    },
    agentLearning: {
      patternMatchCount: pattern?.occurrences.length ?? 0,
      avgHistoricalDrop: pattern?.avg_30d_drop_pct ?? 0,
      priorSignalCount: count,
      note: learningNote,
    },
    ghostDb: {
      signalStored: true,
      learningLogged: true,
      alertRecorded: true,
    },
  };

  if (dbError) {
    responseBody.dbError = true;
  }

  return NextResponse.json(responseBody);
}
