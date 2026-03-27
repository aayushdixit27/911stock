import type { Signal } from "@/lib/signals";

let _lastSignal: Signal | null = null;

export function setLastSignal(signal: Signal): void {
  _lastSignal = signal;
}

export function getLastSignal(): Signal | null {
  return _lastSignal;
}
