import { NextResponse } from "next/server";
import { fetchLatestSignal } from "@/lib/edgar";
import { fetchNewsSentiment } from "@/lib/news";
import { scoreSignal, getHistoricalPattern, getWatchlist } from "@/lib/signals";
import { analyzeSignal } from "@/lib/gemini";
import { makeOutboundCall } from "@/lib/bland";
import {
  insertSignal,
  getLatestSignal,
  markSignalAlerted,
  insertAlert,
  newId,
  type DBSignal,
} from "@/lib/db";
import { setLastSignal } from "@/lib/state";
import type { Signal } from "@/lib/edgar";

export async function POST(): Promise<NextResponse> {
  try {
    // 1. Get watched tickers from watchlist
    const watchlist = getWatchlist();
    const tickers = watchlist.stocks;
    const phone = watchlist.phone;

    // 2. Fetch latest signal from EDGAR
    const signal: Signal | null = await fetchLatestSignal(tickers);

    // 3. No live signal found
    if (!signal) {
      return NextResponse.json({ found: false });
    }

    // 4. Fetch news sentiment
    const newsSentiment = await fetchNewsSentiment(signal.ticker);

    // 5. Score the signal
    const score = scoreSignal(signal, newsSentiment);

    // 6. Score too low — skip
    if (score < 5) {
      return NextResponse.json({
        found: true,
        score,
        alerted: false,
        reason: "score too low",
        ticker: signal.ticker,
      });
    }

    // 7. Get historical pattern for context
    const pattern = getHistoricalPattern(signal.ticker);

    // 8. Analyze the signal with Gemini
    const explanation = await analyzeSignal(signal, pattern);

    // 9. Map Signal → DBSignal and insert (ON CONFLICT DO NOTHING handles duplicates)
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

    try {
      await insertSignal(dbSignal);
    } catch (dbErr) {
      console.error("[poll] DB insertSignal failed — continuing:", dbErr);
    }

    // 10. Update in-memory state for SSE stream
    setLastSignal(signal);

    // 11. Check if already alerted
    let alreadyAlerted = false;
    try {
      const existing = await getLatestSignal(signal.ticker);
      if (existing && existing.id === signal.id && existing.alerted) {
        alreadyAlerted = true;
      }
    } catch (dbErr) {
      console.error("[poll] DB getLatestSignal failed — assuming not alerted:", dbErr);
    }

    // 12. Trigger outbound call if score >= 7 and not already alerted
    let callId: string | null = null;
    let alerted = false;

    if (score >= 7 && !alreadyAlerted) {
      try {
        const callResult = await makeOutboundCall(phone, explanation, signal);
        callId = callResult.callId;
        alerted = true;

        try {
          await markSignalAlerted(signal.id);
        } catch (dbErr) {
          console.error("[poll] DB markSignalAlerted failed:", dbErr);
        }

        try {
          await insertAlert({
            id: newId(),
            signal_id: signal.id,
            ticker: signal.ticker,
            call_id: callId,
            explanation,
          });
        } catch (dbErr) {
          console.error("[poll] DB insertAlert failed:", dbErr);
        }
      } catch (callErr) {
        console.error("[poll] Bland outbound call failed:", callErr);
      }
    }

    // 13. Return full summary
    return NextResponse.json({
      found: true,
      score,
      alerted,
      ticker: signal.ticker,
      company: signal.companyName,
      insider: signal.insider,
      role: signal.role,
      action: signal.action,
      shares: signal.shares,
      total_value: signal.total_value,
      date: signal.date,
      scheduled_10b5_1: signal.scheduled_10b5_1,
      explanation,
      call_id: callId,
      news_sentiment: newsSentiment
        ? {
            score: newsSentiment.overallScore,
            label: newsSentiment.label,
            article_count: newsSentiment.articleCount,
          }
        : null,
    });
  } catch (err) {
    console.error("[poll] Unhandled error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
