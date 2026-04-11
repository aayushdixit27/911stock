// 911Stock Telegram Bot
// Commands: /check TSLA, /watch AAPL, /unwatch TSLA, /watchlist, /help

import "dotenv/config";
import { fetchRecentForm4s, SUPPORTED_TICKERS, type Signal } from "./edgar.js";
import { scoreSignal, getHistoricalPattern } from "./score.js";
import { analyzeSignal } from "./analyze.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN not set");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// In-memory watchlists per chat — swap for DB later
const watchlists = new Map<number, Set<string>>();

// ── Telegram API helpers ──────────────────────────────────────────────────────

async function sendMessage(chatId: number, text: string, parseMode = "HTML") {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });
}

async function getUpdates(offset?: number): Promise<TelegramUpdate[]> {
  const url = new URL(`${API}/getUpdates`);
  url.searchParams.set("timeout", "30");
  if (offset !== undefined) url.searchParams.set("offset", String(offset));

  try {
    const res = await fetch(url.toString());
    const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[] };
    return data.ok ? data.result : [];
  } catch {
    return [];
  }
}

type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: { id: number; first_name?: string };
    text?: string;
  };
};

// ── Format helpers ────────────────────────────────────────────────────────────

function formatSignal(signal: Signal, score: number, analysis?: string): string {
  const urgency = score >= 8 ? "🔴 HIGH" : score >= 5 ? "🟡 MEDIUM" : "🟢 LOW";
  const value =
    signal.total_value >= 1_000_000
      ? `$${(signal.total_value / 1_000_000).toFixed(1)}M`
      : `$${(signal.total_value / 1_000).toFixed(0)}K`;

  let msg = `<b>${signal.ticker}</b> — ${signal.insider} (${signal.role}) ${signal.action} ${signal.shares.toLocaleString()} shares\n`;
  msg += `${urgency} · Score: ${score}/10 · ${value}\n`;
  msg += `Filed: ${signal.date} · ${signal.scheduled_10b5_1 ? "Scheduled (10b5-1)" : "Unscheduled"}\n`;

  if (analysis) {
    msg += `\n${analysis}\n`;
  }

  msg += `\n<a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${signal.ticker}&type=4&dateb=&owner=include&count=10">View SEC Filings</a>`;

  return msg;
}

function formatWatchlist(chatId: number): string {
  const tickers = watchlists.get(chatId);
  if (!tickers || tickers.size === 0) {
    return "Your watchlist is empty. Use /watch TSLA to add tickers.";
  }
  return `<b>Your watchlist</b>\n${[...tickers].map((t) => `• <code>${t}</code>`).join("\n")}\n\nUse /check TICKER to check latest filings.`;
}

// ── Command handlers ──────────────────────────────────────────────────────────

async function handleCheck(chatId: number, ticker: string) {
  const upper = ticker.toUpperCase();

  await sendMessage(chatId, `🔍 Checking SEC Form 4 filings for <b>${upper}</b>...`);

  const signals = await fetchRecentForm4s(upper);

  if (signals.length === 0) {
    await sendMessage(
      chatId,
      `No recent Form 4 filings found for <b>${upper}</b>.\n\n${
        !SUPPORTED_TICKERS.includes(upper)
          ? `⚠️ <b>${upper}</b> is not in the CIK map yet. Supported: ${SUPPORTED_TICKERS.join(", ")}`
          : "This ticker is supported but has no recent insider transactions."
      }`
    );
    return;
  }

  // Show top 3 most recent
  const toShow = signals.slice(0, 3);

  for (const signal of toShow) {
    const score = scoreSignal(signal);

    let analysis: string | undefined;
    if (score >= 5) {
      try {
        const pattern = getHistoricalPattern(upper);
        analysis = await analyzeSignal(signal, pattern);
      } catch (err) {
        console.warn("[bot] LLM analysis failed:", err);
      }
    }

    await sendMessage(chatId, formatSignal(signal, score, analysis));
  }

  if (signals.length > toShow.length) {
    await sendMessage(
      chatId,
      `<i>Showing ${toShow.length} of ${signals.length} recent filings.</i>`
    );
  }
}

async function handleWatch(chatId: number, ticker: string) {
  const upper = ticker.toUpperCase();

  if (!watchlists.has(chatId)) watchlists.set(chatId, new Set());
  const list = watchlists.get(chatId)!;

  if (list.size >= 5) {
    await sendMessage(chatId, "You can watch up to 5 tickers. Use /unwatch to remove one first.");
    return;
  }

  list.add(upper);
  await sendMessage(chatId, `✅ Added <b>${upper}</b> to your watchlist.\n\n${formatWatchlist(chatId)}`);
}

async function handleUnwatch(chatId: number, ticker: string) {
  const upper = ticker.toUpperCase();
  const list = watchlists.get(chatId);

  if (!list || !list.has(upper)) {
    await sendMessage(chatId, `<b>${upper}</b> is not in your watchlist.`);
    return;
  }

  list.delete(upper);
  await sendMessage(chatId, `Removed <b>${upper}</b>.\n\n${formatWatchlist(chatId)}`);
}

async function handleHelp(chatId: number) {
  await sendMessage(
    chatId,
    `<b>911Stock Bot</b> — Insider trading alerts\n\n` +
      `<b>Commands:</b>\n` +
      `/check TSLA — Check recent insider filings\n` +
      `/watch AAPL — Add ticker to watchlist (max 5)\n` +
      `/unwatch AAPL — Remove ticker\n` +
      `/watchlist — View your watchlist\n` +
      `/help — Show this message\n\n` +
      `<b>Supported tickers:</b>\n${SUPPORTED_TICKERS.join(", ")}\n\n` +
      `<i>Data from SEC EDGAR. Alerts scored 0-10 based on insider role, transaction size, and pattern history.</i>`
  );
}

// ── Message router ────────────────────────────────────────────────────────────

async function handleMessage(chatId: number, text: string) {
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase().replace("@stock911_bot", "");
  const arg = parts[1] || "";

  switch (cmd) {
    case "/start":
      await sendMessage(
        chatId,
        `👋 <b>Welcome to 911Stock!</b>\n\nI monitor SEC Form 4 insider trading filings and alert you when something matters.\n\nTry: /check TSLA\n\nType /help for all commands.`
      );
      break;
    case "/check":
      if (!arg) {
        await sendMessage(chatId, "Usage: /check TSLA");
        return;
      }
      await handleCheck(chatId, arg);
      break;
    case "/watch":
      if (!arg) {
        await sendMessage(chatId, "Usage: /watch AAPL");
        return;
      }
      await handleWatch(chatId, arg);
      break;
    case "/unwatch":
      if (!arg) {
        await sendMessage(chatId, "Usage: /unwatch AAPL");
        return;
      }
      await handleUnwatch(chatId, arg);
      break;
    case "/watchlist":
      await sendMessage(chatId, formatWatchlist(chatId));
      break;
    case "/help":
      await handleHelp(chatId);
      break;
    default:
      // Ignore non-command messages
      break;
  }
}

// ── Long-polling loop ─────────────────────────────────────────────────────────

async function main() {
  console.log("[911stock-bot] Starting...");

  // Register commands with BotFather
  await fetch(`${API}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "check", description: "Check insider filings — /check TSLA" },
        { command: "watch", description: "Add ticker to watchlist — /watch AAPL" },
        { command: "unwatch", description: "Remove ticker — /unwatch AAPL" },
        { command: "watchlist", description: "View your watchlist" },
        { command: "help", description: "Show help" },
      ],
    }),
  });

  console.log("[911stock-bot] Bot ready. Polling for messages...");

  let offset: number | undefined;

  while (true) {
    const updates = await getUpdates(offset);

    for (const update of updates) {
      offset = update.update_id + 1;

      if (update.message?.text) {
        const { chat, text } = update.message;
        console.log(`[${chat.first_name || chat.id}] ${text}`);

        try {
          await handleMessage(chat.id, text);
        } catch (err) {
          console.error("[bot] handler error:", err);
          await sendMessage(chat.id, "Something went wrong. Try again.");
        }
      }
    }
  }
}

main();
