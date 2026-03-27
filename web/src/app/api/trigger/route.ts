import { NextRequest, NextResponse } from "next/server";
import { analyzeSignal } from "@/lib/gemini";
import { makeOutboundCall } from "@/lib/bland";
import {
  detectSignal,
  getHistoricalPattern,
  getWatchlist,
  scoreSignal,
  Signal,
} from "@/lib/signals";
import { fetchLatestSignal } from "@/lib/edgar";
import { fetchNewsSentiment } from "@/lib/news";
import { setLastSignal, setLastUserId } from "@/lib/state";
import { insertSignal, getLatestSignal, type DBSignal } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isLive = searchParams.get("mode") === "live";

    // Extract userId from request body if present
    let userId: string | null = null;
    try {
      const body = await req.json() as { userId?: string };
      if (body.userId) {
        userId = body.userId;
        setLastUserId(userId);
      }
    } catch {
      // body may be empty — that's fine
    }

    const user = getWatchlist();

    let signal: Signal | null = null;

    if (isLive) {
      const edgarSignal = await fetchLatestSignal(user.stocks);
      if (edgarSignal) {
        // edgar.ts Signal is structurally identical to signals.ts Signal
        signal = edgarSignal as Signal;
      } else {
        console.log(
          "Live mode: no EDGAR signals found, falling back to demo"
        );
        signal = detectSignal();
      }
    } else {
      signal = detectSignal();
    }

    if (!signal) {
      return NextResponse.json(
        { error: "No signals for your watchlist" },
        { status: 404 }
      );
    }

    // Check DB for a more recent explanation for this signal
    try {
      const existingDbSignal = await getLatestSignal(signal.ticker);
      if (existingDbSignal?.explanation) {
        // DB has a richer explanation — surface it but continue with fresh scoring
        console.log(`DB hit for ${signal.ticker}: using stored explanation`);
      }
    } catch (err) {
      console.error("Trigger: DB lookup failed, continuing without it", err);
    }

    // Persist signal so the SSE route can use it
    setLastSignal(signal);

    const pattern = getHistoricalPattern(signal.ticker);

    // Fetch news sentiment in both modes (may return null)
    const newsSentiment = await fetchNewsSentiment(signal.ticker);
    const score = scoreSignal(signal, newsSentiment);

    // Generate plain-English explanation via Gemini
    const explanation = await analyzeSignal(signal, pattern);

    // Save signal to DB (fire-and-forget — don't block the response)
    const dbSignal: DBSignal = {
      id: signal.id,
      ticker: signal.ticker,
      company_name: signal.companyName,
      insider: signal.insider,
      role: signal.role,
      action: signal.action,
      shares: signal.shares,
      price_per_share: signal.price_per_share,
      total_value: signal.total_value,
      date: signal.date,
      filed_at: signal.filed,
      scheduled_10b5_1: signal.scheduled_10b5_1,
      last_transaction_months_ago: signal.last_transaction_months_ago,
      position_reduced_pct: signal.position_reduced_pct,
      score,
      explanation,
      alerted: false,
    };
    insertSignal(dbSignal).catch((err) =>
      console.error("Trigger: failed to save signal to DB", err)
    );

    // Trigger outbound call via Bland if score is high enough
    let callId: string | null = null;
    const phone = process.env.MY_PHONE_NUMBER || user.phone;

    if (score >= 7 && phone && phone !== "+1XXXXXXXXXX") {
      const result = await makeOutboundCall(phone, explanation, signal);
      callId = result.callId;
    }

    return NextResponse.json({
      success: true,
      signal,
      pattern,
      score,
      explanation,
      callId,
      callTriggered: !!callId,
      mode: isLive ? "live" : "demo",
      userId,
    });
  } catch (err) {
    console.error("Trigger error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
