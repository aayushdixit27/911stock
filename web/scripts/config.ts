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

/** Fallback chat ID when no users are in the watchlist (for testing/MVP) */
export const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
