# EDGAR Poller Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone Node.js script that polls SEC EDGAR every 60s, scores insider filings, generates LLM context, stores in Ghost DB, and sends Telegram alerts for high-score signals.

**Architecture:** Single `poller.ts` script in `web/scripts/` that imports existing modules from `web/src/lib/` (edgar, signals, gemini, db, telegram). Runs via `npx tsx scripts/poller.ts`. Deployed on Railway as a persistent Node service.

**Tech Stack:** TypeScript, tsx (runtime), postgres (Ghost DB), OpenAI/TrueFoundry (Gemini), Telegram Bot API

---

### Task 1: Scaffold poller script and ticker config

**Files:**
- Create: `web/scripts/poller.ts`
- Create: `web/scripts/config.ts`

**Step 1: Create ticker config**

```typescript
// web/scripts/config.ts

/** Tickers to poll. Each entry maps to a CIK in edgar.ts */
export const WATCHED_TICKERS = ["SMCI", "TSLA", "NVDA"] as const;

/** Minimum signal score (0-10) to trigger an alert */
export const ALERT_THRESHOLD = 7;

/** Poll interval in milliseconds */
export const POLL_INTERVAL_MS = 60_000;

/** Required env vars — validated at startup */
export const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "TRUEFOUNDRY_API_KEY",
  "TELEGRAM_BOT_TOKEN",
] as const;
```

**Step 2: Create poller entry point with boilerplate**

```typescript
// web/scripts/poller.ts
import { WATCHED_TICKERS, ALERT_THRESHOLD, POLL_INTERVAL_MS, REQUIRED_ENV_VARS } from "./config";
import { fetchRecentForm4s } from "../src/lib/edgar";
import { scoreSignal } from "../src/lib/signals";
import { analyzeSignal } from "../src/lib/gemini";
import { getSql, migrate, insertSignal, getWatchlist, newId } from "../src/lib/db";
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
  // To be implemented in Task 2
}

main().catch((err) => {
  console.error("[poller] Fatal error:", err);
  process.exit(1);
});
```

**Step 3: Add `tsx` as dev dependency if not present**

Run: `cd web && npm ls tsx 2>/dev/null || npm install -D tsx`

**Step 4: Verify the script starts cleanly**

Run: `cd web && npx tsx scripts/poller.ts`
Expected: Prints startup messages, connects to DB, then starts polling (will error on first cycle since `pollCycle` is empty — that's fine for now).

**Step 5: Commit**

```bash
cd /Users/bunyasit/dev/911stock
git add web/scripts/poller.ts web/scripts/config.ts
git commit -m "feat: scaffold EDGAR poller with config and startup validation"
```

---

### Task 2: Implement poll cycle with EDGAR fetch + DB dedup

**Files:**
- Modify: `web/scripts/poller.ts` (add `pollCycle` implementation)

**Step 1: Implement `pollCycle` function**

Replace the empty `pollCycle` in `poller.ts` with:

```typescript
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
        // Dedup: check if this filing already exists in DB
        const exists = await isFilingProcessed(ticker, filing.id);
        if (exists) {
          console.log(`[poller] ${ticker}: skipping duplicate ${filing.id}`);
          continue;
        }

        console.log(`[poller] ${ticker}: new filing detected — ${filing.insider} (${filing.role}) ${filing.action} ${filing.shares} shares`);
        newSignalsFound++;

        // Score the signal
        const score = scoreSignal(filing);
        console.log(`[poller] ${ticker}: score ${score}/10`);

        if (score >= ALERT_THRESHOLD) {
          await processHighScoreSignal(filing, score);
        } else {
          console.log(`[poller] ${ticker}: score ${score} below threshold ${ALERT_THRESHOLD}, skipping alert`);
        }
      }
    } catch (err) {
      console.error(`[poller] Error polling ${ticker}:`, err);
    }
  }

  console.log(`[poller] ── Poll cycle complete: ${newSignalsFound} new filing(s) found ──`);
}
```

**Step 2: Add dedup helper**

Add above `pollCycle`:

```typescript
/** Check if a filing has already been processed (by edgar_filing_id) */
async function isFilingProcessed(ticker: string, edgarFilingId: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    const rows = await sql`SELECT id FROM signals WHERE edgar_filing_id = ${edgarFilingId} LIMIT 1`;
    return rows.length > 0;
  } catch (err) {
    console.error(`[poller] Dedup check error for ${edgarFilingId}:`, err);
    return false; // On error, process it (better duplicate than missed)
  }
}
```

**Step 3: Stub `processHighScoreSignal`**

Add below `pollCycle` (full implementation in Task 3):

```typescript
async function processHighScoreSignal(
  filing: Awaited<ReturnType<typeof fetchRecentForm4s>>[number],
  score: number
): Promise<void> {
  console.log(`[poller] ${filing.ticker}: processing high-score signal (score: ${score})`);
  // To be implemented in Task 3
}
```

**Step 4: Verify compilation**

Run: `cd web && npx tsx scripts/poller.ts`
Expected: Runs one poll cycle, fetches EDGAR data, logs findings, no crashes.

**Step 5: Commit**

```bash
git add web/scripts/poller.ts
git commit -m "feat: implement poll cycle with EDGAR fetch and DB dedup"
```

---

### Task 3: Wire LLM analysis + DB insert for high-score signals

**Files:**
- Modify: `web/scripts/poller.ts` (complete `processHighScoreSignal`)

**Step 1: Implement `processHighScoreSignal`**

Replace the stub with:

```typescript
async function processHighScoreSignal(
  filing: Awaited<ReturnType<typeof fetchRecentForm4s>>[number],
  score: number
): Promise<void> {
  const ticker = filing.ticker;

  // 1. Generate LLM context
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
      null // No historical pattern data yet
    );
    console.log(`[poller] ${ticker}: LLM analysis: ${explanation}`);
  } catch (err) {
    console.error(`[poller] ${ticker}: LLM analysis failed, using fallback:`, err);
    explanation = `Insider ${filing.insider} (${filing.role}) filed Form 4 for ${filing.action} of ${filing.shares} shares. Analysis pending.`;
  }

  // 2. Map edgar.Signal → DBSignal
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

  // 3. Insert into DB
  try {
    await insertSignal(dbSignal, "");
    console.log(`[poller] ${ticker}: signal saved to DB (id: ${dbSignal.id})`);
  } catch (err) {
    console.error(`[poller] ${ticker}: failed to save signal to DB:`, err);
    return; // Don't send alert if not saved
  }

  // 4. Send Telegram alerts
  await sendTelegramAlerts(dbSignal);
}
```

**Step 2: Verify compilation**

Run: `cd web && npx tsx scripts/poller.ts`
Expected: On finding a new high-score filing, generates LLM context, saves to DB.

**Step 3: Commit**

```bash
git add web/scripts/poller.ts
git commit -m "feat: wire LLM analysis and DB insert for high-score signals"
```

---

### Task 4: Telegram alert delivery

**Files:**
- Modify: `web/scripts/poller.ts` (add `sendTelegramAlerts`)

**Step 1: Implement `sendTelegramAlerts`**

Add below `processHighScoreSignal`:

```typescript
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

  // Get all users watching this ticker
  const watchlist = await getWatchlistForTicker(signal.ticker);
  if (watchlist.length === 0) {
    console.log(`[poller] ${signal.ticker}: no users watching, skipping alerts`);
    return;
  }

  const actionText = signal.action.toUpperCase() === "SELL" ? "sold" : "bought";
  const valueText = signal.total_value >= 1_000_000
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
```

**Step 2: Add `getWatchlistForTicker` helper**

Add above `sendTelegramAlerts`:

```typescript
/** Get all Telegram chat IDs for users watching a specific ticker */
async function getWatchlistForTicker(ticker: string): Promise<string[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    // Query: get user_ids from watchlist for this ticker,
    // then get their telegram_chat_id from users table
    // For MVP: store telegram_chat_id in users.telegram_chat_id column
    // If column doesn't exist yet, fall back to a single ADMIN_CHAT_ID env var
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (adminChatId) {
      return [adminChatId];
    }
    // Fallback: check if users table has telegram_chat_id column
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
    // Fallback to admin chat ID
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    return adminChatId ? [adminChatId] : [];
  }
}
```

**Step 3: Add `TELEGRAM_ADMIN_CHAT_ID` to config**

Add to `web/scripts/config.ts`:

```typescript
/** Fallback chat ID when no users are in the watchlist (for testing/MVP) */
export const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
```

**Step 4: Verify**

Run: `cd web && TELEGRAM_ADMIN_CHAT_ID=<your_chat_id> npx tsx scripts/poller.ts`
Expected: On high-score signal, sends Telegram message to admin chat.

**Step 5: Commit**

```bash
git add web/scripts/poller.ts web/scripts/config.ts
git commit -m "feat: add Telegram alert delivery with watchlist lookup"
```

---

### Task 5: Add `telegram_chat_id` column to users table (migration)

**Files:**
- Modify: `web/src/lib/db.ts` (add column in `migrate()`)

**Step 1: Add migration in `migrate()`**

Add near the end of the `migrate()` function, before `_migrated = true`:

```typescript
  // Telegram chat ID for alert delivery
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS users_telegram_chat_id_idx ON users(telegram_chat_id)
    WHERE telegram_chat_id IS NOT NULL
  `;
```

**Step 2: Apply migration**

Run: `cd web && DATABASE_URL=<your_url> npx tsx -e "import { migrate } from './src/lib/db'; migrate().then(() => console.log('done'))"`

Expected: Column added, no errors.

**Step 3: Commit**

```bash
git add web/src/lib/db.ts
git commit -m "feat: add telegram_chat_id column to users table"
```

---

### Task 6: Add run script and Railway config

**Files:**
- Modify: `web/package.json` (add `poller` script)
- Create: `web/scripts/README.md`

**Step 1: Add npm script**

Add to `web/package.json` scripts:

```json
"poller": "tsx scripts/poller.ts"
```

**Step 2: Create scripts README**

```markdown
# 911Stock Scripts

## EDGAR Poller

Standalone Node.js script that polls SEC EDGAR every 60 seconds for new Form 4 insider trading filings.

### Local Development

```bash
cd web
npm run poller
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Ghost DB connection string |
| `TRUEFOUNDRY_API_KEY` | LLM gateway API key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | Fallback chat ID for alerts (optional) |

### Production (Railway)

1. Push to GitHub
2. Create new Railway service from repo
3. Set root directory to `web`
4. Set start command to `npx tsx scripts/poller.ts`
5. Configure environment variables
```

**Step 3: Commit**

```bash
git add web/package.json web/scripts/README.md
git commit -m "docs: add poller npm script and README"
```

---

### Task 7: End-to-end verification

**Step 1: Run full poller locally**

```bash
cd web
npx tsx scripts/poller.ts
```

**Step 2: Verify in logs:**
- `[poller] Starting EDGAR poller...`
- `[poller] Database connected and migrated`
- `[poller] ── Poll cycle started at ... ──`
- For each ticker: either `no recent Form 4 filings` or `new filing detected`
- For high-score signals: LLM analysis output, DB save confirmation, Telegram sent

**Step 3: Verify DB:**
```sql
SELECT id, ticker, insider, action, score, edgar_filing_id FROM signals ORDER BY created_at DESC LIMIT 5;
```

**Step 4: Verify Telegram:**
- Check that alert message was received on the configured chat

**Step 5: Commit (if any fixes needed)**
