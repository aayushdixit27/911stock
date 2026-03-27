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
