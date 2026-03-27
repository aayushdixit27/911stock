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
import { setLastSignal } from "@/lib/state";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isLive = searchParams.get("mode") === "live";

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

    // Persist signal so the SSE route can use it
    setLastSignal(signal);

    const pattern = getHistoricalPattern(signal.ticker);

    // Fetch news sentiment in both modes (may return null)
    const newsSentiment = await fetchNewsSentiment(signal.ticker);
    const score = scoreSignal(signal, newsSentiment);

    // Generate plain-English explanation via Gemini
    const explanation = await analyzeSignal(signal, pattern);

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
    });
  } catch (err) {
    console.error("Trigger error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
