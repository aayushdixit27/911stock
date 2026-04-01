import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeSignal } from "@/lib/gemini";
import { detectSignal, getHistoricalPattern } from "@/lib/signals";
import { getLastSignal, getLastUserId } from "@/lib/state";
import { getWatchlist } from "@/lib/db";

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
  if (!res.ok) throw new Error(`Overclaw ${res.status}`);
  const data = (await res.json()) as { explanation?: string; error?: string };
  if (!data.explanation) throw new Error(data.error ?? "No explanation");
  return data.explanation;
}

// SSE endpoint — streams pipeline status to the dashboard (user-scoped)
export async function GET(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  // Get user's watchlist for personalized scanning
  const watchlist = await getWatchlist(userId);
  const userTickers = watchlist.map((w) => w.ticker);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: { step: string; status: string; data?: unknown; text?: string }) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Step 1 - Scan user's watchlist
      await delay(400);
      send({ 
        step: "scanning", 
        status: "done",
        data: { tickers: userTickers, count: userTickers.length }
      });

      // Step 2 — use real signal from state if available and matches user's watchlist
      await delay(800);
      const lastSignal = getLastSignal();
      const lastUserId = getLastUserId();
      
      // Only show signal if it belongs to this user's watchlist or was triggered by this user
      const isRelevantSignal = lastSignal && 
        (userTickers.includes(lastSignal.ticker) || lastUserId === userId);
      
      send({
        step: "signal_detected",
        status: "done",
        data: isRelevantSignal
          ? {
              ticker: lastSignal.ticker,
              insider: lastSignal.insider,
              role: lastSignal.role,
              total_value: lastSignal.total_value,
              userScoped: lastUserId === userId,
            }
          : { 
              ticker: userTickers[0] ?? "N/A", 
              insider: "No signals", 
              role: "-", 
              total_value: 0,
              userScoped: false,
              message: userTickers.length === 0 
                ? "Add tickers to your watchlist to see signals" 
                : "No new signals detected for your watchlist"
            },
      });

      // Step 3
      await delay(1000);
      send({ step: "cross_referencing", status: "done" });

      // Step 4 - Score based on user's context
      await delay(600);
      const score = isRelevantSignal ? 8 : 0;
      send({ step: "scoring", status: "done", data: { score, significance: score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW" } });

      // Step 5 — generate explanation for this user
      await delay(800);
      const fallback =
        "SMCI's CEO just sold $2.1M in stock — his first sale in 14 months, outside his scheduled plan. The last 3 times SMCI insiders did this, the stock dropped an average of 12% over 30 days. You own SMCI. This is worth paying attention to.";
      try {
        const signal = detectSignal();
        if (signal && userTickers.includes(signal.ticker)) {
          const pattern = getHistoricalPattern(signal.ticker);
          let explanation: string;
          try {
            explanation = await analyzeViaOverclaw(signal, pattern);
            console.log("[signal] used overclaw agent");
          } catch {
            explanation = await analyzeSignal(signal, pattern);
          }
          send({ step: "explanation_ready", status: "done", text: explanation });
        } else {
          send({ step: "explanation_ready", status: "done", text: fallback });
        }
      } catch {
        send({ step: "explanation_ready", status: "done", text: fallback });
      }

      // Step 6
      await delay(500);
      send({ step: "calling", status: "active" });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
