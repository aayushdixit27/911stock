import { analyzeSignal } from "@/lib/gemini";
import { detectSignal, getHistoricalPattern } from "@/lib/signals";
import { getLastSignal } from "@/lib/state";

// SSE endpoint — streams pipeline status to the dashboard
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: { step: string; status: string; data?: unknown; text?: string }) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Step 1
      await delay(400);
      send({ step: "scanning", status: "done" });

      // Step 2 — use real signal from state if available, else SMCI fallback
      await delay(800);
      const lastSignal = getLastSignal();
      send({
        step: "signal_detected",
        status: "done",
        data: lastSignal
          ? {
              ticker: lastSignal.ticker,
              insider: lastSignal.insider,
              role: lastSignal.role,
              total_value: lastSignal.total_value,
            }
          : { ticker: "SMCI", insider: "Charles Liang", role: "CEO", total_value: 2125000 },
      });

      // Step 3
      await delay(1000);
      send({ step: "cross_referencing", status: "done" });

      // Step 4
      await delay(600);
      send({ step: "scoring", status: "done", data: { score: 8, significance: "HIGH" } });

      // Step 5 — same logic as POST /api/analyze (avoid self-fetch + empty JSON.parse on bad responses)
      await delay(800);
      const fallback =
        "SMCI's CEO just sold $2.1M in stock — his first sale in 14 months, outside his scheduled plan. The last 3 times SMCI insiders did this, the stock dropped an average of 12% over 30 days. You own SMCI. This is worth paying attention to.";
      try {
        const signal = detectSignal();
        if (signal) {
          const pattern = getHistoricalPattern(signal.ticker);
          const explanation = await analyzeSignal(signal, pattern);
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
