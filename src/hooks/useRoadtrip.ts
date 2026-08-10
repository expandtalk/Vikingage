import { useSyncExternalStore } from 'react';
import type { RouteResult } from '@/services/routing';

// Roadtrip-läge (bil): skriv ett mål → geokoda → rita bilrutt + "sevärt längs vägen"
// (korridorsökning). Extern store enligt samma mönster som useNearMe/useRuler: store ⇄
// kart-hook (useMapRoadtrip ritar rutt+korridor+målmarkör) ⇄ kontroll-UI (NearMeControl).
export interface RoadtripDest { lat: number; lng: number; label: string }
export interface AlongRouteFeature {
  feature_type: string; feature_id: string; label: string; lat: number; lng: number;
  detour_km: number; frac_along: number; significance: number; score: number; rank_reason: string;
}
type Status = 'idle' | 'searching' | 'done' | 'error';
interface State {
  dest: RoadtripDest | null; route: RouteResult | null;
  corridor: AlongRouteFeature[]; status: Status; error: string | null;
}

// Persistens (bug 1a): rutten ska överleva mobil bakgrundspaus/reload. Endast dest/route/corridor
// sparas — inga transienta UI-flaggor (status/error) — i sessionStorage (rensas när fliken stängs).
const STORAGE_KEY = 'vikingage_roadtrip_v1';

interface PersistedRoadtrip {
  dest: RoadtripDest | null;
  route: RouteResult | null;
  corridor: AlongRouteFeature[];
}

const loadPersisted = (): PersistedRoadtrip | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      dest: parsed.dest ?? null,
      route: parsed.route ?? null,
      corridor: Array.isArray(parsed.corridor) ? parsed.corridor : [],
    };
  } catch {
    return null;
  }
};

const persist = (s: State) => {
  if (typeof window === 'undefined') return;
  try {
    const payload: PersistedRoadtrip = { dest: s.dest, route: s.route, corridor: s.corridor };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // kvot/serialisering — icke-kritiskt, rutten finns kvar i minnet under sessionen
  }
};

const persisted = loadPersisted();
let state: State = persisted && (persisted.dest || persisted.route)
  ? { dest: persisted.dest, route: persisted.route, corridor: persisted.corridor, status: persisted.dest && persisted.route ? 'done' : 'idle', error: null }
  : { dest: null, route: null, corridor: [], status: 'idle', error: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setRoadtripSearching = () => { state = { ...state, status: 'searching', error: null }; emit(); };
export const setRoadtripResult = (dest: RoadtripDest, route: RouteResult) => { state = { ...state, dest, route, status: 'done', error: null }; persist(state); emit(); };
export const setRoadtripCorridor = (corridor: AlongRouteFeature[]) => { state = { ...state, corridor }; persist(state); emit(); };
export const setRoadtripError = (error: string) => { state = { ...state, status: 'error', error }; emit(); };
export const clearRoadtrip = () => {
  state = { dest: null, route: null, corridor: [], status: 'idle', error: null };
  if (typeof window !== 'undefined') {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }
  emit();
};

export const useRoadtrip = () => useSyncExternalStore(subscribe, () => state);
