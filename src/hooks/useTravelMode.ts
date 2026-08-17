import { useSyncExternalStore } from 'react';

// Delat färdsätt (Gå/Cykla/Kör) — EN källa för både Near me och mobil-legenden, så att
// "läget man rör sig på" är detsamma överallt. Extern store, samma mönster som useDrivingMode.
export type TravelMode = 'foot' | 'bike' | 'car' | 'boat';

const KEY = 'vikingage_travel_mode_v1';
const loadMode = (): TravelMode => {
  try { const v = localStorage.getItem(KEY); return v === 'bike' || v === 'car' || v === 'boat' ? v : 'foot'; } catch { return 'foot'; }
};
let mode: TravelMode = typeof window !== 'undefined' ? loadMode() : 'foot';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setTravelMode = (m: TravelMode) => {
  if (mode !== m) { mode = m; try { localStorage.setItem(KEY, m); } catch { /* privat läge */ } emit(); }
};
export const getTravelMode = () => mode;
export const useTravelMode = () => useSyncExternalStore(subscribe, () => mode, () => mode);

export const TRAVEL_MODE_LABELS: Record<TravelMode, { sv: string; en: string; icon: string }> = {
  foot: { sv: 'Gå', en: 'Walk', icon: '🚶' },
  bike: { sv: 'Cykla', en: 'Cycle', icon: '🚴' },
  car: { sv: 'Kör', en: 'Car', icon: '🚗' },
  boat: { sv: 'Båt', en: 'Boat', icon: '⛵' },
};
