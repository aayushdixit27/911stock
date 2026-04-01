// Shared state for SSE and other routes
// Note: This is in-memory state, scoped per server instance
// For multi-user scoping, we track the last user ID

let _lastSignal: {
  id: string;
  ticker: string;
  companyName: string;
  insider: string;
  role: string;
  action: string;
  shares: number;
  price_per_share: number;
  total_value: number;
  date: string;
  filed: string;
  scheduled_10b5_1: boolean;
  last_transaction_months_ago: number;
  position_reduced_pct: number;
} | null = null;

export function setLastSignal(signal: typeof _lastSignal): void {
  _lastSignal = signal;
}

export function getLastSignal(): typeof _lastSignal {
  return _lastSignal;
}

let _lastUserId: string | null = null;
export function setLastUserId(id: string): void { _lastUserId = id; }
export function getLastUserId(): string | null { return _lastUserId; }

// ── CIBA state (shared between bland-webhook and initiate-ciba routes) ──
let _cibaReqId: string | null = null;
let _cibaStatus: "idle" | "pending" | "approved" | "denied" = "idle";

export function getCIBAReqId(): string | null { return _cibaReqId; }
export function getCIBAStatus() { return _cibaStatus; }
export function setCIBAReqId(id: string | null): void { _cibaReqId = id; }
export function setCIBAStatus(s: "idle" | "pending" | "approved" | "denied"): void { _cibaStatus = s; }
