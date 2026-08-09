import { useSyncExternalStore } from 'react';

// Bil-läge NIVÅ 1 (rutt-korridor): en kurerad väg (viking_roads) + objekt inom en justerbar
// buffert längs vägen. Extern store enligt samma mönster som useRoadtrip/useNearMe: store ⇄
// kart-hook (useMapCarRoute ritar linje + medaljonger med klustring) ⇄ kontroll-UI (CarRouteMode).
// SKILT från roadtrip-läget (Nivå 3, GPS→geokodat mål): detta är kurerade rutter utan GPS.

export interface CarRouteMeta { id: string; name: string; length_km: number | null }
export interface CarRouteFeature {
  feature_type: string; feature_id: string; name: string;
  lat: number; lng: number; dist_m: number; frac_along: number;
  significance: number; prominent: boolean;
}

interface State {
  open: boolean;            // bil-läget aktivt (kontroll öppen)
  route: CarRouteMeta | null;
  line: [number, number][]; // [lat,lng]-par för rutt-linjen
  features: CarRouteFeature[];
  bufferM: number;          // korridorbredd (halva) i meter
  loading: boolean;
}

const DEFAULT_BUFFER_M = 500;
let state: State = { open: false, route: null, line: [], features: [], bufferM: DEFAULT_BUFFER_M, loading: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const openCarRoute = () => { if (!state.open) { state = { ...state, open: true }; emit(); } };
export const closeCarRoute = () => { state = { ...state, open: false, route: null, line: [], features: [] }; emit(); };
export const setCarRoute = (route: CarRouteMeta | null) => { state = { ...state, route, line: [], features: [], loading: !!route }; emit(); };
export const setCarRouteLine = (line: [number, number][]) => { state = { ...state, line }; emit(); };
export const setCarRouteFeatures = (features: CarRouteFeature[], loading = false) => { state = { ...state, features, loading }; emit(); };
export const setCarRouteBuffer = (bufferM: number) => { if (state.bufferM !== bufferM) { state = { ...state, bufferM }; emit(); } };
export const setCarRouteLoading = (loading: boolean) => { if (state.loading !== loading) { state = { ...state, loading }; emit(); } };

export const useCarRoute = () => useSyncExternalStore(subscribe, () => state);
