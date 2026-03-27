import { NextRequest, NextResponse } from "next/server";
import { analyzeSignal } from "@/lib/gemini";
import { detectSignal, getHistoricalPattern } from "@/lib/signals";

export async function POST(_req: NextRequest) {
  try {
    const signal = detectSignal();
    if (!signal) {
      return NextResponse.json({ error: "No signal" }, { status: 404 });
    }

    const pattern = getHistoricalPattern(signal.ticker);
    const explanation = await analyzeSignal(signal, pattern);

    return NextResponse.json({ explanation, signal, pattern });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
