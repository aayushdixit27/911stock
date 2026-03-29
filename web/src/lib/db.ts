import postgres from "postgres";
import crypto from "node:crypto";

// ── Connection ─────────────────────────────────────────────────────────────

let _sql: ReturnType<typeof postgres> | null = null;

/** Lazy singleton. Returns null when DATABASE_URL is unset. */
export function getSql(): ReturnType<typeof postgres> | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!_sql) {
    _sql = postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 30 });
  }
  return _sql;
}

// ── Types ───────────────────────────────────────────────────────────────────

export type DBWatchlistItem = {
  id: string;
  user_id: string;
  ticker: string;
  added_at: Date;
};

export type DBSignal = {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  insider: string;
  role: string;
  action: string;
  shares: number;
  price_per_share: number;
  total_value: number;
  date: string;
  filed_at: string;
  scheduled_10b5_1: boolean;
  last_transaction_months_ago: number;
  position_reduced_pct: number;
  score: number;
  explanation: string | null;
  alerted: boolean;
  created_at?: Date;
  // EDGAR filing ID for deduplication
  edgar_filing_id?: string | null;
};

export type DBAlert = {
  id: string;
  signal_id: string;
  ticker: string;
  call_id: string | null;
  explanation: string;
  created_at?: Date;
};

export type DBTrade = {
  id: string;
  signal_id: string | null;
  ticker: string;
  action: string;
  shares_before: number;
  shares_after: number;
  shares_sold: number;
  price_per_share: number;
  total_value: number;
  reduction_pct: number;
  order_id: string;
  approval_method: string;
  approved_at: Date;
};

export type DBPortfolioPosition = {
  ticker: string;
  shares: number;
  avg_cost: number;
  updated_at: Date;
};

export type DBPortfolioWithLastTrade = DBPortfolioPosition & {
  lastTrade: DBTrade | null;
};

export type DBLearning = {
  id: string;
  signal_id: string;
  ticker: string;
  pattern_match_count: number;
  avg_historical_drop: number;
  action_taken: string;
  user_approved: boolean;
  notes: string | null;
};

// ── Migration ───────────────────────────────────────────────────────────────

let _migrated = false;

export async function migrate(): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");
  if (_migrated) return;

  // ── Auth Tables (for NextAuth.js) ───────────────────────────────────────────

  // Users table - core user data
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id              TEXT PRIMARY KEY,
      name            TEXT,
      email           TEXT UNIQUE,
      email_verified  TIMESTAMPTZ,
      image           TEXT,
      password_hash   TEXT,
      tier            TEXT NOT NULL DEFAULT 'free',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Accounts table - for OAuth providers
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id                    TEXT PRIMARY KEY,
      user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type                  TEXT NOT NULL,
      provider              TEXT NOT NULL,
      provider_account_id   TEXT NOT NULL,
      refresh_token         TEXT,
      access_token          TEXT,
      expires_at            BIGINT,
      id_token              TEXT,
      scope                 TEXT,
      session_state         TEXT,
      token_type            TEXT
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS accounts_provider_account_idx 
    ON accounts(provider, provider_account_id)
  `;

  // Sessions table - for database session strategy
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL UNIQUE,
      expires       TIMESTAMPTZ NOT NULL
    )
  `;

  // Verification tokens table - for email verification
  await sql`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier  TEXT NOT NULL,
      token       TEXT NOT NULL,
      expires     TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (identifier, token)
    )
  `;

  // ── Application Tables ─────────────────────────────────────────────────────

  // Add user_id columns to existing tables (migration for multi-tenancy)
  await sql`
    ALTER TABLE signals ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT ''
  `;

  // Add edgar_filing_id for deduplication
  await sql`
    ALTER TABLE signals ADD COLUMN IF NOT EXISTS edgar_filing_id TEXT
  `;

  await sql`
    ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_user_id_edgar_filing_id_key
  `;

  await sql`
    ALTER TABLE signals ADD CONSTRAINT signals_user_id_edgar_filing_id_key UNIQUE (user_id, edgar_filing_id)
  `;

  await sql`
    ALTER TABLE alerts ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT ''
  `;

  await sql`
    ALTER TABLE agent_learnings ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT ''
  `;

  await sql`
    ALTER TABLE trades ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT ''
  `;

  await sql`
    ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT ''
  `;

  // Change portfolio primary key to include user_id
  await sql`
    ALTER TABLE portfolio DROP CONSTRAINT IF EXISTS portfolio_pkey
  `;
  
  await sql`
    ALTER TABLE portfolio ADD PRIMARY KEY (user_id, ticker)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS signals (
      id                          TEXT PRIMARY KEY,
      user_id                     TEXT NOT NULL DEFAULT '',
      ticker                      TEXT NOT NULL,
      company_name                TEXT NOT NULL,
      insider                     TEXT NOT NULL,
      role                        TEXT NOT NULL,
      action                      TEXT NOT NULL,
      shares                      INTEGER NOT NULL,
      price_per_share             NUMERIC NOT NULL,
      total_value                 NUMERIC NOT NULL,
      date                        TEXT NOT NULL,
      filed_at                    TEXT NOT NULL,
      scheduled_10b5_1            BOOLEAN NOT NULL DEFAULT false,
      last_transaction_months_ago INTEGER NOT NULL,
      position_reduced_pct        INTEGER NOT NULL,
      score                       INTEGER NOT NULL DEFAULT 0,
      explanation                 TEXT,
      alerted                     BOOLEAN NOT NULL DEFAULT false,
      edgar_filing_id             TEXT,
      created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, edgar_filing_id)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS signals_user_id_idx ON signals(user_id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS alerts (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL DEFAULT '',
      signal_id   TEXT NOT NULL REFERENCES signals(id),
      ticker      TEXT NOT NULL,
      call_id     TEXT,
      explanation TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON alerts(user_id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS agent_learnings (
      id                   TEXT PRIMARY KEY,
      user_id              TEXT NOT NULL DEFAULT '',
      signal_id            TEXT NOT NULL REFERENCES signals(id),
      ticker               TEXT NOT NULL,
      pattern_match_count  INTEGER NOT NULL DEFAULT 0,
      avg_historical_drop  NUMERIC NOT NULL DEFAULT 0,
      action_taken         TEXT NOT NULL,
      user_approved        BOOLEAN NOT NULL DEFAULT false,
      notes                TEXT,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS agent_learnings_user_id_idx ON agent_learnings(user_id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trades (
      id               TEXT PRIMARY KEY,
      user_id          TEXT NOT NULL DEFAULT '',
      signal_id        TEXT REFERENCES signals(id),
      ticker           TEXT NOT NULL,
      action           TEXT NOT NULL,
      shares_before    INTEGER NOT NULL,
      shares_after     INTEGER NOT NULL,
      shares_sold      INTEGER NOT NULL,
      price_per_share  NUMERIC NOT NULL,
      total_value      NUMERIC NOT NULL,
      reduction_pct    INTEGER NOT NULL,
      order_id         TEXT NOT NULL,
      approval_method  TEXT NOT NULL,
      approved_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS trades_user_id_idx ON trades(user_id)
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS trades_signal_id_unique
    ON trades(signal_id)
    WHERE signal_id IS NOT NULL
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS portfolio (
      user_id     TEXT NOT NULL DEFAULT '',
      ticker      TEXT NOT NULL,
      shares      INTEGER NOT NULL,
      avg_cost    NUMERIC NOT NULL DEFAULT 0,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, ticker)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS portfolio_user_id_idx ON portfolio(user_id)
  `;

  // Watchlist table - per-user watchlist CRUD
  await sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      id        TEXT PRIMARY KEY,
      user_id   TEXT NOT NULL,
      ticker    TEXT NOT NULL,
      added_at  TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, ticker)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id)
  `;

  // Seed the SMCI demo signal (with empty user_id for backward compatibility)
  await sql`
    INSERT INTO signals
      (id, user_id, ticker, company_name, insider, role, action, shares,
       price_per_share, total_value, date, filed_at,
       scheduled_10b5_1, last_transaction_months_ago,
       position_reduced_pct, score, explanation, alerted)
    VALUES
      ('smci-ceo-sell-20260319', '', 'SMCI', 'Super Micro Computer',
       'Charles Liang', 'CEO', 'SELL', 50000, 42.50, 2125000,
       '2026-03-19', '2026-03-19T16:30:00Z',
       false, 14, 18, 10, null, false)
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO portfolio (user_id, ticker, shares, avg_cost)
    VALUES
      ('', 'SMCI', 1000, 42.50),
      ('', 'TSLA', 500, 285.20),
      ('', 'NVDA', 200, 142.80)
    ON CONFLICT (user_id, ticker) DO NOTHING
  `;

  _migrated = true;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function withDb<T>(fn: (sql: ReturnType<typeof postgres>) => Promise<T>): Promise<T> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");
  await migrate();
  return fn(sql);
}

function toNumber(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function normalizeTrade(
  row: Omit<DBTrade, "price_per_share" | "total_value"> & {
    price_per_share: number | string;
    total_value: number | string;
  }
): DBTrade {
  return {
    ...row,
    price_per_share: toNumber(row.price_per_share),
    total_value: toNumber(row.total_value),
  };
}

function normalizePortfolioPosition(
  row: Omit<DBPortfolioPosition, "avg_cost"> & { avg_cost: number | string }
): DBPortfolioPosition {
  return {
    ...row,
    avg_cost: toNumber(row.avg_cost),
  };
}

// ── Operations ───────────────────────────────────────────────────────────────

export async function insertSignal(signal: DBSignal, userId?: string): Promise<void> {
  await withDb((sql) => sql`
    INSERT INTO signals
      (id, user_id, ticker, company_name, insider, role, action, shares,
       price_per_share, total_value, date, filed_at,
       scheduled_10b5_1, last_transaction_months_ago,
       position_reduced_pct, score, explanation, alerted, edgar_filing_id)
    VALUES
      (${signal.id}, ${userId ?? signal.user_id ?? ''}, ${signal.ticker}, ${signal.company_name},
       ${signal.insider}, ${signal.role}, ${signal.action},
       ${signal.shares}, ${signal.price_per_share}, ${signal.total_value},
       ${signal.date}, ${signal.filed_at}, ${signal.scheduled_10b5_1},
       ${signal.last_transaction_months_ago}, ${signal.position_reduced_pct},
       ${signal.score}, ${signal.explanation ?? null}, ${signal.alerted}, ${signal.edgar_filing_id ?? null})
    ON CONFLICT (user_id, edgar_filing_id) DO NOTHING
  `);
}

export async function getLatestSignal(userId: string, ticker?: string): Promise<DBSignal | null> {
  const rows = await withDb((sql) =>
    ticker
      ? sql<DBSignal[]>`
          SELECT * FROM signals
          WHERE user_id = ${userId} AND ticker = ${ticker}
          ORDER BY created_at DESC LIMIT 1`
      : sql<DBSignal[]>`
          SELECT * FROM signals
          WHERE user_id = ${userId}
          ORDER BY score DESC, created_at DESC LIMIT 1`
  );
  return rows[0] ?? null;
}

export async function getSignalById(userId: string, id: string): Promise<DBSignal | null> {
  const rows = await withDb((sql) => sql<DBSignal[]>`
    SELECT * FROM signals WHERE user_id = ${userId} AND id = ${id} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function getRecentSignals(userId: string, limit = 20): Promise<DBSignal[]> {
  return withDb((sql) => sql<DBSignal[]>`
    SELECT * FROM signals
    WHERE user_id = ${userId}
    AND created_at > now() - interval '7 days'
    ORDER BY score DESC, created_at DESC
    LIMIT ${limit}
  `);
}

export async function markSignalAlerted(userId: string, id: string): Promise<void> {
  await withDb((sql) => sql`
    UPDATE signals SET alerted = true WHERE user_id = ${userId} AND id = ${id}
  `);
}

export async function insertAlert(alert: DBAlert, userId: string): Promise<void> {
  await withDb((sql) => sql`
    INSERT INTO alerts (id, user_id, signal_id, ticker, call_id, explanation)
    VALUES (${alert.id}, ${userId}, ${alert.signal_id}, ${alert.ticker},
            ${alert.call_id ?? null}, ${alert.explanation})
  `);
}

export async function getRecentAlerts(userId: string, limit = 20): Promise<DBAlert[]> {
  return withDb((sql) => sql<DBAlert[]>`
    SELECT * FROM alerts 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export async function getTradeBySignalId(userId: string, signalId: string): Promise<DBTrade | null> {
  const rows = await withDb((sql) => sql<DBTrade[]>`
    SELECT * FROM trades
    WHERE user_id = ${userId} AND signal_id = ${signalId}
    LIMIT 1
  `);
  return rows[0] ? normalizeTrade(rows[0]) : null;
}

export async function executeTrade(params: {
  userId: string;
  signalId: string;
  ticker: string;
  reductionPct: number;
  pricePerShare: number;
  approvalMethod: string;
}): Promise<DBTrade> {
  const { userId, signalId, ticker, reductionPct, pricePerShare, approvalMethod } = params;

  return withDb((sql) =>
    sql.begin(async (tx) => {
      const trx = tx as unknown as ReturnType<typeof postgres>;

      const existing = await trx<DBTrade[]>`
        SELECT * FROM trades
        WHERE user_id = ${userId} AND signal_id = ${signalId}
        LIMIT 1
      `;
      if (existing[0]) return normalizeTrade(existing[0]);

      const portfolioRows = await trx<DBPortfolioPosition[]>`
        SELECT * FROM portfolio
        WHERE user_id = ${userId} AND ticker = ${ticker}
        FOR UPDATE
      `;
      const position = portfolioRows[0];
      if (!position) throw new Error(`No position found for ${ticker}`);

      const existingAfterLock = await trx<DBTrade[]>`
        SELECT * FROM trades
        WHERE user_id = ${userId} AND signal_id = ${signalId}
        LIMIT 1
      `;
      if (existingAfterLock[0]) return normalizeTrade(existingAfterLock[0]);

      const sharesBefore = position.shares;
      const sharesSold = Math.round(sharesBefore * (reductionPct / 100));
      const sharesAfter = sharesBefore - sharesSold;
      const totalValue = Number((sharesSold * pricePerShare).toFixed(2));
      const orderId = `ORD-${Date.now()}-${ticker}`;

      const inserted = await trx<DBTrade[]>`
        INSERT INTO trades (
          id,
          user_id,
          signal_id,
          ticker,
          action,
          shares_before,
          shares_after,
          shares_sold,
          price_per_share,
          total_value,
          reduction_pct,
          order_id,
          approval_method
        )
        VALUES (
          ${newId()},
          ${userId},
          ${signalId},
          ${ticker},
          ${"SELL"},
          ${sharesBefore},
          ${sharesAfter},
          ${sharesSold},
          ${pricePerShare},
          ${totalValue},
          ${reductionPct},
          ${orderId},
          ${approvalMethod}
        )
        RETURNING *
      `;

      await trx`
        UPDATE portfolio
        SET shares = ${sharesAfter}, updated_at = now()
        WHERE user_id = ${userId} AND ticker = ${ticker}
      `;

      return normalizeTrade(inserted[0]);
    })
  );
}

export async function getLatestTrade(userId: string): Promise<DBTrade | null> {
  const rows = await withDb((sql) => sql<DBTrade[]>`
    SELECT * FROM trades
    WHERE user_id = ${userId}
    ORDER BY approved_at DESC
    LIMIT 1
  `);
  return rows[0] ? normalizeTrade(rows[0]) : null;
}

export async function getPortfolio(userId: string): Promise<DBPortfolioWithLastTrade[]> {
  const rows = await withDb((sql) => sql<Array<
    DBPortfolioPosition & {
      trade_id: string | null;
      signal_id: string | null;
      action: string | null;
      shares_before: number | null;
      shares_after: number | null;
      shares_sold: number | null;
      price_per_share: number | string | null;
      total_value: number | string | null;
      reduction_pct: number | null;
      order_id: string | null;
      approval_method: string | null;
      approved_at: Date | null;
    }
  >>`
    SELECT
      p.ticker,
      p.shares,
      p.avg_cost,
      p.updated_at,
      t.id AS trade_id,
      t.signal_id,
      t.action,
      t.shares_before,
      t.shares_after,
      t.shares_sold,
      t.price_per_share,
      t.total_value,
      t.reduction_pct,
      t.order_id,
      t.approval_method,
      t.approved_at
    FROM portfolio p
    LEFT JOIN LATERAL (
      SELECT *
      FROM trades t
      WHERE t.user_id = p.user_id AND t.ticker = p.ticker
      ORDER BY t.approved_at DESC
      LIMIT 1
    ) t ON true
    WHERE p.user_id = ${userId}
    ORDER BY p.ticker
  `);

  return rows.map((row) => ({
    ...normalizePortfolioPosition(row),
    lastTrade: row.trade_id
      ? normalizeTrade({
          id: row.trade_id,
          signal_id: row.signal_id,
          ticker: row.ticker,
          action: row.action ?? "SELL",
          shares_before: row.shares_before ?? 0,
          shares_after: row.shares_after ?? 0,
          shares_sold: row.shares_sold ?? 0,
          price_per_share: row.price_per_share ?? 0,
          total_value: row.total_value ?? 0,
          reduction_pct: row.reduction_pct ?? 0,
          order_id: row.order_id ?? "",
          approval_method: row.approval_method ?? "",
          approved_at: row.approved_at ?? new Date(0),
        })
      : null,
  }));
}

export async function insertLearning(learning: DBLearning, userId: string): Promise<void> {
  await withDb((sql) => sql`
    INSERT INTO agent_learnings
      (id, user_id, signal_id, ticker, pattern_match_count, avg_historical_drop,
       action_taken, user_approved, notes)
    VALUES
      (${learning.id}, ${userId}, ${learning.signal_id}, ${learning.ticker},
       ${learning.pattern_match_count}, ${learning.avg_historical_drop},
       ${learning.action_taken}, ${learning.user_approved},
       ${learning.notes ?? null})
    ON CONFLICT (id) DO NOTHING
  `);
}

export async function getLearningCount(userId: string, ticker: string): Promise<number> {
  const rows = await withDb((sql) => sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM agent_learnings 
    WHERE user_id = ${userId} AND ticker = ${ticker}
  `);
  return parseInt(rows[0]?.count ?? "0", 10);
}

// ── Watchlist Operations ────────────────────────────────────────────────────

export async function getWatchlist(userId: string): Promise<DBWatchlistItem[]> {
  return withDb((sql) => sql<DBWatchlistItem[]>`
    SELECT * FROM watchlist
    WHERE user_id = ${userId}
    ORDER BY added_at DESC
  `);
}

export async function addToWatchlist(userId: string, ticker: string): Promise<DBWatchlistItem> {
  const id = newId();
  const rows = await withDb((sql) => sql<DBWatchlistItem[]>`
    INSERT INTO watchlist (id, user_id, ticker)
    VALUES (${id}, ${userId}, ${ticker})
    ON CONFLICT (user_id, ticker) DO UPDATE SET ticker = ${ticker}
    RETURNING *
  `);
  return rows[0];
}

export async function removeFromWatchlist(userId: string, ticker: string): Promise<void> {
  await withDb((sql) => sql`
    DELETE FROM watchlist
    WHERE user_id = ${userId} AND ticker = ${ticker}
  `);
}

export async function getWatchlistCount(userId: string): Promise<number> {
  const rows = await withDb((sql) => sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM watchlist
    WHERE user_id = ${userId}
  `);
  return parseInt(rows[0]?.count ?? "0", 10);
}

export function newId(): string {
  return crypto.randomUUID();
}
