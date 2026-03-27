import { NextRequest, NextResponse } from "next/server";
import { analyzeSignal } from "@/lib/gemini";
import { makeOutboundCall } from "@/lib/bland";
import { detectSignal, getHistoricalPattern, getWatchlist, scoreSignal } from "@/lib/signals";

export async function POST(_req: NextRequest) {
  try {
    const user = getWatchlist();
    const signal = detectSignal();

    if (!signal) {
      return NextResponse.json({ error: "No signals for your watchlist" }, { status: 404 });
    }

    const pattern = getHistoricalPattern(signal.ticker);
    const score = scoreSignal(signal);

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
    });
  } catch (err) {
    console.error("Trigger error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
