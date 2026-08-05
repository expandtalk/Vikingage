import { useSyncExternalStore } from 'react';
import type { TravelMode } from './useTravelMode';

// Sparbara lager-presets per färdsätt (Gå/Cykla/Kör). localStorage → funkar för alla utan konto
// (konto-synk = senare freemium-lager). Event-drivet: sparas vid knapptryck, laddas vid läges-val
// — ALDRIG per render (undviker legend-toggle-invariant-buggen).
const KEY = 'vikingage_mode_presets_v1';
type Preset = { layers: Record<string, boolean>; savedAt: number };
type Presets = Partial<Record<TravelMode, Preset>>;

const read = (): Presets => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Presets; } catch { return {}; }
};
let cache: Presets = typeof window !== 'undefined' ? read() : {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ } };

/** Sparad lager-uppsättning för ett läge, eller null om ingen finns. */
export const getModePreset = (m: TravelMode): Record<string, boolean> | null => cache[m]?.layers ?? null;

export const saveModePreset = (m: TravelMode, layers: Record<string, boolean>) => {
  cache = { ...cache, [m]: { layers, savedAt: Date.now() } };
  persist(); emit();
};

export const clearModePreset = (m: TravelMode) => {
  const next: Presets = { ...cache }; delete next[m];
  cache = next; persist(); emit();
};

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/** Reaktiv: har detta läge en sparad egen vy? */
export const useHasModePreset = (m: TravelMode): boolean =>
  useSyncExternalStore(subscribe, () => !!cache[m], () => false);
