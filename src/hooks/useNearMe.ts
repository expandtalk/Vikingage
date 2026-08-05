import { useSyncExternalStore } from 'react';

// "Near me" — mobilt (och desktop) närhetsuppslag: "jag står här, vad finns omkring mig?".
// Extern store enligt samma mönster som useRuler: store ⇄ kart-hook (useMapNearMe ritar
// position/radie/träffar) ⇄ kontroll-UI (NearMeControl). INTE en följande prick — positionen
// hämtas på begäran och är en referenspunkt för närhetslistan, inte ett navigeringsläge.
export interface NearMePos { lat: number; lng: number; accuracy: number }
export interface NearMeFeature {
  feature_type: string; feature_id: string; label: string;
  lat: number; lng: number; distance_km: number;
  parish?: string | null; source_uri?: string | null; // heritage: socken + Fornsök/kulturarvsdata-id
}
interface State {
  open: boolean;
  pos: NearMePos | null;
  radiusKm: number;
  locating: boolean;
  error: string | null;
  results: NearMeFeature[];
  resultsLoading: boolean;
}
// Default 5 km = en gåendes räckvidd (Daniel). Slider + färdsätts-chips justerar.
// Radien sparas mellan besök (localStorage) så inställningen minns sig.
const RKEY = 'vikingage_nearme_radius_v1';
const loadRadius = (): number => { try { const v = Number(localStorage.getItem(RKEY)); return isFinite(v) && v > 0 ? v : 5; } catch { return 5; } };
let state: State = { open: false, pos: null, radiusKm: typeof window !== 'undefined' ? loadRadius() : 5, locating: false, error: null, results: [], resultsLoading: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const openNearMe = () => { state = { ...state, open: true }; emit(); };
export const closeNearMe = () => { state = { open: false, pos: null, radiusKm: state.radiusKm, locating: false, error: null, results: [], resultsLoading: false }; emit(); };
export const setNearMeLocating = (v: boolean) => { state = { ...state, locating: v, error: v ? null : state.error }; emit(); };
export const setNearMePos = (lat: number, lng: number, accuracy: number) => { state = { ...state, pos: { lat, lng, accuracy }, error: null, locating: false }; emit(); };
export const setNearMeError = (error: string) => { state = { ...state, error, locating: false }; emit(); };
export const setNearMeRadiusKm = (radiusKm: number) => { state = { ...state, radiusKm }; try { localStorage.setItem(RKEY, String(radiusKm)); } catch { /* privat läge */ } emit(); };
export const setNearMeResults = (results: NearMeFeature[], resultsLoading: boolean) => { state = { ...state, results, resultsLoading }; emit(); };

export const useNearMe = () => useSyncExternalStore(subscribe, () => state);
