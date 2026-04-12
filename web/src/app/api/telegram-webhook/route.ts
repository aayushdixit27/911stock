// Telegram webhook — handles /start, /stop, /details, /settings commands

import { NextRequest, NextResponse } from "next/server";
import { getSql, migrate } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ── POST /api/telegram-webhook ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  await migrate();

  const body = await request.json();
  const message = body.message;
  if (!message) return new Response("ok");

  const chatId = String(message.chat.id);
  const text = (message.text || "").trim();
  const firstName = message.from?.first_name || "there";

  // ── /start ──────────────────────────────────────────────────────────────

  if (text === "/start") {
    // Create or update user
    await sql`
      INSERT INTO telegram_users (chat_id, tickers, sensitivity)
      VALUES (${chatId}, '{"SMCI","TSLA","NVDA"}', 'moderate')
      ON CONFLICT (chat_id) DO UPDATE SET
        tickers = '{"SMCI","TSLA","NVDA"}',
        sensitivity = 'moderate',
        updated_at = now()
    `;

    await sendTelegramMessage(chatId,
`👋 Welcome to 911Stock, ${firstName}!

I'll alert you when insiders make significant moves on your stocks.

<b>Currently watching:</b> SMCI, TSLA, NVDA
<b>Sensitivity:</b> Moderate (score ≥6)

<b>Commands:</b>
/watch AAPL — add a ticker
/unwatch AAPL — remove a ticker
/sensitivity paranoid — every insider move
/sensitivity moderate — significant moves only
/sensitivity hands_off — major red flags only
/details — last alert breakdown
/stop — unsubscribe`);

    return new Response("ok");
  }

  // ── /stop ───────────────────────────────────────────────────────────────

  if (text === "/stop") {
    await sql`DELETE FROM telegram_users WHERE chat_id = ${chatId}`;
    await sendTelegramMessage(chatId, "You've been unsubscribed from 911Stock. Reply /start to resubscribe.");
    return new Response("ok");
  }

  // ── /details ────────────────────────────────────────────────────────────

  if (text === "/details") {
    const signals = await sql<Array<{
      ticker: string;
      insider: string;
      role: string;
      action: string;
      shares: number;
      total_value: number;
      score: number;
      explanation: string | null;
      scheduled_10b5_1: boolean;
    }>>`
      SELECT ticker, insider, role, action, shares, total_value,
             score, explanation, scheduled_10b5_1
      FROM signals
      WHERE user_id = ${chatId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (signals.length === 0) {
      await sendTelegramMessage(chatId, "No recent signals. You'll get alerts when insider moves happen.");
    } else {
      const s = signals[0];
      const actionVerb = s.action === "sell" ? "sold" : "bought";
      const valueFormatted = s.total_value >= 1_000_000
        ? `$${(s.total_value / 1_000_000).toFixed(1)}M`
        : `$${(s.total_value / 1_000).toFixed(0)}K`;

      await sendTelegramMessage(chatId,
`<b>${s.ticker} Details</b>

${s.insider} (${s.role}) ${actionVerb} ${valueFormatted}

Score: ${s.score}/10
• ${s.role} role (+${["CEO", "CFO", "CTO", "COO"].includes(s.role) ? 2 : 0})
• ${s.scheduled_10b5_1 ? "Scheduled 10b5-1 plan" : "Unscheduled sale"}

${s.explanation || "No additional context."}`);
    }

    return new Response("ok");
  }

  // ── /watch TICKER ───────────────────────────────────────────────────────

  if (text.startsWith("/watch ")) {
    const ticker = text.replace("/watch ", "").trim().toUpperCase();
    const user = await sql<Array<{ tickers: string[] }>>`
      SELECT tickers FROM telegram_users WHERE chat_id = ${chatId}
    `;

    if (user.length === 0) {
      await sendTelegramMessage(chatId, "Send /start first to subscribe.");
    } else {
      const tickers = [...new Set([...user[0].tickers, ticker])];
      await sql`
        UPDATE telegram_users SET tickers = ${tickers}, updated_at = now()
        WHERE chat_id = ${chatId}
      `;
      await sendTelegramMessage(chatId, `✅ Now watching: ${tickers.join(", ")}`);
    }

    return new Response("ok");
  }

  // ── /unwatch TICKER ─────────────────────────────────────────────────────

  if (text.startsWith("/unwatch ")) {
    const ticker = text.replace("/unwatch ", "").trim().toUpperCase();
    const user = await sql<Array<{ tickers: string[] }>>`
      SELECT tickers FROM telegram_users WHERE chat_id = ${chatId}
    `;

    if (user.length === 0) {
      await sendTelegramMessage(chatId, "Send /start first to subscribe.");
    } else {
      const tickers = user[0].tickers.filter((t: string) => t !== ticker);
      await sql`
        UPDATE telegram_users SET tickers = ${tickers}, updated_at = now()
        WHERE chat_id = ${chatId}
      `;
      await sendTelegramMessage(chatId, tickers.length > 0
        ? `✅ Removed ${ticker}. Watching: ${tickers.join(", ")}`
        : `✅ Removed ${ticker}. Add more with /watch TICKER`
      );
    }

    return new Response("ok");
  }

  // ── /sensitivity LEVEL ──────────────────────────────────────────────────

  if (text.startsWith("/sensitivity ")) {
    const level = text.replace("/sensitivity ", "").trim().toLowerCase();
    const valid = ["paranoid", "moderate", "hands_off", "hands-off"];

    if (!valid.includes(level)) {
      await sendTelegramMessage(chatId, "Use: /sensitivity paranoid | moderate | hands_off");
    } else {
      const normalized = level === "hands-off" ? "hands_off" : level;
      await sql`
        UPDATE telegram_users SET sensitivity = ${normalized}, updated_at = now()
        WHERE chat_id = ${chatId}
      `;
      const labels: Record<string, string> = {
        paranoid: "🔴 Paranoid — every insider move",
        moderate: "🟡 Moderate — significant moves only",
        hands_off: "🟢 Hands-off — major red flags only",
      };
      await sendTelegramMessage(chatId, `✅ Sensitivity: ${labels[normalized]}`);
    }

    return new Response("ok");
  }

  // ── Unknown command ─────────────────────────────────────────────────────

  await sendTelegramMessage(chatId,
`Unknown command. Use:
/start — subscribe
/watch TICKER — add ticker
/unwatch TICKER — remove ticker
/sensitivity paranoid|moderate|hands_off
/details — last alert
/stop — unsubscribe`);

  return new Response("ok");
}