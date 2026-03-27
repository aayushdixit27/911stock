import { NextRequest } from "next/server";
import { getLastSignal } from "@/lib/state";

// SSE endpoint — streams pipeline status to the dashboard
export async function GET(_req: NextRequest) {
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

      // Step 5 — call the analyze endpoint internally
      await delay(800);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/analyze`, {
          method: "POST",
        });
        const json = await res.json();
        send({ step: "explanation_ready", status: "done", text: json.explanation });
      } catch {
        send({
          step: "explanation_ready",
          status: "done",
          text: "SMCI's CEO just sold $2.1M in stock — his first sale in 14 months, outside his scheduled plan. The last 3 times SMCI insiders did this, the stock dropped an average of 12% over 30 days. You own SMCI. This is worth paying attention to.",
        });
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
