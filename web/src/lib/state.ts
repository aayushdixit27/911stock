import type { Signal } from "@/lib/signals";

let _lastSignal: Signal | null = null;

export function setLastSignal(signal: Signal): void {
  _lastSignal = signal;
}

export function getLastSignal(): Signal | null {
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
