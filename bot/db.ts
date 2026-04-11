// Ghost DB (Postgres) connection for Telegram bot
// Shares the same database as the web app

import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) throw new Error("DATABASE_URL not set");
    _sql = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 30 });
  }
  return _sql;
}

// ── Telegram user → watchlist mapping ─────────────────────────────────────────
// We use a separate table for Telegram users since they don't have web auth accounts

export async function migrate() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS telegram_users (
      chat_id BIGINT PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS telegram_watchlist (
      chat_id BIGINT NOT NULL,
      ticker TEXT NOT NULL,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (chat_id, ticker)
    )
  `;
  console.log("[db] Telegram tables ready");
}

export async function upsertUser(chatId: number, username?: string, firstName?: string) {
  const sql = getSql();
  await sql`
    INSERT INTO telegram_users (chat_id, username, first_name)
    VALUES (${chatId}, ${username ?? null}, ${firstName ?? null})
    ON CONFLICT (chat_id) DO UPDATE SET
      username = COALESCE(EXCLUDED.username, telegram_users.username),
      first_name = COALESCE(EXCLUDED.first_name, telegram_users.first_name)
  `;
}

export async function getWatchlist(chatId: number): Promise<string[]> {
  const sql = getSql();
  const rows = await sql<{ ticker: string }[]>`
    SELECT ticker FROM telegram_watchlist WHERE chat_id = ${chatId} ORDER BY added_at
  `;
  return rows.map((r) => r.ticker);
}

export async function addToWatchlist(chatId: number, ticker: string): Promise<boolean> {
  const sql = getSql();
  const count = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM telegram_watchlist WHERE chat_id = ${chatId}
  `;
  if (parseInt(count[0].count) >= 5) return false;

  await sql`
    INSERT INTO telegram_watchlist (chat_id, ticker)
    VALUES (${chatId}, ${ticker.toUpperCase()})
    ON CONFLICT (chat_id, ticker) DO NOTHING
  `;
  return true;
}

export async function removeFromWatchlist(chatId: number, ticker: string): Promise<boolean> {
  const sql = getSql();
  const result = await sql`
    DELETE FROM telegram_watchlist WHERE chat_id = ${chatId} AND ticker = ${ticker.toUpperCase()}
  `;
  return result.count > 0;
}

// ── For the poller: who watches a given ticker? ──────────────────────────────

export async function getWatchersForTicker(ticker: string): Promise<number[]> {
  const sql = getSql();
  const rows = await sql<{ chat_id: number }[]>`
    SELECT chat_id FROM telegram_watchlist WHERE ticker = ${ticker.toUpperCase()}
  `;
  return rows.map((r) => r.chat_id);
}

// ── Get all unique tickers being watched ─────────────────────────────────────

export async function getAllWatchedTickers(): Promise<string[]> {
  const sql = getSql();
  const rows = await sql<{ ticker: string }[]>`
    SELECT DISTINCT ticker FROM telegram_watchlist
  `;
  return rows.map((r) => r.ticker);
}
