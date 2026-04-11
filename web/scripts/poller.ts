import {
  WATCHED_TICKERS,
  ALERT_THRESHOLD,
  POLL_INTERVAL_MS,
  REQUIRED_ENV_VARS,
} from "./config";
import { fetchRecentForm4s } from "../src/lib/edgar";
import { scoreSignal } from "../src/lib/signals";
import { analyzeSignal } from "../src/lib/gemini";
import { getSql, migrate, insertSignal, newId } from "../src/lib/db";
import { sendTelegramMessage, isTelegramConfigured } from "../src/lib/telegram";

// ── Startup validation ─────────────────────────────────────────────

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error(`[poller] Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

async function main() {
  validateEnv();
  console.log("[poller] Starting EDGAR poller...");
  console.log(`[poller] Watching tickers: ${WATCHED_TICKERS.join(", ")}`);
  console.log(`[poller] Alert threshold: ${ALERT_THRESHOLD}/10`);
  console.log(`[poller] Poll interval: ${POLL_INTERVAL_MS / 1000}s`);

  const sql = getSql();
  if (!sql) {
    console.error("[poller] DATABASE_URL not set");
    process.exit(1);
  }
  await migrate();
  console.log("[poller] Database connected and migrated");

  if (!isTelegramConfigured()) {
    console.warn("[poller] Telegram not configured — alerts will be logged only");
  }

  console.log("[poller] Ready. Waiting for first poll cycle...");

  // Initial poll immediately
  await pollCycle();

  // Then every 60s
  setInterval(async () => {
    await pollCycle();
  }, POLL_INTERVAL_MS);
}

async function pollCycle(): Promise<void> {
  console.log(`[poller] ── Poll cycle started at ${new Date().toISOString()} ──`);
  let newSignalsFound = 0;

  for (const ticker of WATCHED_TICKERS) {
    try {
      const filings = await fetchRecentForm4s(ticker);
      if (filings.length === 0) {
        console.log(`[poller] ${ticker}: no recent Form 4 filings`);
        continue;
      }

      for (const filing of filings) {
        const exists = await isFilingProcessed(ticker, filing.id);
        if (exists) {
          console.log(`[poller] ${ticker}: skipping duplicate ${filing.id}`);
          continue;
        }

        console.log(
          `[poller] ${ticker}: new filing detected — ${filing.insider} (${filing.role}) ${filing.action} ${filing.shares} shares`
        );
        newSignalsFound++;

        const score = scoreSignal(filing);
        console.log(`[poller] ${ticker}: score ${score}/10`);

        if (score >= ALERT_THRESHOLD) {
          await processHighScoreSignal(filing, score);
        } else {
          console.log(
            `[poller] ${ticker}: score ${score} below threshold ${ALERT_THRESHOLD}, skipping alert`
          );
        }
      }
    } catch (err) {
      console.error(`[poller] Error polling ${ticker}:`, err);
    }
  }

  console.log(`[poller] ── Poll cycle complete: ${newSignalsFound} new filing(s) found ──`);
}

async function isFilingProcessed(ticker: string, edgarFilingId: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    const rows = await sql`SELECT id FROM signals WHERE edgar_filing_id = ${edgarFilingId} LIMIT 1`;
    return rows.length > 0;
  } catch (err) {
    console.error(`[poller] Dedup check error for ${ticker}/${edgarFilingId}:`, err);
    return false;
  }
}

async function processHighScoreSignal(
  filing: Awaited<ReturnType<typeof fetchRecentForm4s>>[number],
  score: number
): Promise<void> {
  const ticker = filing.ticker;

  let explanation: string;
  try {
    explanation = await analyzeSignal(
      {
        ticker: filing.ticker,
        companyName: filing.companyName,
        insider: filing.insider,
        role: filing.role,
        action: filing.action,
        shares: filing.shares,
        total_value: filing.total_value,
        scheduled_10b5_1: filing.scheduled_10b5_1,
        last_transaction_months_ago: filing.last_transaction_months_ago,
        position_reduced_pct: filing.position_reduced_pct,
      },
      null
    );
    console.log(`[poller] ${ticker}: LLM analysis: ${explanation}`);
  } catch (err) {
    console.error(`[poller] ${ticker}: LLM analysis failed, using fallback:`, err);
    explanation = `Insider ${filing.insider} (${filing.role}) filed Form 4 for ${filing.action} of ${filing.shares} shares. Analysis pending.`;
  }

  const dbSignal = {
    id: newId(),
    user_id: "",
    ticker: filing.ticker,
    company_name: filing.companyName,
    insider: filing.insider,
    role: filing.role,
    action: filing.action,
    shares: filing.shares,
    price_per_share: filing.price_per_share,
    total_value: filing.total_value,
    date: filing.date,
    filed_at: filing.filed,
    scheduled_10b5_1: filing.scheduled_10b5_1,
    last_transaction_months_ago: filing.last_transaction_months_ago,
    position_reduced_pct: filing.position_reduced_pct,
    score,
    explanation,
    alerted: false,
    edgar_filing_id: filing.id,
  };

  try {
    await insertSignal(dbSignal, "");
    console.log(`[poller] ${ticker}: signal saved to DB (id: ${dbSignal.id})`);
  } catch (err) {
    console.error(`[poller] ${ticker}: failed to save signal to DB:`, err);
    return;
  }

  await sendTelegramAlerts(dbSignal);
}

async function getWatchlistForTicker(ticker: string): Promise<string[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (adminChatId) {
      return [adminChatId];
    }
    const rows = await sql<{ telegram_chat_id: string }[]>`
      SELECT DISTINCT u.telegram_chat_id
      FROM watchlist w
      JOIN users u ON u.id = w.user_id
      WHERE w.ticker = ${ticker}
        AND u.telegram_chat_id IS NOT NULL
    `;
    return rows.map((r) => r.telegram_chat_id).filter(Boolean);
  } catch (err) {
    console.error(`[poller] Failed to get watchlist for ${ticker}:`, err);
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    return adminChatId ? [adminChatId] : [];
  }
}

async function sendTelegramAlerts(signal: {
  ticker: string;
  company_name: string;
  insider: string;
  role: string;
  action: string;
  shares: number;
  total_value: number;
  explanation: string | null;
}): Promise<void> {
  if (!isTelegramConfigured()) {
    console.log(`[poller] ${signal.ticker}: Telegram not configured, skipping alerts`);
    return;
  }

  const watchlist = await getWatchlistForTicker(signal.ticker);
  if (watchlist.length === 0) {
    console.log(`[poller] ${signal.ticker}: no users watching, skipping alerts`);
    return;
  }

  const actionText = signal.action.toUpperCase() === "SELL" ? "sold" : "bought";
  const valueText =
    signal.total_value >= 1_000_000
      ? `$${(signal.total_value / 1_000_000).toFixed(1)}M`
      : `$${signal.total_value.toLocaleString()}`;

  const message = `🚨 <b>911Stock Alert</b>

${signal.insider} (${signal.role}) at ${signal.company_name} (${signal.ticker}) just ${actionText} ${signal.shares.toLocaleString()} shares (${valueText})

${signal.explanation || "Analysis pending."}`;

  for (const chatId of watchlist) {
    try {
      const result = await sendTelegramMessage(chatId, message);
      if (result.success) {
        console.log(`[poller] ${signal.ticker}: alert sent to chat ${chatId}`);
      } else {
        console.error(`[poller] ${signal.ticker}: failed to send alert to chat ${chatId}`);
      }
    } catch (err) {
      console.error(`[poller] ${signal.ticker}: Telegram send error for ${chatId}:`, err);
    }
  }
}

main().catch((err) => {
  console.error("[poller] Fatal error:", err);
  process.exit(1);
});
