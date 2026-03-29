import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeSignal } from "@/lib/gemini";
import { detectSignal, getHistoricalPattern } from "@/lib/signals";

const OVERCLAW_URL = `http://localhost:${process.env.OVERCLAW_PORT ?? "8001"}/analyze`;

async function analyzeViaOverclaw(
  signal: ReturnType<typeof detectSignal>,
  pattern: ReturnType<typeof getHistoricalPattern>
): Promise<string> {
  const res = await fetch(OVERCLAW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signal, pattern }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Overclaw server error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { explanation?: string; error?: string };
  if (!data.explanation) throw new Error(data.error ?? "No explanation returned");
  return data.explanation;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signal = detectSignal();
    if (!signal) {
      return NextResponse.json({ error: "No signal" }, { status: 404 });
    }

    const pattern = getHistoricalPattern(signal.ticker);

    let explanation: string;
    try {
      explanation = await analyzeViaOverclaw(signal, pattern);
      console.log("[analyze] used overclaw agent");
    } catch (err) {
      console.warn("[analyze] overclaw unavailable, falling back to gemini:", err);
      explanation = await analyzeSignal(signal, pattern);
    }

    return NextResponse.json({ explanation, signal, pattern });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
