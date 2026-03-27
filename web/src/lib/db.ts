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

export type DBSignal = {
  id: string;
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
};

export type DBAlert = {
  id: string;
  signal_id: string;
  ticker: string;
  call_id: string | null;
  explanation: string;
  created_at?: Date;
};

// ── Migration ───────────────────────────────────────────────────────────────

let _migrated = false;

export async function migrate(): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");
  if (_migrated) return;

  await sql`
    CREATE TABLE IF NOT EXISTS signals (
      id                          TEXT PRIMARY KEY,
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
      created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS alerts (
      id          TEXT PRIMARY KEY,
      signal_id   TEXT NOT NULL REFERENCES signals(id),
      ticker      TEXT NOT NULL,
      call_id     TEXT,
      explanation TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Seed the SMCI demo signal
  await sql`
    INSERT INTO signals
      (id, ticker, company_name, insider, role, action, shares,
       price_per_share, total_value, date, filed_at,
       scheduled_10b5_1, last_transaction_months_ago,
       position_reduced_pct, score, explanation, alerted)
    VALUES
      ('smci-ceo-sell-20260319', 'SMCI', 'Super Micro Computer',
       'Charles Liang', 'CEO', 'SELL', 50000, 42.50, 2125000,
       '2026-03-19', '2026-03-19T16:30:00Z',
       false, 14, 18, 10, null, false)
    ON CONFLICT (id) DO NOTHING
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

// ── Operations ───────────────────────────────────────────────────────────────

export async function insertSignal(signal: DBSignal): Promise<void> {
  await withDb((sql) => sql`
    INSERT INTO signals
      (id, ticker, company_name, insider, role, action, shares,
       price_per_share, total_value, date, filed_at,
       scheduled_10b5_1, last_transaction_months_ago,
       position_reduced_pct, score, explanation, alerted)
    VALUES
      (${signal.id}, ${signal.ticker}, ${signal.company_name},
       ${signal.insider}, ${signal.role}, ${signal.action},
       ${signal.shares}, ${signal.price_per_share}, ${signal.total_value},
       ${signal.date}, ${signal.filed_at}, ${signal.scheduled_10b5_1},
       ${signal.last_transaction_months_ago}, ${signal.position_reduced_pct},
       ${signal.score}, ${signal.explanation ?? null}, ${signal.alerted})
    ON CONFLICT (id) DO NOTHING
  `);
}

export async function getLatestSignal(ticker?: string): Promise<DBSignal | null> {
  const rows = await withDb((sql) =>
    ticker
      ? sql<DBSignal[]>`
          SELECT * FROM signals
          WHERE ticker = ${ticker}
          ORDER BY created_at DESC LIMIT 1`
      : sql<DBSignal[]>`
          SELECT * FROM signals
          ORDER BY score DESC, created_at DESC LIMIT 1`
  );
  return rows[0] ?? null;
}

export async function getRecentSignals(limit = 20): Promise<DBSignal[]> {
  return withDb((sql) => sql<DBSignal[]>`
    SELECT * FROM signals
    WHERE created_at > now() - interval '7 days'
    ORDER BY score DESC, created_at DESC
    LIMIT ${limit}
  `);
}

export async function markSignalAlerted(id: string): Promise<void> {
  await withDb((sql) => sql`
    UPDATE signals SET alerted = true WHERE id = ${id}
  `);
}

export async function insertAlert(alert: DBAlert): Promise<void> {
  await withDb((sql) => sql`
    INSERT INTO alerts (id, signal_id, ticker, call_id, explanation)
    VALUES (${alert.id}, ${alert.signal_id}, ${alert.ticker},
            ${alert.call_id ?? null}, ${alert.explanation})
  `);
}

export async function getRecentAlerts(limit = 20): Promise<DBAlert[]> {
  return withDb((sql) => sql<DBAlert[]>`
    SELECT * FROM alerts ORDER BY created_at DESC LIMIT ${limit}
  `);
}

export function newId(): string {
  return crypto.randomUUID();
}
