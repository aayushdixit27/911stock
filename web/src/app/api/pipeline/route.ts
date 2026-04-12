// EDGAR → Telegram pipeline
// Polls SEC EDGAR every 60s, scores signals, filters by user sensitivity, sends via Telegram

import { NextRequest, NextResponse } from "next/server";
import { fetchRecentForm4s, type Signal } from "@/lib/edgar";
import { scoreSignal } from "@/lib/signals";
import { analyzeSignal } from "@/lib/gemini";
import { sendTelegramMessage } from "@/lib/telegram";
import { getSql, migrate } from "@/lib/db";

// ── Sensitivity thresholds ──────────────────────────────────────────────────

const SENSITIVITY_THRESHOLDS: Record<string, number> = {
  paranoid: 1,
  moderate: 6,
  hands_off: 8,
};

// ── Default tickers for MVP ─────────────────────────────────────────────────

const DEFAULT_TICKERS = ["SMCI", "TSLA", "NVDA"];

// ── In-memory deduplication ─────────────────────────────────────────────────

const seenFilings = new Set<string>();

// ── Pipeline ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  await migrate();

  // Get all Telegram users
  const users = await sql<Array<{
    chat_id: string;
    tickers: string[];
    sensitivity: string;
  }>>`SELECT chat_id, tickers, sensitivity FROM telegram_users`;

  if (users.length === 0) {
    return NextResponse.json({
      status: "ok",
      message: "No Telegram users configured. Start the bot and send /start",
      users: 0,
    });
  }

  // Collect unique tickers across all users
  const allTickers = new Set<string>();
  for (const user of users) {
    const tickers = user.tickers.length > 0 ? user.tickers : DEFAULT_TICKERS;
    for (const t of tickers) allTickers.add(t);
  }

  const results: Array<{
    ticker: string;
    signal: Signal;
    score: number;
    sentTo: string[];
  }> = [];

  // Poll EDGAR for each ticker
  for (const ticker of allTickers) {
    try {
      const signals = await fetchRecentForm4s(ticker);

      for (const signal of signals) {
        // Deduplication
        const filingKey = `${signal.ticker}-${signal.id}`;
        if (seenFilings.has(filingKey)) continue;

        // Score the signal
        const score = scoreSignal(signal);

        // Find users who should receive this alert
        const matchingUsers = users.filter((user) => {
          const userTickers = user.tickers.length > 0 ? user.tickers : DEFAULT_TICKERS;
          const hasTicker = userTickers.includes(signal.ticker);
          const threshold = SENSITIVITY_THRESHOLDS[user.sensitivity] ?? 6;
          const passesThreshold = score >= threshold;
          return hasTicker && passesThreshold;
        });

        if (matchingUsers.length === 0) {
          seenFilings.add(filingKey);
          continue;
        }

        // Generate Gemini context
        let context: string;
        try {
          context = await analyzeSignal(signal, null);
        } catch (err) {
          console.warn("[pipeline] Gemini failed, using fallback:", err);
          const actionVerb = signal.action === "sell" ? "sold" : "bought";
          context = `${signal.insider} (${signal.role}) ${actionVerb} ${signal.shares.toLocaleString()} shares of ${signal.ticker}.`;
        }

        // Format alert for Telegram (HTML)
        const actionVerb = signal.action === "sell" ? "sold" : "bought";
        const valueFormatted = signal.total_value >= 1_000_000
          ? `$${(signal.total_value / 1_000_000).toFixed(1)}M`
          : `$${(signal.total_value / 1_000).toFixed(0)}K`;
        const urgency = score >= 8 ? "🚨 <b>URGENT</b>" : score >= 6 ? "⚡ <b>Important</b>" : "📊";

        const message = `${urgency} <b>${signal.ticker} Alert</b>

${signal.insider} (${signal.role}) ${actionVerb} ${valueFormatted} in stock.

${context}

Score: ${score}/10

Reply /details for more, /stop to unsubscribe.`;

        // Send to each matching user
        const sentTo: string[] = [];
        for (const user of matchingUsers) {
          const result = await sendTelegramMessage(user.chat_id, message);

          if (result.success) {
            sentTo.push(user.chat_id);
            // Store in DB
            await sql`
              INSERT INTO signals
                (id, user_id, ticker, company_name, insider, role, action, shares,
                 price_per_share, total_value, date, filed_at,
                 scheduled_10b5_1, last_transaction_months_ago,
                 position_reduced_pct, score, explanation, alerted, edgar_filing_id)
              VALUES
                (${signal.id}, ${user.chat_id}, ${signal.ticker}, ${signal.companyName},
                 ${signal.insider}, ${signal.role}, ${signal.action},
                 ${signal.shares}, ${signal.price_per_share}, ${signal.total_value},
                 ${signal.date}, ${signal.filed}, ${signal.scheduled_10b5_1},
                 ${signal.last_transaction_months_ago}, ${signal.position_reduced_pct},
                 ${score}, ${context}, true, ${signal.id})
              ON CONFLICT (user_id, edgar_filing_id) DO NOTHING
            `;
          }
        }

        if (sentTo.length > 0) {
          results.push({ ticker: signal.ticker, signal, score, sentTo });
          seenFilings.add(filingKey);
        }
      }
    } catch (err) {
      console.error(`[pipeline] Error polling ${ticker}:`, err);
    }
  }

  return NextResponse.json({
    status: "ok",
    users: users.length,
    tickers: Array.from(allTickers),
    alerts: results.length,
    results: results.map((r) => ({
      ticker: r.ticker,
      insider: r.signal.insider,
      role: r.signal.role,
      action: r.signal.action,
      score: r.score,
      sentTo: r.sentTo,
    })),
  });
}

// ── Manual trigger (POST) ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const ticker = body.ticker as string | undefined;

  if (ticker) {
    const sql = getSql();
    if (!sql) {
      return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
    }

    await migrate();

    const users = await sql<Array<{
      chat_id: string;
      tickers: string[];
      sensitivity: string;
    }>>`SELECT chat_id, tickers, sensitivity FROM telegram_users WHERE ${ticker} = ANY(tickers)`;

    if (users.length === 0) {
      return NextResponse.json({
        status: "ok",
        message: `No users watching ${ticker}`,
        users: 0,
      });
    }

    const fakeRequest = new NextRequest(`http://localhost?ticker=${ticker}`);
    return GET(fakeRequest);
  }

  return GET(request);
}