import { useSyncExternalStore } from 'react';

// Persistent extern store för vald tidsperiod (så den kan synkas mot konto + överleva reload).
// null = "ej satt" → useExplorerData faller tillbaka på profilens defaultPeriod. Focus-coercion
// (rivers/inscriptions → viking_age) skriver via setTimePeriod precis som förut.
const KEY = 'vikingage_time_period_v1';
const listeners = new Set<() => void>();
let current: string | null = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();

export const getTimePeriod = (): string | null => current;
export const setTimePeriod = (v: string) => {
  if (!v || v === current) return;
  current = v;
  try { localStorage.setItem(KEY, v); } catch { /* privat läge */ }
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
export const useTimePeriod = (): string | null =>
  useSyncExternalStore(subscribe, () => current, () => current);
