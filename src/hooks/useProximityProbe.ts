import { useSyncExternalStore } from 'react';

// Delad "omkrets"-sond: en vald punkt (kyrka/fornborg) + radie. Kartlagret ritar
// cirkeln och hämtar närliggande lager (ortnamn/kulturlager/runstenar/fort) via
// features_near_point-RPC. Radien går att ställa dynamiskt (Daniel: ~9 km default).

export interface Probe { lat: number; lng: number; label: string }
interface ProbeState { probe: Probe | null; radiusKm: number }

let state: ProbeState = { probe: null, radiusKm: 9 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setProbe = (lat: number, lng: number, label: string) => {
  state = { ...state, probe: { lat, lng, label } };
  emit();
};
export const clearProbe = () => { state = { ...state, probe: null }; emit(); };
export const setProbeRadiusKm = (km: number) => {
  state = { ...state, radiusKm: Math.max(1, Math.min(30, km)) };
  emit();
};

export const useProximityProbe = () => useSyncExternalStore(subscribe, () => state);

// Exponera för Leaflet-popup-knappar (HTML-strängar utanför React-trädet).
if (typeof window !== 'undefined') {
  (window as any).setProximityProbe = (lat: number, lng: number, label: string) => setProbe(lat, lng, label);
}
